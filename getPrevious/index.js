var AWS = require('aws-sdk')

AWS.config.update({
    region: 'ap-northeast-2',
    endpoint: "http://dynamodb.ap-northeast-2.amazonaws.com"
})

const docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
    
    // return event;
    
    let params = event.params.path;
    let examType = params['examType']
    // let examType = "sap"
    // let params = ""
    
    
    let dbParams = {
        TableName: "examBoom",
        ProjectionExpression:"examIdx, previousExam",
        FilterExpression: "attribute_exists(#prevE)",
        KeyConditionExpression: "examCategory = :examC and examIdx < :num",
        ExpressionAttributeValues: {
             ":examC": examType,
             ":num": 200
        },
         ExpressionAttributeNames: {
            "#prevE": "previousExam",
        },
    };
    
    let dbParams2 = {
        TableName: "examBoom",
        ProjectionExpression:"examIdx, previousExam",
        FilterExpression: "attribute_exists(#prevE)",
        KeyConditionExpression: "examCategory = :examC and examIdx >= :num",
        ExpressionAttributeValues: {
             ":examC": examType,
             ":num": 200
        },
         ExpressionAttributeNames: {
            "#prevE": "previousExam",
        },
    };
    
    let res1 = await docClient.query(dbParams).promise();
    let res2 = await docClient.query(dbParams2).promise();
    // console.log("start read! ");
    let res3 = new Object();
    res3['Items'] = res1['Items'].concat(res2['Items'])
    
    // console.log(res1['Items'])
    
    return res3
    
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
