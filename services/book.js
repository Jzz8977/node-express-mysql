const Book = require('../models/Book')
const db = require('../db')
function exists(book) {


}
function removeBook(book) {

}
function insertContents(book) {
    // 生成目录创建
}
function insertBook(book) {
    return new Promise(async (res, rej) => {
        try {
            if (book instanceof Book) {
                const result = await exists(book)
                if (result) {
                    await removeBook(book)
                    rej(new Error('电子书已存在'))
                } else {
                    await db.insert(book, 'book')
                    await insertContents(book)
                    res() 
                }
            } else {
                rej(new Error('添加图书对象不合法'))
            }
        } catch (e) {
            rej(new Error('添加的图书对象不合法'))
        }
    })
}


module.exports = {
    insertBook
}