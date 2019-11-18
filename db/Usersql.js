var UserSQL = {
    insert: 'INSERT INTO users(user_id,user_name,password) VALUES(?,?,?)', // 插入数据
    update: 'update users set ? where user_name=?',//设置头像
    drop: 'DROP TABLE users', // 删除表中所有的数据
    queryAll: 'SELECT * FROM users', // 查找表中所有数据
    getUserById: 'SELECT * FROM users WHERE uid =?', // 查找符合条件的数据
};
module.exports = UserSQL;

//解决mysql连接不上 https://www.jianshu.com/p/e3105a4657b8