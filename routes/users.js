import express from 'express'
import userSQL from '../db/Usersql'
import jwt from 'jsonwebtoken'
import redis from 'redis'
import redisClient from '../utils/redis_optons'
import concreatePool from '../utils/connect_db'
import { responseJSON } from '../utils/utils'
const router = express.Router();

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
router.get('/login', function (request, response, next) {
    concreatePool({ sqlCode: userSQL.queryAll }).then(result => {
        const param = request.query || request.params;
        const user_name = param.user_name;
        const password = param.password
        let isTrue = false;
        let userInfo = {}
        if (result) { //获取用户列表，循环遍历判断当前用户是否存在
            for (let i = 0; i < result.length; i++) {
                if (result[i].user_name == user_name && result[i].password == password) {
                    userInfo = result[i]
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
            redisClient.set(token, userInfo.user_id, 'EX', 10)
            data = {
                userInfo,
                token,
            }

        } else {
            data = {
                message: '登录失败'
            }
        }
        // if (err) data.err = err;
        responseJSON(response, data);
    }).catch(err => {
        console.log('err', err)
    })
});

// 验证用户是否登录
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

// 查询用户信息
router.get('/userinfo', function (request, response, next) {
    const param = request.query || request.params;
    const authorization = param.authorization;
    const calback = function (user_id) {
        concreatePool({ sqlCode: userSQL.getUserById, placeValues: [user_id] }).then(result => {
            let userInfo = {}
            if (result) { //获取用户列表，循环遍历判断当前用户是否存在
                userInfo = result[0]
            }
            responseJSON(response, { userInfo });
        }).catch(err => {
            console.log('err', err)
        })
    }
    redisClient.get(authorization, function (err, replys) {
        if (err) {
            console.log('get_err', err)
        }
        const user_id = replys
        calback(user_id)
    });
    // console.log('user_id', user_id)

});

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;
//https://blog.csdn.net/qq_38209578/article/details/82666820