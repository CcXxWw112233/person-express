var UserSQL = {
    insert: 'INSERT INTO user(uid,userName,password) VALUES(?,?,?)', // 插入数据
    drop: 'DROP TABLE user', // 删除表中所有的数据
    queryAll: 'SELECT * FROM user', // 查找表中所有数据
    getUserById: 'SELECT * FROM user WHERE uid =?', // 查找符合条件的数据
};
module.exports = UserSQL;

//解决mysql连接不上 https://www.jianshu.com/p/e3105a4657b8