/*
//we are importing the class variable express and redis for the further operation needed for this project from the packages
// we are using only post because in this project we are going to pass the body as request
//so that all the operation is going to be happen with the post req
//these are the variables needed for the operation of the packets
// body will be the  packet which is send from client side  
and all the required operation for the order is held here
'[0-9]_[0-9]:*'               we are using r language to get the keys of the client record
*/

const express = require('express');
const Redis = require('ioredis');
const router = express.Router();
const redis = new Redis();
router.post('/', (req, res) => {
    const { MsgType,OperationType,ClientId,TenantId,OMSId} = req.body;
    const body = req.body;
    if (!OperationType || !MsgType) {
        return res.status(400).json({ error: 'Both ClientId and MsgType are required' });
    }
    if (MsgType!==1121) {
        return res.status(400).json({ error: 'message type is not valid for client info' });
    }
    const fieldValues = Object.entries(body).flat();
if (OperationType === 100) {
    console.log(Object.keys(body).length);
    if(Object.keys(body).length!==7)
    {
        return res.status(400).json({ error: 'MsgType,OperationType,ClientId,TenantId,OMSId,Remark,ClientName  check every feilds are present(With the correct spelling) ---------> total 7 feilds' });
    }
    if (!ClientId  || !TenantId || !OMSId) {
        return res.status(400).json({ error: 'ClientId,TenantId,OMSId is required' });
    }
var key = `${TenantId}_${OMSId}:${ClientId}`;
redis.exists(key, (err, exists) => {
    if (err) {
    console.error('Redis error:', err);
    return res.status(500).json({ error: 'Internal server error' });
    }
    if (exists) {
    return res.status(400).json({ error: 'Client id already exists' });
    } else {
    redis.hmset(key, fieldValues, (err, result) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Client added successfully', result });
    });
    }
    });
    }
    
else if(OperationType===101){
    if (!ClientId) {
            return res.status(400).json({ error: 'ClientId is required' });
        }
        var key = `${TenantId}_${OMSId}:${ClientId}`;
        redis.hmset(key, fieldValues, (err, result) => {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.status(201).json({ message: 'Client updated  successfully', result });
        });
}
else if(OperationType===102){
    if (!ClientId) {
        return res.status(400).json({ error: 'ClientId is required' });
    }
    var key = `${TenantId}_${OMSId}:${ClientId}`;
    redis.del(key, (err, result) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result === 0){
            return res.status(404).json({ error: 'Client data not found' });
        }
        res.status(200).json({ message: 'Client deleted successfully', result });
    });
}
else if(OperationType===103){
    if (!ClientId) {
        return res.status(400).json({ error: 'ClientId is required' });
    }
    var key = `${TenantId}_${OMSId}:${ClientId}`;
    redis.hgetall(key, (err, clientData) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!clientData) {
            return res.status(404).json({ error: 'Client data not found' });
        }
        res.json(clientData);
    });
}
else if(OperationType===104){
    redis.keys('[0-9]_[0-9]:*', (err, keys) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!keys || keys.length === 0) {
            return res.status(404).json({ error: 'No records found' });
        }
        const getAllDataPromises = keys.map(key => {
            return new Promise((resolve, reject) => {
                redis.hgetall(key, (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            });
        });
        Promise.all(getAllDataPromises)
            .then(results => {
                res.json(results);
            })
            .catch(err => {
                console.error('Redis error:', err);
                res.status(500).json({ error: 'Internal server error' });
            });
    });
}
});
module.exports = router;
