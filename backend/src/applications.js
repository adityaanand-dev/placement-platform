const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand, UpdateCommand } = require('@aws-sdk/lib-dynamodb');
const crypto = require('crypto');

const client = new DynamoDBClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);


// Valid life-cycle pipeline states for auditing verification
const VALID_STATUSES = ['Applied', 'Shortlisted', 'Interview', 'Offered', 'Rejected'];

// ==========================================
// 📥 1. SUBMIT JOB APPLICATION (POST)
// ==========================================
exports.apply = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { email, jobId } = body;

    if (!email || !jobId) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Validation Error: Student email string and corporate jobId are required.' })
      };
    }

    const cleanEmail = email.toLowerCase().trim();

    // 🛡️ Spam-Control Guardrail: Check if this user has already applied to this specific job
    const existingCheck = await docClient.send(new QueryCommand({
      TableName: 'PlacementPlatformApplications',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      FilterExpression: 'jobId = :jobId',
      ExpressionAttributeValues: { 
        ':email': cleanEmail, 
        ':jobId': jobId 
      }
    }));

    if (existingCheck.Count > 0) {
      return {
        statusCode: 409,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Conflict: You have already submitted an application for this position.' })
      };
    }

    const applicationItem = {
      applicationId: crypto.randomUUID(),
      email: cleanEmail,
      jobId,
      status: 'Applied', // Starting state in our tracking machine
      appliedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await docClient.send(new PutCommand({
      TableName: 'PlacementPlatformApplications',
      Item: applicationItem
    }));

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        message: 'Application successfully registered in recruitment ecosystem!', 
        applicationId: applicationItem.applicationId 
      })
    };
  } catch (err) {
    console.error('Application Processing Failure:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Cloud Framework Error', details: err.message })
    };
  }
};

// ==========================================
// 🔄 2. UPDATE APPLICATION PIPELINE STATUS (PUT)
// ==========================================
exports.updateStatus = async (event) => {
  try {
    const applicationId = event.pathParameters ? event.pathParameters.id : null;
    const body = JSON.parse(event.body || '{}');
    const { status } = body;

    if (!VALID_STATUSES.includes(status)) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: `Validation Error: Status string must be exactly one of: ${VALID_STATUSES.join(', ')}` })
      };
    }

    // Safely update pipeline progress if the tracking ID exists
    await docClient.send(new UpdateCommand({
      TableName: 'PlacementPlatformApplications',
      Key: { applicationId },
      UpdateExpression: 'SET #status = :status, updatedAt = :now',
      ConditionExpression: 'attribute_exists(applicationId)',
      ExpressionAttributeNames: { '#status': 'status' },
      ExpressionAttributeValues: { 
        ':status': status, 
        ':now': new Date().toISOString() 
      }
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ message: `Success: Application progress advanced to: [${status}].` })
    };
  } catch (err) {
    if (err.name === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Resource Not Found: The provided tracking file ID does not exist.' })
      };
    }
    console.error('State Machine Status Transition Failure:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Pipeline State Alteration Failure', details: err.message })
    };
  }
};

// ==========================================
// 📊 3. FETCH STUDENT DASHBOARD APPLICATIONS (GET)
// ==========================================
exports.getByStudent = async (event) => {
  try {
    const email = event.pathParameters ? event.pathParameters.email.toLowerCase().trim() : null;

    if (!email) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Student email path target parameter is required.' })
      };
    }

    // High-performance query against our GSI
    const result = await docClient.send(new QueryCommand({
      TableName: 'PlacementPlatformApplications',
      IndexName: 'EmailIndex',
      KeyConditionExpression: 'email = :email',
      ExpressionAttributeValues: { ':email': email }
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        applications: result.Items || [], 
        count: result.Count || 0 
      })
    };
  } catch (err) {
    console.error('Student Tracking Data Retrieval Failure:', err);
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Query Matrix Execution Error', details: err.message })
    };
  }
};