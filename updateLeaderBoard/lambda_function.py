import json
import boto3
import time
from botocore.exceptions import ClientError

def lambda_handler(event, context):
    
    dynamodb = boto3.resource('dynamodb', endpoint_url="http://dynamodb.ap-northeast-2.amazonaws.com")

    table = dynamodb.Table('examBoom-point-leaderBoard')
    print(event)
    
    username = event['Records'][0]['dynamodb']['Keys']['username']['S']
    point = event['Records'][0]['dynamodb']['NewImage']['point']['N']
    pointType = event['Records'][0]['dynamodb']['NewImage']['type']['S']
    print(username)
    
    
    
    try:
        
        res = table.update_item(
            Key={
                'username': username
            },
            UpdateExpression="set updateAt=:updateat, point = point + :point",
            ExpressionAttributeValues={
                ':point': int(point),
                ":updateat": int(time.time())
            }
            )
        if(pointType == "writeReply"):
            res2 = table.update_item(
                Key={
                    'username': username
                },
                UpdateExpression="set writeReplyCount = if_not_exists(writeReplyCount, :zero) + :one",
                ExpressionAttributeValues={
                    ':zero': 0,
                    ":one": 1
                }
                )
        print("update Completed")
    except ClientError as e:
        print(e)
        res = table.put_item(
            Item={
                'username': username,
                'updateAt': int(time.time()),
                'point': int(point)
            }
            )
        
    else:
        print(res)
    
    # print(username)
    
    return True
    
    
