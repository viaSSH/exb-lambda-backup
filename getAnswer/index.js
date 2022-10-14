var AWS = require('aws-sdk')

AWS.config.update({
    region: 'ap-northeast-2',
    endpoint: "http://dynamodb.ap-northeast-2.amazonaws.com"
})

const docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
    
    // return event;
    
    let params = event.params.path;
    let queryString = event.params.querystring;
    // let params = ""
    
    
    let dbParams = {
        TableName: "examBoom",
        ProjectionExpression:"examIdx, answer",
        KeyConditionExpression: "examCategory = :eType and examIdx between :front and :end",
        // FilterExpression: "examCategory = :eType and examIdx >= :start and examIdx <= : end",
        ExpressionAttributeValues: {
            ":eType": params.examType,
            ":front": parseInt(queryString.front),
            ":end": parseInt(queryString.end)
        }
    };
    
    console.log("start read! ");
    
    return docClient.query(dbParams).promise();
    
    // docClient.get(dbParams, function(err, data) {
    //     if (err) {
    //         console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
            
    //         return false;
    //     } else {
    //         console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            
    //         return data;
    //     }
    // });
    
    console.log("end read");
    
    
    
    // const response = {
    //         id: params.examNum,
    //         type: params.examType
    //     };
        
    // const response = event
        
        
    // return response;
};
