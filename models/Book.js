const {
    MIME_TYPE_EPIB,
    UPLOAD_PATH,
    UPLOAD_URL
} = require('../utils/constant')
const fs = require('fs')
class Book {
    constructor(file, data) {
        if (file) {
            this.createBookFormFile(file)
        } else {
            this.createBookFormData(file)
        }
    }
    createBookFormFile(file) {
        console.log(file);
        const {
            destination,
            originalname,
            mimetype = MIME_TYPE_EPIB,
            path
        } = file
        //电子书的阿后缀名
        const suffix = mimetype === MIME_TYPE_EPUB ? '.epub' : '';
        // 电子书的原有路径
        const oldBookPath = paht
        // 电子书的新路径
        const bookPath = `${destination}/${filename}.${suffix}`
        // 电子书下载路径
        const url = `${UPLOAD_URL}/book/${filename}.${suffix}`
        // 电子书的解压后的路径
        const unzipPath = `${UPLOAD_PATH}/unzip/${filename}`
        // 电子书的解压后的URL
        const unzipUrl = `${UPLOAD_URL}/unzip/${filename}`
        if(!fs.existsSync(unzipPath)){
            fs.mkdirSync(unzipPath,{
                recursive:true
            })
        }
    }

    createBookFormData(data) {

    }
}

module.exports = Book