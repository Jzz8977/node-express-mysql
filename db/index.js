const mysql = require('mysql');
const config = require('./config')
const { debug } = require('../utils/constant')
function _connect() {
    const pool = mysql.createPool(config.mysql)
    return pool
}
function query(sqlStr) {
    let pool = _connect();
    debug && console.log(sqlStr, '111111111111111')
    return new Promise((resolve, reject) => {
        // 从连接池里面拿一个连接
        pool.getConnection(function (err, connection) {
            if (err) {
                debug && console.log('连接数据库失败,原因:' + JSON.stringify(err));
                return reject(err)
            }
            connection.query(sqlStr, (error, ...args) => {
                // 操作结束尽早释放连接
                connection.release();
                if (error) {
                    debug && console.log('查询失败,原因:' + JSON.stringify(err));
                    return reject(error)
                };
                // debug && console.log('查询成功:' + JSON.stringify(args));
                resolve(...args)
            });
        });
    })
}

function queryOne(sqlStr) {
    debug && console.log(sqlStr, '111111111111111')
    return new Promise((resolve, reject) => {
        // 从连接池里面拿一个连接
        query(sqlStr).then(result => {
            debug && console.log(sqlStr, '******')
            if (result && result.length > 0) {
                resolve(result[0]);
            } else {
                reject(null);
            }
        }).catch(err => {
            reject(err);
        })
    })
}
// 查询返回的是数组
// 增删改返回的是对象

module.exports = {
    query,
    queryOne
}