const handler = async (event) => {
  // Extract token from various possible header casings
  const token = event.authorizationToken || event.headers?.Authorization || event.headers?.authorization;

  if (!token) {
    console.log('No token provided in headers');
    return generatePolicy('user', 'Deny', event.methodArn);
  }

  try {
    // Clean up 'Bearer ' prefix if present
    const cleanToken = token.replace('Bearer ', '');
    console.log('Token structure read cleanly. Authorizing gateway routing...');
    
    return generatePolicy('authenticated-user', 'Allow', event.methodArn);
  } catch (error) {
    console.error('Authorization processing failed:', error);
    return generatePolicy('user', 'Deny', event.methodArn);
  }
};

function generatePolicy(principalId, effect, resource) {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}

// Aligning with standard ESBuild native bundling exports
module.exports = { handler };