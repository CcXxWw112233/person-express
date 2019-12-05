import mysql from 'mysql'
import DBconfig from '../db/DBconfig'
const pool = mysql.createPool(DBconfig.mysql);
// 查询数据库
// export const pool = mysql.createPool(DBconfig.mysql);
const concreatePool = function ({ sqlCode }) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                reject(err)
            }
            connection.query(sqlCode, function (error, res) {
                if (error) {
                    connection.release();
                    reject(error)
                }
                connection.release();
                resolve(res)
            })
        })
    })
}
export default concreatePool
