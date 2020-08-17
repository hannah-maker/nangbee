const mysql = require('mysql2/promise');
const {logger} = require('./winston');

// 데이터베이스 기본정보 입력, 풀생성
const pool = mysql.createPool({
    host: 'makeus.crrwqxfatpvw.ap-northeast-2.rds.amazonaws.com',
    user: 'hannah',
    password: 'Hsh0913**',
    database: 'makeus'
});
// 트렌젝션 없는 커넥션
const exampleNonTransaction = async (sql, params) => {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const [rows] = await connection.query(sql, params);
            connection.release();
            return rows;
        } catch(err) {
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch(err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};
// 트렌젝션 있는 커넥션
const exampleTransaction = async (sql, params) => {
    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            await connection.beginTransaction(); // START TRANSACTION
            const [rows] = await connection.query(sql, params);
            await connection.commit(); // COMMIT
            connection.release();
            return rows;
        } catch(err) {
            await connection.rollback(); // ROLLBACK
            connection.release();
            logger.error(`example transaction Query error\n: ${JSON.stringify(err)}`);
            return false;
        }
    } catch(err) {
        logger.error(`example transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

module.exports = {
    pool, exampleNonTransaction
};
