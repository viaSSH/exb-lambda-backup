import boto3

waf = boto3.client('wafv2', region_name='us-east-1')


def update_ip_addresses(ip_set_name, ip_adresses, scope='CLOUDFRONT'):

    try:
        ip_set_info = get_ip_set_info(ip_set_name)
        
        print(ip_set_info)
        prevIPList =ip_set_info['IPSet']['Addresses']
        print(prevIPList)
        print(ip_adresses)
        prevIPList.extend(ip_adresses)
        
        response = waf.update_ip_set(
            Name=ip_set_name,
            Scope=scope,
            Id=ip_set_info['IPSet']['Id'],
            Addresses=prevIPList,
            LockToken=ip_set_info['LockToken']
        )
    except waf.exceptions.WAFOptimisticLockException:
        update_ip_addresses(ip_set_name, prevIPList)

    return response

def get_ip_set_info(ip_set_name, scope='CLOUDFRONT'):

    response = waf.get_ip_set(
        Name=ip_set_name,
        Scope=scope,
        Id=get_filtering_ip_sets()[ip_set_name]['id'] 
    )
    return response

def get_filtering_ip_sets():

    ip_sets_dict= {}
    for ip_set in get_all_ip_sets():
        ip_sets_dict[ip_set['Name']] = dict(
            id=ip_set['Id'],
            lock_token=ip_set['LockToken']
        )
    return ip_sets_dict

def get_all_ip_sets(scope='CLOUDFRONT', limit=100, next_marker=None):

    all_ip_sets = []

    if next_marker is None:
        ret = waf.list_ip_sets(Scope=scope, Limit=limit)
    else:
        ret = waf.list_ip_sets(Scope=scope, Limit=limit, NextMarker=next_marker)

    if 'NextMarker' in ret:
        all_ip_sets = ret['IPSets'] + get_all_ip_sets(next_marker=ret['NextMarker'])
    else:
        all_ip_sets = ret['IPSets']

    return all_ip_sets
    
def lambda_handler(event, context):
    print(event)
    answer = event['body-json']['ans'];
    
    correct = False
    if(answer == "한승수"):
        correct = True;
    
    else:
        return {"correct": correct}
        
    
    userIp = event['context']['source-ip'];
    userIp += "/32"
    # return {"userIp": userIp, "correct": correct}
    
    # return event
#             Name="gsn-office-ip",
#             Scope="CLOUDFRONT",
#             Id='02a587b7-d3bd-40c5-8d03-9275e978d81f',
    ip_set_name = 'gsn-office-ip'
    ip_adresses = [userIp]

    response = update_ip_addresses(ip_set_name, ip_adresses)

    return {"userIp": userIp, "correct": correct}
    # return response


# import json

# import boto3

# waf = boto3.client('wafv2', region_name='us-east-1')


# def lambda_handler(event, context):
    
    
#     # return getIp
    
#     try:
#         # ip_set_info = get_ip_set_info(ip_set_name)
#         getIp = waf.get_ip_set(
#             Name="gsn-office-ip",
#             Scope="CLOUDFRONT",
#             Id='02a587b7-d3bd-40c5-8d03-9275e978d81f'
#         )
        
#         ipLists = getIp['IPSet']['Addresses']

#         ipLists.append("2.3.4.5/32")
        
#         response = waf.update_ip_set(
#             Name="gsn-office-ip",
#             Scope="CLOUDFRONT",
#             Id='02a587b7-d3bd-40c5-8d03-9275e978d81f',
#             Description='test1',
#             Addresses=ipLists,
#             LockToken='7997a008-5701-4bc2-8609-b37dbbeab70b'
#         )
#     except waf.exceptions.WAFOptimisticLockException:
#         response = waf.update_ip_set(
#             Name="gsn-office-ip",
#             Scope="CLOUDFRONT",
#             Id='02a587b7-d3bd-40c5-8d03-9275e978d81f',
#             Description='test1',
#             Addresses=ipLists,
#             LockToken='7997a008-5701-4bc2-8609-b37dbbeab70b'
#         )

#     return response
    
#     # addr = "Addresses": [
#     #   "118.33.81.150/32",
#     #   "223.62.163.241/32",
#     #   "203.229.208.51/32",
#     #   "211.44.198.26/32",
#     #   "106.250.166.66/32",
#     #   "58.151.31.5/32",
#     #   "1.209.17.35/32",
#     #   "223.39.218.243/32"
#     # ]
    
    
#     response = waf.update_ip_set(
#         Name="gsn-office-ip",
#         Scope="CLOUDFRONT",
#         Id='02a587b7-d3bd-40c5-8d03-9275e978d81f',
#         Description='test1',
#         Addresses=ipLists,
#         LockToken='7997a008-5701-4bc2-8609-b37dbbeab70b'
#     )

#     return response
    
#     # return {
#     #     'statusCode': 200,
#     #     'body': json.dumps('Hello from Lambda!')
#     # }
