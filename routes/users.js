var express = require('express');
var app = express();
var router = express.Router();
var URL = require('url');
// 导入MySql模块
var mysql = require('mysql');
var DBconfig = require('../db/DBconfig');
var userSQL = require('../db/Usersql');



// 使用DBConfig.js的配置信息创建一个MySql链接池
var pool = mysql.createPool(DBconfig.mysql);
// 响应一个JSON数据
var responseJSON = function (res, ret) {
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
        var param = req.query || req.params;
        var user_name = param.user_name;
        var password = param.password;
        var _res = res;
        connection.query(userSQL.queryAll, function (err, res) {
            var isTrue = false;
            if (res) { //获取用户列表，循环遍历判断当前用户是否存在
                for (var i = 0; i < res.length; i++) {
                    if (res[i].user_name == user_name) {
                        isTrue = true;
                        break
                    }
                }
            }
            var data = {};
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
        var param = req.query || req.params;
        var user_name = param.user_name;
        var password = param.password
        var _res = res;
        connection.query(userSQL.queryAll, function (err, res, result) {
            var isTrue = false;
            let userInfo = {}
            if (res) { //获取用户列表，循环遍历判断当前用户是否存在
                for (var i = 0; i < res.length; i++) {
                    if (res[i].user_name == user_name && res[i].password == password) {
                        userInfo = res[i]
                        isTrue = true;
                        break
                    }
                }
            }
            var data = {};
            if (isTrue) {
                data = {
                    userInfo,
                    code: '0'
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

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

module.exports = router;
//https://blog.csdn.net/qq_38209578/article/details/82666820