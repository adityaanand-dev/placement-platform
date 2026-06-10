const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand } = require('@aws-sdk/lib-dynamodb');
const { v4: uuidv4 } = require('uuid');

// Initialize the DynamoDB Document Client for ap-south-1 (Mumbai)
const client = new DynamoDBClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

exports.register = async (event) => {
  try {
    // 1. Parse and sanitize inbound payload
    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing request body' }) };
    }
    const body = JSON.parse(event.body);
    const { name, email, phone, college, skills, cgpa } = body;

    // 2. Strict Input Validation
    if (!name || !email || !phone) {
      return { 
        statusCode: 400, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Name, email, and phone are required parameters.' }) 
      };
    }

    const normalizedEmail = email.toLowerCase().trim();
    const studentId = uuidv4(); 

    // 3. Assemble the Database Entity Object
    const studentItem = {
      email: normalizedEmail, // Set as our Primary Partition Key for strict unique tracking
      studentId,             
      name: name.trim(),
      phone: phone.trim(),
      college: college || '',
      skills: skills || [],
      cgpa: cgpa || 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    // 4. Write to DynamoDB with an atomicity check to block duplicate emails
    await docClient.send(new PutCommand({
      TableName: 'PlacementPlatformStudents', // 💡 Updated to match your serverless.yml resource name
      Item: studentItem,
      ConditionExpression: 'attribute_not_exists(email)' // Blocks execution if email partition key already exists
    }));

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        message: 'Student registered successfully!', 
        studentId,
        email: normalizedEmail 
      })
    };

  } catch (err) {
    console.error('Database Operation Failure:', err);

    // Intercept conditional check exception from AWS
    if (err.name === 'ConditionalCheckFailedException') {
      return { 
        statusCode: 409, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'A student account with this email address already exists.' }) 
      };
    }

    return { 
      statusCode: 500, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Cloud Database Error', details: err.message }) 
    };
  }
};