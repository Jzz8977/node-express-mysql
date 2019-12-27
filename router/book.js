const express = require('express')
const multer = require('multer')
const Result = require('../models/Result')
const Book = require('../models/Book')
const router = express.Router();
const {
    UPLOAD_PATH
}= require('../utils/constant')

router.post(
    '/upload',
    multer({
        dest: `${UPLOAD_PATH}/book`
    }).single('file'),//上传单个文件
    function (req, res, next) {
        console.log(`${UPLOAD_PATH}/book`)
        console.log(req.file)
        if (!req.file || req.file.length === 0) {
            new Result('上传失败').fail(res)
        } else {
            new Book(file)
            new Result('上传电子书成功').success(res)
        }

    })
module.exports = router;