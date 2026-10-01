const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, GetCommand, ScanCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto'); // Native Node.js unique identifier toolkit

const client = new DynamoDBClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);

// ==========================================
// 💼 1. CREATE JOB OPENING (POST)
// ==========================================
exports.create = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { companyId, title, description, skills, salary, location, type, deadline } = body;

    // Strict validation safety catch
    if (!companyId || !title || !description) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Validation Error: companyId, corporate position title, and core description are mandatory.' })
      };
    }

    const jobId = crypto.randomUUID();

    const jobItem = {
      jobId,
      companyId,
      title: title.trim(),
      description: description.trim(),
      skills: Array.isArray(skills) ? skills : [],
      salary: salary || 'Not disclosed',
      location: location || 'Remote',
      type: type || 'Full-time',
      deadline: deadline || null,
      status: 'active', // Active listing visible to hunting talent
      createdAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: 'PlacementPlatformJobs',
      Item: jobItem
    }));

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: 'Corporate opening published to marketplace successfully!', jobId })
    };
  } catch (err) {
    console.error('Job Provisioning Error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Cloud Framework Error', details: err.message })
    };
  }
};

// ==========================================
// 🔍 2. DYNAMIC JOB ENGINE SEARCH & DISCOVERY (GET)
// ==========================================
exports.list = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const { location, type } = queryParams;

    // Safely structure mapping expressions to sidestep DynamoDB reserved words collisions
    let filterExpressions = ['#status = :active'];
    let expValues = { ':active': 'active' };
    let expNames = { '#status': 'status' };

    if (location) {
      filterExpressions.push('#location = :location');
      expValues[':location'] = location.trim();
      expNames['#location'] = 'location';
    }

    if (type) {
      filterExpressions.push('#type = :type');
      expValues[':type'] = type.trim();
      expNames['#type'] = 'type';
    }

    const result = await docClient.send(new ScanCommand({
      TableName: 'PlacementPlatformJobs',
      FilterExpression: filterExpressions.join(' AND '),
      ExpressionAttributeValues: expValues,
      ExpressionAttributeNames: expNames
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        jobs: result.Items || [], 
        count: result.Count || 0 
      })
    };
  } catch (err) {
    console.error('Marketplace Query Processing Error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Query Matrix Error', details: err.message })
    };
  }
};

// ==========================================
// 👁️ 3. FETCH SINGLE SPECIFIC JOB PROFILE (GET)
// ==========================================
exports.getById = async (event) => {
  try {
    const jobId = event.pathParameters ? event.pathParameters.id : null;

    if (!jobId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Job Tracking ID tracking parameter required.' })
      };
    }

    const result = await docClient.send(new GetCommand({
      TableName: 'PlacementPlatformJobs',
      Key: { jobId }
    }));

    if (!result.Item) {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Resource Not Found: Job listing has expired or does not exist.' })
      };
    }

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify(result.Item)
    };
  } catch (err) {
    console.error('Job Detail Extraction Error:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Cloud Framework Error', details: err.message })
    };
  }
};