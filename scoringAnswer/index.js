
var AWS = require('aws-sdk')

AWS.config.update({
    region: 'ap-northeast-2',
    endpoint: "http://dynamodb.ap-northeast-2.amazonaws.com"
})

const docClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
    
    // return event;
    const examType = event['params']['path']['examType'];
    const username = event['body-json']['name'];
    const examResult = event['body-json']['result'];
    
    // return event;
    
    // return examResult;
    
    let correctVal = 0;
    let examIdx = 1;
    
  
    
    let userIdx = 0;
    let fakeTimestamp = 0;
    
    let thisExpression1 = "set userData[" + userIdx  + "].username = :uname,  correctTotalCount = if_not_exists(correctTotalCount, :ctc) + :cn, submitTotalCount = if_not_exists(submitTotalCount, :stc) + :sn"
    let expression2 = "set userData = :newUserData,  correctTotalCount = if_not_exists(correctTotalCount, :ctc) + :cn, submitTotalCount = if_not_exists(submitTotalCount, :stc) + :sn"
    
    let dbParams = {
        TableName: "examBoom",
        UpdateExpression: thisExpression1,
        ExpressionAttributeValues:{
            ":ctc": 0,
            ":cn": correctVal,
            
            ":stc": 0,
            ":sn": 1,
            
            
            ":uname": username
        },
        Key: {
            "examCategory": examType,
            "examIdx": examIdx
            // "examIdx": 1
        }
    };
    
    const addListParams = {
        TableName: "examBoom",
        // UpdateExpression: "set #ri = list_append(if_not_exists(#ri, :empty_list), :pUser)",
        UpdateExpression: "set #ri = if_not_exists(#ri, :user_list) , correctTotalCount = if_not_exists(correctTotalCount, :ctc) + :cn, submitTotalCount = if_not_exists(submitTotalCount, :stc) + :sn",
        ExpressionAttributeNames: {
            "#ri": "participatedUser"
        },
        ExpressionAttributeValues: {
            ":user_list": [{"name": username}] ,
            
            ":ctc": 0,
            ":cn": correctVal,
            
            ":stc": 0,
            ":sn": 1
        },
        Key: {
            "examCategory": examType,
            "examIdx": examIdx
        },
        ReturnValues: 'UPDATED_NEW'

    }
    
    let addUserParams = {
        TableName: "examBoom",
        UpdateExpression: "set #ri = list_append(#ri, :user_list), correctTotalCount = if_not_exists(correctTotalCount, :ctc) + :cn, submitTotalCount = if_not_exists(submitTotalCount, :stc) + :sn",
        // UpdateExpression: "set #ri = if_not_exists(#ri, :user_list)",
        ExpressionAttributeNames: {
            "#ri": "participatedUser"
        },
        ExpressionAttributeValues: {
            ":user_list": [{"name": username}] ,
            ":ctc": 0,
            ":cn": correctVal,
            
            ":stc": 0,
            ":sn": 1,
        },
        Key: {
            "examCategory": examType,
            "examIdx": examIdx
        },
        ReturnValues: 'UPDATED_NEW'

    }
    
    let nothingParams = {
        TableName: "examBoom",
        UpdateExpression: "set correctTotalCount = if_not_exists(correctTotalCount, :ctc) + :cn, submitTotalCount = if_not_exists(submitTotalCount, :stc) + :sn",
        ExpressionAttributeValues: {
            ":ctc": 0,
            ":cn": correctVal,
            
            ":stc": 0,
            ":sn": 1
        },
        Key: {
            "examCategory": examType,
            "examIdx": examIdx
        },
        ReturnValues: 'UPDATED_NEW'
    }
    
    let dbParams2 = {
        TableName: "examBoom",
        ProjectionExpression:"participatedUser",

        Key: {
            "examCategory": examType,
            "examIdx": examIdx
        }
    };
    
    let putResultParams = {
        TableName: "examBoomSubmitResult",
        Item:{
            "username": username,
            "timestamp": fakeTimestamp , //Math.floor(new Date()), //Math.floor(+ new Date() / 1000),
            "type": examType,
            "examNum": examIdx,
            "correct": correctVal
        }
    }
    
    
    let choiceRatioAddParams = {
        TableName: "examBoom",
        // UpdateExpression: "set choicesRatio[:idx] = choicesRatio[:idx] + :one",
        UpdateExpression: "",
        ExpressionAttributeValues: {
            ":one": 1
        },
        Key: {
            "examCategory": examType,
            "examIdx": examIdx
        },
        ReturnValues: 'UPDATED_NEW'
    }
    
    
    
    
    for(let i=0 ; i<examResult.length ; i++) {
         
        
        
        correctVal = examResult[i]['correct'] == true ? 1 : 0;
        examIdx = examResult[i]['id']; 
        let userChoice = examResult[i]['U']; 
        dbParams['ExpressionAttributeValues'][":cn"] = correctVal;
        dbParams['Key']['examIdx'] = examIdx;
        
        addUserParams['ExpressionAttributeValues'][':cn'] = correctVal;
        addUserParams['Key']['examIdx'] = examIdx;
        
        nothingParams['ExpressionAttributeValues'][':cn'] = correctVal;
        nothingParams['Key']['examIdx'] = examIdx;
        
        addListParams['ExpressionAttributeValues'][':cn'] = correctVal;
        addListParams['Key']['examIdx'] = examIdx;
        
        
        putResultParams['Item']['correct'] = examResult[i]['correct'] ;
        putResultParams['Item']['examNum'] = examIdx;
        
        
        
        dbParams2['Key']['examIdx'] = examIdx;
        
        choiceRatioAddParams['Key']['examIdx'] = examIdx;
        
        let dataRead = await docClient.get(dbParams2).promise();   
        let foundUser = false;
        let userSubmitCnt = 0;
        let userCorrectCnt = 0;
        // let userIdx = 0;
        let idx = 0;
        
        
        if(dataRead['Item']['participatedUser'] !== undefined) {
            dataRead['Item']['participatedUser'].forEach(el => {
                console.log("=>", el)
                if(el['name'] == username) {
                    foundUser = true;
                }
                idx++;
            })    
            
            if(foundUser) {
                console.log("found participatedUser!!")
                let myres4 = await docClient.update(nothingParams).promise();
                console.log(myres4)
                // thisExpression1 = "set userData[" + userIdx  + "].username = :uname,  correctTotalCount = if_not_exists(correctTotalCount, :ctc) + :cn, submitTotalCount = if_not_exists(submitTotalCount, :stc) + :sn"        
            }
            else{
                console.log("i need to add user")
                let myres3 = await docClient.update(addUserParams).promise();
                console.log(myres3)
            }
            
            
    
        }
        else{
            console.log("i need to add list!")
            let myres2 = await docClient.update(addListParams).promise();
            console.log(myres2)
            // thisExpression1 = "set correctTotalCount = if_not_exists(correctTotalCount, :ctc) + :cn, submitTotalCount = if_not_exists(submitTotalCount, :stc) + :sn"
        }
        
        
        let writeUserData = {"name": username, "submitCount": userSubmitCnt, starred: false, "correctCount": userCorrectCnt}
        
        // UpdateExpression:"set reply = list_append(reply, :ct)",
    
        // let myres = await docClient.update(dbParams).promise();
        // console.log(myres)
        
        console.log(dataRead)
        
        
        fakeTimestamp =  Math.floor(new Date()) + examIdx;
        putResultParams['Item']['timestamp'] = fakeTimestamp;
        let myres5 = await docClient.put(putResultParams).promise();
        console.log("submitResult ", putResultParams)
        
        
        // console.log("userChoice ", userChoice)
        for(let j=0 ; j<userChoice.length ; j++) {
            let choiceIdx = userChoice[j].charCodeAt() - 65
            // console.log("index!!!!", choiceIdx)
            
            let choicesRatioQuery = `set choicesRatio[${choiceIdx}] = choicesRatio[${choiceIdx}] + :one`
            choiceRatioAddParams['UpdateExpression'] = choicesRatioQuery
            // console.log("result! ", choicesRatioQuery)
            let choicesRatioAddRes = await docClient.update(choiceRatioAddParams).promise();    
        }
        
        
    }
    
  
        
    // return response;
};
