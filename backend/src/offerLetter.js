const PDFDocument = require('pdfkit');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, GetCommand } = require('@aws-sdk/lib-dynamodb');

const s3 = new S3Client({ region: 'ap-south-1' });
const ses = new SESClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'ap-south-1' }));

exports.generate = async (event) => {
  try {
    console.log("Offer generation payload received:", event.body);
    const body = JSON.parse(event.body || '{}');
    const { applicationId, studentEmail, companyEmail, jobTitle, salary, joiningDate } = body;

    if (!applicationId || !studentEmail || !companyEmail || !jobTitle) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Missing required parameters: applicationId, studentEmail, companyEmail, jobTitle' })
      };
    }

    // ?? Performance Optimization: Fetch student and company records concurrently
    console.log(`Fetching profiles for Student: ${studentEmail} | Company: ${companyEmail}`);
    const [studentRes, companyRes] = await Promise.all([
      docClient.send(new GetCommand({ 
        TableName: 'PlacementPlatformStudents', 
        Key: { email: studentEmail.toLowerCase().trim() } 
      })),
      docClient.send(new GetCommand({ 
        TableName: 'PlacementPlatformCompanies', 
        Key: { email: companyEmail.toLowerCase().trim() } 
      }))
    ]);

    const student = studentRes.Item;
    const company = companyRes.Item;

    if (!student) {
      return { statusCode: 404, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: `Student document not found for email ${studentEmail}` }) };
    }
    if (!company) {
      return { statusCode: 404, headers: { 'Access-Control-Allow-Origin': '*' }, body: JSON.stringify({ error: `Company document not found for email ${companyEmail}` }) };
    }

    // ?? Constructing the Document Structure cleanly in memory buffers
    console.log("Generating layout structure binaries via PDFKit...");
    const doc = new PDFDocument({ margin: 60 });
    const chunks = [];
    
    doc.on('data', chunk => chunks.push(chunk));

    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);

      // Header Brand Frame
      doc.fontSize(22).font('Helvetica-Bold').text(company.companyName || company.name || 'Corporate Offer', { align: 'center' });
      doc.fontSize(10).font('Helvetica').text(company.website || 'Official Corporate Partner', { align: 'center' });
      doc.moveDown(2);
      
      // Document Identity Label
      doc.fontSize(18).font('Helvetica-Bold').text('OFFER LETTER', { align: 'center', underline: true });
      doc.moveDown(2);
      
      // Content Generation
      doc.fontSize(12).font('Helvetica').text(`Date: ${new Date().toLocaleDateString('en-IN')}`);
      doc.moveDown();
      doc.text(`Dear ${student.name || 'Candidate'},`);
      doc.moveDown();
      doc.text(`We are pleased to offer you the position of ${jobTitle} with our organization.`);
      doc.moveDown();
      doc.text(`Compensation Package: INR ${salary || 'As Mutually Discussed'} per annum`);
      doc.text(`Scheduled Joining Date: ${joiningDate || 'To Be Confirmed'}`);
      doc.moveDown(2);
      
      doc.text('Congratulations and welcome to the team!', { align: 'center' });
      doc.moveDown(3);
      
      // Sign-off signature footer
      doc.text('_______________________', { align: 'right' });
      doc.text(`${company.hrName || 'Human Resources Manager'}`, { align: 'right' });
      doc.text('HR Management Department', { align: 'right' });

      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);
    const key = `offers/${applicationId}.pdf`;

    // ?? Storing the final artifact securely inside S3
    console.log(`Uploading letter to S3 under key path: ${key}`);
    await s3.send(new PutObjectCommand({
      Bucket: process.env.RESUME_BUCKET,
      Key: key,
      Body: pdfBuffer,
      ContentType: 'application/pdf'
    }));

    // ?? Create a secure, authenticated download token link (Valid for 7 days maximum)
    const downloadUrl = await getSignedUrl(
      s3, 
      new GetObjectCommand({ Bucket: process.env.RESUME_BUCKET, Key: key }), 
      { expiresIn: 604800 }
    );

    // ?? Dispatch notice email using Amazon SES
    console.log(`Dispatching notification email directly to student target destination: ${studentEmail}`);
    await ses.send(new SendEmailCommand({
      Source: process.env.FROM_EMAIL,
      Destination: { ToAddresses: [studentEmail] },
      Message: {
        Subject: { Data: `Offer Letter Details from ${company.companyName || 'Corporate Partner'}` },
        Body: { 
          Text: { 
            Data: `Dear ${student.name || 'Candidate'},\n\nCongratulations! We are thrilled to share your official offer letter for the ${jobTitle} position.\n\nYou can access and download your secure PDF file copy here:\n${downloadUrl}\n\nNote: This link will remain active for 7 days.\n\nBest regards,\nHR Team` 
          } 
        }
      }
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Offer letter processed and emailed successfully!', downloadUrl })
    };
  } catch (err) {
    console.error('Fatal execution crash during offer dispatch operations:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: err.message })
    };
  }
};
