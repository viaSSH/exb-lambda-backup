var AWS = require('aws-sdk')

AWS.config.update({
    region: 'ap-northeast-2',
    endpoint: "http://dynamodb.ap-northeast-2.amazonaws.com"
})

const docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
    let username = event['params']['querystring']['username']
    
    // return event;
    
    let dbParams = {
        TableName: "examBoomSubmitResult",
        KeyConditionExpression: "username = :un",
        ExpressionAttributeValues: {
            ":un": username
        }
    };
    

    return docClient.query(dbParams).promise();
    
    
    // const response = {
    //     statusCode: 200,
    //     body: JSON.stringify('Hello from Lambda!'),
    // };
    // return response;
};
