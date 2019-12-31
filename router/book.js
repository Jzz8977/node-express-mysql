const express = require('express')
const multer = require('multer')
const Result = require('../models/Result')
const Book = require('../models/Book')
const router = express.Router();
const boom = require('boom')
const { decoded } = require('../utils')
const { insertBook } = require('../services/book')
const {
    UPLOAD_PATH
} = require('../utils/constant')

router.post(
    '/upload',
    multer({
        dest: `${UPLOAD_PATH}/book`
    }).single('file'),//上传单个文件
    function (req, res, next) {
        if (!req.file) {
            new Result('上传失败').fail(res)
        } else {
            const book = new Book(req.file)

            // console.log(book, 'he')
            book.parse(book).then(book => {
                new Result(book, '上传电子书成功').success(res)
            }).catch(err => {
                // console.log(err, 'err')
                next(boom.badImplementation(err))
            })
        }

    })


router.post('/create', (req, res, next) => {
    const de = decoded(req)


    const book = new Book(null, req.body)
    if (de && de.username) {
        book.username = de.username
    }
    insertBook(book).then(res => {

    }).catch(err => {
        next(boom.badImplementation(err))
    })
})
module.exports = router;