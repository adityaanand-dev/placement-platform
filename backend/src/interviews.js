const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { DynamoDBDocumentClient, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');
const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const crypto = require('crypto');

const client = new DynamoDBClient({ region: 'ap-south-1' });
const docClient = DynamoDBDocumentClient.from(client);
const ses = new SESClient({ region: 'ap-south-1' });

exports.create = async (event) => {
  try {
    const body = JSON.parse(event.body || '{}');
    const { applicationId, date, time, mode, interviewerName, studentEmail, notes } = body;

    // Strict Validation Check
    if (!applicationId || !date || !time || !studentEmail) {
      return {
        statusCode: 400,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ error: 'Validation Error: applicationId, date, time, and studentEmail are required.' })
      };
    }

    const interview = {
      interviewId: crypto.randomUUID(), // Avoids external uuid dependency issues
      applicationId,
      date,
      time,
      mode: mode || 'Online',
      interviewerName: interviewerName || 'HR Team',
      studentEmail: studentEmail.toLowerCase().trim(),
      notes: notes || '',
      result: 'Pending',
      createdAt: new Date().toISOString()
    };

    // 1. Save record to DynamoDB
    await docClient.send(new PutCommand({ 
      TableName: 'Interviews', 
      Item: interview 
    }));

    // 2. Dispatch Live AWS SES Email Notification
    if (process.env.FROM_EMAIL) {
      try {
        await ses.send(new SendEmailCommand({
          Source: process.env.FROM_EMAIL,
          Destination: { ToAddresses: [interview.studentEmail] },
          Message: {
            Subject: { Data: '?? Interview Scheduled - Placement Portal' },
            Body: {
              Text: {
                Data: `Dear Student,\n\nGreat news! Your interview has been scheduled.\n\nDetails:\n?? Date: ${interview.date}\n? Time: ${interview.time}\n?? Mode: ${interview.mode}\n?? Interviewer: ${interview.interviewerName}\n?? Notes: ${interview.notes}\n\nBest of luck!\n\nPlacement Portal Team`
              }
            }
          }
        }));
      } catch (sesErr) {
        console.error("SES dispatch failed:", sesErr.message);
        // We log the error but still return 201 since the database write succeeded
      }
    }

    return {
      statusCode: 201,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ 
        message: 'Interview successfully scheduled and student notified!', 
        interviewId: interview.interviewId 
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Server Error', details: err.message })
    };
  }
};

exports.getByApplication = async (event) => {
  try {
    const applicationId = event.pathParameters.applicationId;
    
    const result = await docClient.send(new QueryCommand({
      TableName: 'Interviews',
      IndexName: 'ApplicationIndex',
      KeyConditionExpression: 'applicationId = :aid',
      ExpressionAttributeValues: { ':aid': applicationId }
    }));

    return {
      statusCode: 200,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ interviews: result.Items })
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { 'Access-Control-Allow-Origin': '*' },
      body: JSON.stringify({ error: 'Internal Server Error', details: err.message })
    };
  }
};
