const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const pdfParse = require('pdf-parse');

const s3 = new S3Client({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region: 'ap-south-1' }));

// Skills lexicon mapping matching modern profiles
const KNOWN_SKILLS = [
  'javascript', 'python', 'java', 'react', 'nodejs', 'aws', 'sql', 'mongodb', 
  'docker', 'kubernetes', 'machine learning', 'data science', 'c++', 'golang', 
  'typescript', 'html', 'css', 'tensorflow', 'keras', 'pytorch', 'scikit-learn', 
  'pandas', 'numpy', 'spacy', 'nltk', 'terraform', 'bash'
];

exports.handler = async (event) => {
  console.log("Received S3 Event:", JSON.stringify(event, null, 2));
  
  const record = event.Records[0];
  const bucket = record.s3.bucket.name;
  const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

  // Key structure expected: resumes/aaa.adityaanand@gmail.com/resume.pdf
  const parts = key.split('/');
  const studentEmail = parts[1];

  if (!studentEmail || !studentEmail.includes('@')) {
    console.error(`Aborting processing: Could not pull valid tracking email from key: ${key}`);
    return { statusCode: 400, message: "Invalid key format setup" };
  }

  try {
    console.log(`Downloading file from S3: ${bucket}/${key}`);
    const response = await s3.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const pdfBuffer = Buffer.from(await response.Body.transformToByteArray());

    console.log("Parsing PDF structure string content...");
    const parsedData = await pdfParse(pdfBuffer);
    const textLower = (parsedData.text || '').toLowerCase();

    // Map profile matches across structural keyword grid
    const extractedSkills = KNOWN_SKILLS.filter(skill => textLower.includes(skill));
    console.log(`Parsing complete. Extracted skills matched: [${extractedSkills.join(', ')}]`);

    const s3Url = `https://${bucket}.s3.ap-south-1.amazonaws.com/${key}`;

    console.log(`Updating profile registry in PlacementPlatformStudents for: ${studentEmail}`);
    await docClient.send(new UpdateCommand({
      TableName: 'PlacementPlatformStudents',
      Key: { email: studentEmail.toLowerCase().trim() },
      UpdateExpression: 'SET resumeUrl = :url, extractedSkills = :skills, resumeParsedAt = :now',
      ExpressionAttributeValues: {
        ':url': s3Url,
        ':skills': extractedSkills,
        ':now': new Date().toISOString()
      }
    }));

    console.log(`Successfully indexed automated skill profile for ${studentEmail}`);
    return { statusCode: 200, body: "Pipeline processing completed successfully" };
  } catch (err) {
    console.error('Fatal engine crash inside parsing processing pipeline:', err);
    throw err;
  }
};
