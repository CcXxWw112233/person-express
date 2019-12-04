import express from 'express'
import mysql from 'mysql'
import DBconfig from '../db/DBconfig'
import userSQL from '../db/Usersql'
import jwt from 'jsonwebtoken'
import redis from 'redis'
import redisClient from '../utils/redis_optons'
const router = express.Router();

// 使用DBConfig.js的配置信息创建一个MySql链接池
const pool = mysql.createPool(DBconfig.mysql);
// 响应一个JSON数据
const responseJSON = function (res, ret) {
    if (typeof ret === 'undefined') {
        res.json({
            code: '-200',
            message: '操作失败'
        });
    } else {
        res.json(ret);
    }
};
// 用户注册
router.get('/regist', function (req, res, next) {
    // 从连接池获取连接
    pool.getConnection(function (err, connection) {
        // 获取前台页面传过来的参数
        let param = req.query || req.params;
        let user_name = param.user_name;
        let password = param.password;
        let _res = res;
        connection.query(userSQL.queryAll, function (err, res) {
            let isTrue = false;
            if (res) { //获取用户列表，循环遍历判断当前用户是否存在
                for (let i = 0; i < res.length; i++) {
                    if (res[i].user_name == user_name) {
                        isTrue = true;
                        break
                    }
                }
            }
            let data = {};
            if (isTrue) {
                data = {
                    code: 1,
                    message: '用户已存在'
                };//登录成功返回用户信息
            } else {
                const user_id = new Date().getTime().toString()
                connection.query(userSQL.insert, [user_id, user_name, password], function (err, result) {
                    if (result) {
                        data = {
                            code: 0,
                            message: '注册成功'
                        };
                    } else {
                        data = {
                            code: -1,
                            message: '注册失败',
                            err: err
                        };
                    }
                });
            }

            if (err) data.err = err;
            // 以json形式，把操作结果返回给前台页面
            setTimeout(function () {
                responseJSON(_res, data)
            }, 300);
            // 释放链接
            connection.release();

        });
    });
});
// 用户登录
router.get('/login', function (req, res, next) {
    // 从连接池获取连接
    pool.getConnection(function (err, connection) {
        // 获取前台页面传过来的参数
        let param = req.query || req.params;
        let user_name = param.user_name;
        let password = param.password
        let _res = res;
        connection.query(userSQL.queryAll, function (err, res, result) {
            let isTrue = false;
            let userInfo = {}
            if (res) { //获取用户列表，循环遍历判断当前用户是否存在
                for (let i = 0; i < res.length; i++) {
                    if (res[i].user_name == user_name && res[i].password == password) {
                        userInfo = res[i]
                        isTrue = true;
                        break
                    }
                }
            }
            let data = {};
            if (isTrue) {
                const token = jwt.sign({ user_id: userInfo.user_id, }, 'abcd', {
                    // 过期时间
                    expiresIn: "60s"
                })
                redisClient.set('token', token, redis.print)
                data = {
                    userInfo,
                    code: '0',
                    token,
                }

            } else {
                data = {
                    code: '-1',
                    message: '登录失败'
                }
            }
            if (err) data.err = err;
            // 以json形式，把操作结果返回给前台页面
            responseJSON(_res, data);

            // 释放链接
            connection.release();

        });
    });
});

// 查询用户信息
router.get('/validate', function (req, res, next) {
    // 从连接池获取连接
    // 验证token合法性 对token进行解码
    const token = req.headers.authorization;
    jwt.verify(token, 'abcd', function (err, decode) {
        if (err) {
            res.json({
                message: '当前用户未登录'
            })
        } else {
            // 证明用户已经登录
            res.json({
                token: jwt.sign({ user_id: decode.user_id }, 'abcd', {
                    // 过期时间
                    expiresIn: "60s"
                }),
                decode,
                message: '已登录'
            })
        }
    })
});

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;
//https://blog.csdn.net/qq_38209578/article/details/82666820