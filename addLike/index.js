var AWS = require('aws-sdk')

AWS.config.update({
    region: 'ap-northeast-2',
    endpoint: "http://dynamodb.ap-northeast-2.amazonaws.com"
})

const docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
    let params = event.params.path;
    
    const examType = event['params']['path']['examType'];
    const username = event['body-json']['name'];
    const liked = event['body-json']['liked']
    const examNum = event['params']['path']['examNum'];

    // return {
    //     "t":  examType,
    //     "n": examNum
    // }

  if(event.context['http-method'] == "POST") {


        // console.log(parseInt(params.examNum))
        // let inputName = event['body-json']['name']
        // let inputContent = event['body-json']['content']


        // let expression2 = "set likeCount = if_not_exists(likeCount, :emptyCount) + :lc"
        // let UpdateExpression: "set #ri = list_append(#ri, :user_list), correctTotalCount = if_not_exists(correctTotalCount, :ctc) + :cn, submitTotalCount = if_not_exists(submitTotalCount, :stc) + :sn",
        
        if(liked) {
            let myExp = "set #ri = list_append(if_not_exists(#ri, :emptyList), :username )"
        
            let dbParams = {
                TableName: "examBoom",
                UpdateExpression: myExp,
                ExpressionAttributeValues:{
                    
                    ":emptyList": [],
                    ":username": [username]
                    
                    
                },
                ExpressionAttributeNames: {
                    "#ri": "likeList"
                },
                Key: {
                    "examCategory": examType,
                    // "examCategory": "sap",
                    "examIdx": parseInt(examNum)
                    // "examIdx": 1
                }
            };
            
            return docClient.update(dbParams).promise();
        }
        else{
            const idx = event['body-json']['idx']
            
             let query = "remove likeList[" + idx + "]";
            let deleteDbParams = {
                TableName: "examBoom",
                UpdateExpression: query,
                Key: {
                    "examCategory": examType,
                    "examIdx": parseInt(examNum)
                    // "examIdx": 1
                },
                ReturnValues:"UPDATED_NEW"
    
            };
    
    
            return docClient.update(deleteDbParams).promise();
        }
        

        
    }
    
}