const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto'); // Built-in Node.js tool for lightweight IDs

const client = new DynamoDBClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

// ==========================================
// 🏢 1. REGISTER COMPANY
// ==========================================
exports.register = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { name, email, industry, website, description, hrName } = body;

    // Check for essential foundational fields
    if (!name || !email || !hrName) {
      return { 
        statusCode: 400, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Validation Failed: Name, corporate email, and HR representative contact name are required.' }) 
      };
    }

    const cleanEmail = email.toLowerCase().trim();
    const companyId = crypto.randomUUID(); // Fast, native UUIDv4 structure

    const companyItem = {
      companyId,
      name: name.trim(),
      email: cleanEmail,
      industry: industry || 'Technology',
      website: website || '',
      description: description || '',
      hrName: hrName.trim(),
      isApproved: false, // Security Guardrail: Requires internal admin clearance to view students
      createdAt: new Date().toISOString()
    };

    // Store profile while preventing duplicate registrations on the same email
    await docClient.send(new PutCommand({
      TableName: 'PlacementPlatformCompanies',
      Item: companyItem,
      ConditionExpression: 'attribute_not_exists(email)'
    }));

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        message: 'Company portal onboarding requested successfully! Status: Pending Admin Approval.', 
        companyId 
      })
    };
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return { 
        statusCode: 409, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Conflict: A corporate account under this email address already exists.' }) 
      };
    }
    console.error('Company Onboarding Error:', err);
    return { 
      statusCode: 500, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Cloud Framework Error', details: err.message }) 
    };
  }
};

// ==========================================
// 🔍 2. GET COMPANY BY EMAIL
// ==========================================
exports.getById = async (event) => {
  try {
    const email = event.pathParameters.email ? event.pathParameters.email.toLowerCase().trim() : null;

    if (!email) {
      return { 
        statusCode: 400, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Email path parameter is required.' }) 
      };
    }

    const result = await docClient.send(new GetCommand({ 
      TableName: 'PlacementPlatformCompanies', 
      Key: { email } 
    }));

    if (!result.Item) {
      return { 
        statusCode: 404, 
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Resource Not Found: Account profile does not exist.' }) 
      };
    }

    return { 
      statusCode: 200, 
      headers: { 'Access-Control-Allow-Origin': '*' }, 
      body: JSON.stringify(result.Item) 
    };
  } catch (err) {
    console.error('Company Retrieval Error:', err);
    return { 
      statusCode: 500, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Cloud Framework Error', details: err.message }) 
    };
  }
};

// ==========================================
// 🎓 3. LIST STUDENTS (TALENT SEEKING DISCOVERY ENGINE)
// ==========================================
exports.listStudents = async (event) => {
  try {
    // Queries the Student profile pool cleanly.
    // Handles DynamoDB structural reservations by safely aliasing fields.
    const result = await docClient.send(new ScanCommand({
      TableName: 'PlacementPlatformStudents',
      ProjectionExpression: 'studentId, #n, college, skills, cgpa, email',
      ExpressionAttributeNames: { 
        '#n': 'name'
      }
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        students: result.Items || [], 
        count: result.Count || 0 
      })
    };
  } catch (err) {
    console.error('Talent Pipeline Scanning Error:', err);
    return { 
      statusCode: 500, 
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Cloud Discovery Framework Error', details: err.message }) 
    };
  }
};