/*//we are importing the class variable express and redis for the further operation needed for this project from the packages
//this temp is used to identifies the status of the order placed by the user
// we are using only post because in this project we are going to pass the body as request
//so that all the operation is going to be happen with the post req
//these are the variables needed for the operation of the packets
// body will be the  packet which is send from client side  
and all the required operation for the order is held here
'[0-9]_[0-9]_[0-9]_*:*'               we are using r language to get the keys of the order*/

const express = require('express');
const Redis = require('ioredis');
const router = express.Router();
const redis = new Redis();
var gstrTemp="";

router.post('/', (req, res) => {
    const { MsgType,OperationType,OrderType,ClientId,Token,TenantId,OrderId,OMSId } = req.body;
    var key =`${TenantId}_${OMSId}_${ClientId}_${Token}:${OrderId}`;
    const body = req.body;
    if (!OperationType || !MsgType ) {
        return res.status(400).json({ error: 'OperationType and MsgType are required' });
    }
    if (MsgType!==1120) {
        return res.status(400).json({ error: 'message type is not valid for order info' });
    }
    const fieldValues = Object.entries(body).flat();
    if(OperationType===100)
    {
        if(Object.keys(body).length!==12)
    {
        return res.status(400).json({ error: 'MsgType,OperationType,OrderType,Token,OrderId,ClientId,TenantId,OMSId,Remark,ClientName,OrderPrice,OrderQuantity  check every feilds are present(With the correct spelling)   --->total 11 feilds' });
    }
        if (!OrderId || !TenantId ||  !OMSId || !ClientId) {
            return res.status(400).json({ error: 'OrderId,TenantId,OMSId,ClientId is required' });
        }
    redis.exists( `${TenantId}_${OMSId}:${ClientId}`, (err, exists) => {
        if (err) {
        console.error('Redis error:', err);
        return res.status(500).json({ error: 'Internal server error' });
        }
        if (!exists) {
        return res.status(400).json({ error: 'User not found to place order' });
        } else {
        redis.hmset(key, fieldValues, (err, result) => {
            if (err) {
                console.error('Redis error:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            if(OrderType===1)
            {
                gstrTemp="bought";
            }
            else{
                gstrTemp="sold";
            }
            res.status(201).json({ message: `client ${gstrTemp} order successfully`, result });
        });
        }
        });
}
else if(OperationType===101){
    if (!OrderId) {
        return res.status(400).json({ error: 'OrderId is required' });
    }
    redis.hmset(key,fieldValues, (err, result) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'order edited successfully', result });
    });
}
else if(OperationType===102){
    if (!OrderId) {
        return res.status(400).json({ error: 'OrderId is required' });
    }
    redis.del(key, (err, result) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result === 0){
            return res.status(404).json({ error: 'order data not found' });
        }
        res.status(200).json({ message: 'order deleted successfully', result });
    });
}
else if(OperationType===103){
    if (!OrderId) {
        return res.status(400).json({ error: 'OrderId is required' });
    }
    redis.hgetall(key, (err, clientData) => {
        if (err) {
            console.error('Redis error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!clientData) {
            return res.status(404).json({ error: 'order data not found' });
        }
        res.json(clientData);
    });
}
else if(OperationType===104){
    redis.keys('[0-9]_[0-9]_[0-9]_*:*', (err, keys) => {
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
