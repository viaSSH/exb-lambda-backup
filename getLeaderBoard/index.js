var AWS = require('aws-sdk')

AWS.config.update({
    region: 'ap-northeast-2',
    endpoint: "http://dynamodb.ap-northeast-2.amazonaws.com"
})

const docClient = new AWS.DynamoDB.DocumentClient();




exports.handler = async (event) => {
    
    
    let params = {
        TableName: "examBoom-point-leaderBoard",
    };
    
    
    let res = await docClient.scan(params).promise();
    
    let userData = res['Items']
    
    userData.sort(function(a,b) {
        if(a.point < b.point) return 1;
        if(a.point > b.point) return -1;
        return 0;
    })

    // const response = {
    //   statusCode: 200,
    //   headers: {
    //     "Access-Control-Allow-Origin" : "*", // Required for CORS support to work
    //     "Access-Control-Allow-Credentials" : true // Required for cookies, authorization headers with HTTPS 
    //   },
    //   body: userData
    //   //JSON.stringify({ "message": "Hello World!" })
    // };

    // return response;
    return userData;
    
};
