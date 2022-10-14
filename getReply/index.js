const https = require('https')

var AWS = require('aws-sdk')

AWS.config.update({
    region: 'ap-northeast-2',
    endpoint: "http://dynamodb.ap-northeast-2.amazonaws.com"
})

const docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
    let params = event.params.path;
    
    // return event

    if(event.context['http-method'] == "GET") {

        // console.log(parseInt(params.examNum))

        if(params.examType == "all") {
            let recentReplyDBParams = {
                TableName: "examBoom-user-point",
                IndexName: "type-idx",
                KeyConditionExpression: "#type = :t",
                ProjectionExpression: "username, examNum, examType, #timestamp",
                ExpressionAttributeNames: {
                    "#type": "type",
                    "#timestamp": "timestamp"
                },
                ExpressionAttributeValues: {
                    ":t": "writeReply"
                },
                ScanIndexForward: false,
                Limit: 20
            };
            const recentReplyResponse = await docClient.query(recentReplyDBParams).promise(); 
            const recentReplyItems = recentReplyResponse['Items']
            // return recentReplyResponse;
            
            const recentReplyCnt = recentReplyResponse['Count'];
            console.log(recentReplyCnt)
            let examTableQueryParams = {
                TableName: "examBoom",
                KeyConditionExpression: "examCategory = :examC and examIdx = :examIdx",
                ExpressionAttributeValues: {
                    ":examC": "adp",
                    ":examIdx": 1
                },
                ProjectionExpression: "question, reply",
            } 
            
            const repliesData = []
            for(let i=0 ; i<recentReplyCnt ; i++) {
                console.log(recentReplyItems[i])
                
                let reply_timestamp = recentReplyItems[i]['timestamp']
                let reply_username = recentReplyItems[i]['username']
                let reply_examNum = recentReplyItems[i]['examNum']
                let reply_examType = "examType" in recentReplyItems[i] ? recentReplyItems[i]['examType'] : "adp"
                // let reply_isWrongAnswer = "isWrongAnswer" in recentReplyItems[i] ? recentReplyItems[i]['isWrongAnswer'] : false
                
                examTableQueryParams['ExpressionAttributeValues'][':examC'] = reply_examType
                examTableQueryParams['ExpressionAttributeValues'][':examIdx'] = reply_examNum
                
                const queryReplyResponse = await docClient.query(examTableQueryParams).promise(); 
                
                const targetExamReplies = queryReplyResponse['Items'][0]['reply']
                
                let repliesUserTemp = {
                    "examNum": reply_examNum,
                    "examType": reply_examType,
                    "question": queryReplyResponse['Items'][0]['question'],
                    "writer": reply_username,
                    "timestamp": reply_timestamp,
                    "reply": "",
                    "isWrongAnswer": ""
                    
                };
                for(let j=0 ; j<targetExamReplies.length ; j++) {
                    // console.log(targetExamReplies[j]['createdAt'], reply_timestamp)
                    if(targetExamReplies[j]['name'] == reply_username && Math.abs(targetExamReplies[j]['createdAt']-reply_timestamp) < 100 ) {
                        // console.log(targetExamReplies[j]['content'])
                        repliesUserTemp['reply'] = targetExamReplies[j]['content'];
                        repliesUserTemp['isWrongAnswer'] = targetExamReplies[j]['isWrongAnswer'];
                        repliesData.push(repliesUserTemp)
                        break;
                    }
                }
                // console.log(queryReplyResponse['Items'][0]['reply'])
            }
            
            
            return repliesData
            // return recentReplyResponse
    
        }
        else{
            let dbParams = {
                TableName: "examBoom",
                ProjectionExpression:"examIdx, reply, isWrongAnswer",
    
                Key: {
                    "examCategory": params.examType,
                    "examIdx": parseInt(params.examNum)
                    // "examIdx": 1
                }
            };
            return docClient.get(dbParams).promise();    
        }

        
    }
    else if(event.context['http-method'] == "PUT") {


        // console.log(parseInt(params.examNum))
        let inputName = event['body-json']['name']
        let inputContent = event['body-json']['content']
        let isWrongAnswer = event['body-json']['isWrongAnswer']
        
        

        let dbParams = {
            TableName: "examBoom",
            UpdateExpression:"set reply = list_append(reply, :ct)",
            ExpressionAttributeValues:{
                ":ct": [{name: inputName, content: inputContent, createdAt: Math.floor(new Date()), isWrongAnswer: isWrongAnswer }],
            },
            Key: {
                "examCategory": params.examType,
                "examIdx": parseInt(params.examNum)
                //,
                // "createdAt": Math.floor(new Date())
                // "examIdx": 1
            },
            ReturnValues:"UPDATED_NEW"

        };
        console.log("start read! ");
        
        let addPointParams = {
            TableName: "examBoom-user-point",
            Item:{
                "username": inputName,
                "timestamp": Math.floor(new Date()),
                "examNum": parseInt(params.examNum),
                "examType": params.examType,
                "type": "writeReply",
                "point": 10
            }
        };
        let addPointRes = await docClient.put(addPointParams).promise();
        
        const replyRequestOptions = {
            hostname: 'hooks.slack.com',
            path: 'SLACK_SECRET',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'  
            },
            body: {
                "text": inputName + "님의 댓글 \n" + inputContent
            },
            json: true
        }
        https.post(replyRequestOptions)

        return docClient.update(dbParams).promise();
    }
    else if(event.context['http-method'] == "DELETE") {
        let replyIdx = event['params']['querystring']['replyIdx']
        let username = event['params']['querystring']['username']

        let query = "remove reply[" + replyIdx + "]";
        let deleteDbParams = {
            TableName: "examBoom",
            UpdateExpression: query,
            Key: {
                "examCategory": params.examType,
                "examIdx": parseInt(params.examNum)
                // "examIdx": 1
            },
            ReturnValues:"UPDATED_NEW"

        };


        return docClient.update(deleteDbParams).promise();

        // return event
    }


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
