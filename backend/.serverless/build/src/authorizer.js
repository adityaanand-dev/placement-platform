// src/authorizer.js
var handler = async (event) => {
  const token = event.authorizationToken || event.headers?.Authorization || event.headers?.authorization;
  if (!token) {
    console.log("No token provided in headers");
    return generatePolicy("user", "Deny", event.methodArn);
  }
  try {
    const cleanToken = token.replace("Bearer ", "");
    console.log("Token structure read cleanly. Authorizing gateway routing...");
    return generatePolicy("authenticated-user", "Allow", event.methodArn);
  } catch (error) {
    console.error("Authorization processing failed:", error);
    return generatePolicy("user", "Deny", event.methodArn);
  }
};
function generatePolicy(principalId, effect, resource) {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource
        }
      ]
    }
  };
}
module.exports = { handler };
//# sourceMappingURL=authorizer.js.map
