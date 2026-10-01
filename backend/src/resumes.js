const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

// Initialize S3 Client for Mumbai region
const s3 = new S3Client({ region: 'ap-south-1' });
const BUCKET = process.env.RESUME_BUCKET;

exports.getUploadUrl = async (event) => {
  try {
    // Standardizing on email to match your DynamoDB partition key
    const email = event.pathParameters.email ? event.pathParameters.email.toLowerCase().trim() : null;
    const fileType = event.queryStringParameters?.fileType || 'application/pdf';

    if (!email) {
      return { 
        statusCode: 400, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Email parameter is required in the path' }) 
      };
    }

    if (fileType !== 'application/pdf') {
      return { 
        statusCode: 400, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Validation Error: Only PDF files (.pdf) are authorized for upload.' }) 
      };
    }

    // Creating a clean, trackable path structure inside S3 using the user's normalized email
    const cleanEmailForPath = email.replace(/[^a-zA-Z0-9]/g, '_');
    const key = `resumes/${cleanEmailForPath}/${Date.now()}.pdf`;

    // Construct the command outlining intent to write to S3
    const command = new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      ContentType: 'application/pdf',
    });

    // Generate a cryptographically signed URL valid for exactly 5 minutes (300 seconds)
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({
        uploadUrl,
        resumeKey: key,
        expiresIn: '5 minutes',
        message: 'Pre-signed URL generated successfully. Use a PUT request to upload the file directly.'
      })
    };
  } catch (err) {
    console.error('S3 Pre-signing Engine Error:', err);
    return { 
      statusCode: 500, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Cloud Framework Error', details: err.message }) 
    };
  }
};