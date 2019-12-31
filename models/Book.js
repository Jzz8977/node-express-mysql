const {
    MIME_TYPE_EPUB,
    UPLOAD_PATH,
    UPLOAD_URL
} = require('../utils/constant')
const fs = require('fs')
const Epub = require('../utils/epub')
const xml2js = require('xml2js').parseString
const path = require('path')
class Book {
    constructor(file, data) {
        if (file) {
            this.createBookFormFile(file)
        } else {
            this.createBookFormData(file)
        }
    }
    createBookFormFile(file) {
        const {
            destination,
            originalname,
            mimetype = MIME_TYPE_EPUB,
            path,
            filename
        } = file
        //电子书的阿后缀名
        const suffix = mimetype === MIME_TYPE_EPUB ? '.epub' : '';
        // 电子书的原有路径
        const oldBookPath = path
        // 电子书的新路径
        const bookPath = `${destination}/${filename}${suffix}`
        // 电子书下载路径
        const url = `${UPLOAD_URL}/book/${filename}${suffix}`
        // 电子书的解压后的路径
        const unzipPath = `${UPLOAD_PATH}/unzip/${filename}`
        // 电子书的解压后的URL
        const unzipUrl = `${UPLOAD_URL}/unzip/${filename}`
        if (!fs.existsSync(unzipPath)) {
            fs.mkdirSync(unzipPath, {
                recursive: true
            })
        }
        if (fs.existsSync(oldBookPath) && !fs.existsSync(bookPath)) {
            fs.renameSync(oldBookPath, bookPath);
        }
        this.fileName = filename;//'文件名'
        this.path = `/book/${filename}${suffix}` //epub文件相对地址
        this.filePath = this.path   // 
        this.unzipPath = `/unzip/${filename}`
        this.url = url //epub文件下载地址
        this.title = '' //书名
        this.author = ''    // 作者
        this.publisher = '' //出版社
        this.contents = [] //目录
        this.cover = '' //封面
        this.coverPath = ''// 封面地址
        this.category = -1 // 类别ID
        this.categoryText = '' //  列别名称
        this.language = '' //语种
        this.unzipUrl = unzipUrl //解压后文件夹链接
        this.originalname = originalname //电子名文件

    }

    createBookFormData(data) {
        this.fileName = data.fileName
        this.cover = data.coverPath
        this.title = data.title
        this.author = data.author
        this.publisher = data.publisher
        this.bookId = data.fileName
        this.language = data.language
        this.rootFile = data.rootFile
        this.originalName = data.originalName
        this.path = data.path || data.filePath
        this.filePath = data.path || data.filePath
        this.unzipPath = data.unzipPath
        this.coverPath = data.coverPath
        this.createUser = data.username
        this.createDt = new Date().getTime()
        this.updateDt = new Date().getTime()
        this.updateType = data.updateType === 0 ? data.updateType : UPDATE_TYPE_FROM_WEB
        this.contents = data.contents
        this.category = data.category || 0
        this.categoryText = data.categoryText || '自定义类别名'

    }

    parse() {
        return new Promise((res, rej) => {
            const bookPath = `${UPLOAD_PATH}${this.path}`
            // console.log(bookPath)
            if (!fs.existsSync(bookPath)) {
                rej(new Error('电子书不存在   '))
            }
            const epub = new Epub(bookPath);
            epub.on('error', err => {
                rej(err)
            })
            epub.on('end', err => {
                if (err) {
                    rej(err)
                } else {
                    let {
                        title,
                        language,
                        creator,
                        creatorFileAs,
                        publisher,
                        cover
                    } = epub.metadata
                    if (!title) {
                        // this.title = title
                        rej(new Error('图书标题为空'))
                    } else {
                        this.title = title
                        this.language = language || 'en'
                        this.author = creator || creatorFileAs || 'unknown'
                        this.publisher = publisher || 'unkown'
                        this.rootFile = epub.rootFile
                        // console.log(this.rootFile, '1313131')
                        try {
                            this.unzip()
                            this.parseContents(epub).then(({ chapters, chaptersTree }) => {
                                this.contents = chapters
                                this.contentsTree = chaptersTree
                                epub.getImage(cover, handleGetImage)
                            })
                            const handleGetImage = (err, file, mimeType) => {
                                // console.log(err, file, mimeType)
                                if (err) {
                                    rej(err)
                                } else {
                                    // res
                                    const suffix = mimeType.split('/')[1];
                                    const coverPath = `${UPLOAD_PATH}/img/${this.fileName}.${suffix}`
                                    const coverUrl = `${UPLOAD_URL}/img/${this.fileName}.${suffix}`
                                    fs.writeFileSync(coverPath, file, 'binary')
                                    this.coverPath = `/img/${this.fileName}.${suffix}`
                                    this.cover = coverUrl
                                    res(this)
                                }
                            }
                        } catch (e) {
                            rej(e)
                        }

                    }
                }
            })
            epub.parse()
        })
    }

