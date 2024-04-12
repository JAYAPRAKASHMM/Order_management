/*
we are using express,ioredis and body-parser 

body-server is the middleware

this is a server program which initiates the local server at the http://localhost:3000/

there is 2  endpoints in this API /api/client and /api/order 

the /api/client endpoint handles all the operations for the client and 

order api handles the operation for the client who have previously enrolled in the client

*/
const express = require('express');
const bodyParser = require('body-parser');
const clientInfoApi = require('./clientInfoApi');
const orderInfoApi=require('./orderInfoApi');
const app = express();
app.use(bodyParser.json());
app.use('/api/client', clientInfoApi);
app.use('/api/order', orderInfoApi);
const PORT =3000;
app.use('/',(req,res)=>{res.send("Hi  !!...Your server started....now you can navigate to http://localhost:3000/api/client or http://localhost:3000/api/order for respective operations")});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
