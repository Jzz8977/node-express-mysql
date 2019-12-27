const express = require('express');
const app = express();
const fs = require('fs');
const https = require('https');
const bodyParser = require('body-parser')


const cors = require('cors');

app.use(cors());

app.use(bodyParser.urlencoded({ extended : false})) ;
app.use(bodyParser.json());

// const privateKey = fs.readFile(url) //密钥
// const pem = fs.readFile(url)  //证书
// const credentials = {
//     key : privateprivateKey,
//     cert : pem
// }

const router = require('./router')
// 监听
app.use('/', router)


const server = app.listen(5000,function(){
    const { address, port } = server.address();
    console.log('Http Server is running on http://%s:%s', address, port);
})

