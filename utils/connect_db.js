import mysql from 'mysql'
import DBconfig from '../db/DBconfig'
const pool = mysql.createPool(DBconfig.mysql);
// 查询数据库
// export const pool = mysql.createPool(DBconfig.mysql);
const concreatePool = function ({ sqlCode, placeValues = [] }) {
    return new Promise((resolve, reject) => {
        pool.getConnection(function (err, connection) {
            if (err) {
                connection.release();
                reject(err)
            }
            connection.query(sqlCode, placeValues, function (error, res) {
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