    unzip() {
        const AdmZip = require('adm-zip')
        const zip = new AdmZip(Book.genPath(this.path))
        zip.extractAllTo(Book.genPath(this.unzipPath), true)

    }

    parseContents(epub) {
        function getNcxFliePath() {
            const spine = epub && epub.spine
            const manifest = epub && epub.manifest
            const ncx = spine.toc && spine.toc.href
            const id = spine.toc && spine.toc.id
            // console.log('spine', spine, ncx, manifest[id].href)
            if (ncx) {
                return ncx
            } else {
                return manifest[id].href
            }
        }
        function findParent(array, level = 0, pid = '') {
            return array.map(item => {
                item.level = level;
                item.pid = pid
                if (item.navPoint && item.navPoint.length > 0) {
                    item.navPoint = findParent(item.navPoint, level + 1, item['$'].id)
                } else if (item.navPoint) {
                    item.navPoint.level = level + 1
                    item.navPoninte.pid = item['$'].id
                }
                return item
            })
        }
        function flatten(array) {
            return [].concat(...array.map(item => {
                // return item
                if (item.navPoint && item.navPoint.length > 0) {
                    return [].concat(item, ...flatten(item.navPoint))
                } else if (item.navPoint) {
                    return [].concat(item, item.navPoint)
                }
                return item
            }))
        }
        const ncxFilePath = Book.genPath(`${this.unzipPath}/${getNcxFliePath()}`)
        // console.log(ncxFilePath, 'ncxFilePath');
        if (fs.existsSync(ncxFilePath)) {
            return new Promise((res, rej) => {
                const xml = fs.readFileSync(ncxFilePath, 'utf-8')
                const dir = path.dirname(ncxFilePath).replace(UPLOAD_PATH, '');
                const fileName = this.fileName
                xml2js(xml, {
                    explicitArray: false,
                    ignoreAttrs: false
                }, function (err, json) {
                    if (err) {
                        rej(err)
                    } else {
                        // console.log(json)
                        const navMap = json.ncx.navMap
                        if (navMap.navPoint && navMap.navPoint.length > 0) {
                            navMap.navPoint = findParent(navMap.navPoint)
                            const newNavMap = flatten(navMap.navPoint)
                            console.log('newNavMap',newNavMap)
                            const chapters = [];
                            newNavMap.forEach((chapter, index) => {
                                console.log(chapter.content['$'])
                                const src = chapter.content['$'].src
                                const nav = newNavMap[index]
                                chapter.text = `${UPLOAD_URL}${dir}/${src}`
                                // console.log(chapter.text, 'text')
                                chapter.label = nav.navLabel.text || ''

                                chapter.navId = nav['$'].id
                                chapter.fileName = fileName
                                chapter.order = index + 1
                                chapters.push(chapter)
                            })
                            const chaptersTree = [];
                            chapters.forEach(v => {
                                v.children = [];
                                if (v.pid === '') {
                                    chaptersTree.push(v)
                                } else {
                                    const parent = chapters.find(c => c.navId === v.pid)
                                    parent.children.push(v)
                                }

                            })
                            // console.log(chapters, 'chaptersArr')
                            res({ chapters, chaptersTree })
                        } else {
                            rej(new Error('目录解析失败，目录数为0'))
                        }
                    }
                })
            })
        }
    }

    static genPath(path) {
        if (!path.startsWith('/')) {
            path = `/${path}`
        }
        return `${UPLOAD_PATH}${path}`
    }
}

module.exports = Book