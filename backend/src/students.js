const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto'); // 💡 Uses built-in Node.js crypto module instead of external uuid package

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
    const studentId = crypto.randomUUID(); // 💡 Generates a flawless, secure random v4 UUID natively

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
      TableName: 'PlacementPlatformStudents',
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

// 1. Fetch Student Profile by Email (GET /students/{email})
exports.getById = async (event) => {
  try {
    // We change pathParameters.id to pathParameters.email to match your Day 6 primary key
    const email = event.pathParameters.email ? event.pathParameters.email.toLowerCase().trim() : null;

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email parameter is required' }) };
    }

    const result = await docClient.send(new GetCommand({
      TableName: 'PlacementPlatformStudents', // Using your exact Day 6 table name
      Key: { email } // Querying against your actual partition key
    }));

    if (!result.Item) {
      return { 
        statusCode: 404, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `Student with email ${email} not found` }) 
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Item)
    };
  } catch (err) {
    console.error('GET Operation Failure:', err);
    return { 
      statusCode: 500, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Server Error', details: err.message }) 
    };
  }
};

// 2. Update Student Profile Fields Dynamically (PUT /students/{email})
exports.update = async (event) => {
  try {
    const email = event.pathParameters.email ? event.pathParameters.email.toLowerCase().trim() : null;
    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email parameter is required' }) };
    }

    if (!event.body) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing update payload body' }) };
    }
    const body = JSON.parse(event.body);

    // Fields allowed to be dynamically altered by the user
    const updateFields = ['name', 'phone', 'college', 'skills', 'cgpa', 'resumeUrl', 'status'];
    let updateExp = 'SET updatedAt = :updatedAt';
    let expValues = { ':updatedAt': new Date().toISOString() };
    let expNames = {}; // Keeps reserved words safe

    updateFields.forEach(field => {
      if (body[field] !== undefined) {
        // We use ExpressionAttributeNames (#field) to prevent conflicts with DynamoDB reserved keywords (like 'status')
        updateExp += `, #${field} = :${field}`;
        expValues[`:${field}`] = body[field];
        expNames[`#${field}`] = field;
      }
    });

    await docClient.send(new UpdateCommand({
      TableName: 'PlacementPlatformStudents',
      Key: { email },
      UpdateExpression: updateExp,
      ExpressionAttributeNames: expNames,
      ExpressionAttributeValues: expValues,
      ConditionExpression: 'attribute_exists(email)' // Fails explicitly if student record doesn't exist
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Profile updated successfully!' })
    };
  } catch (err) {
    console.error('UPDATE Operation Failure:', err);
    
    if (err.name === 'ConditionalCheckFailedException') {
      return { 
        statusCode: 404, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Cannot update profile. No student account found with this email.' }) 
      };
    }

    return { 
      statusCode: 500, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Server Error', details: err.message }) 
    };
  }
};