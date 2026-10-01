const handler = async (event) => {
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: 'Placement Platform API is running!',
      timestamp: new Date().toISOString()
    })
  };
};

module.exports = { handler }; 

