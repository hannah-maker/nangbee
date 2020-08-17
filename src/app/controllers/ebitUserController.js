const { pool, exampleNonTransaction } = require('../../../config/database');
const { logger } = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const utils = require('../../../config/resModule');
const jwtDecode = require('jwt-decode');

exports.ebitSignUp = async function (req, res) {
    const {
        id, pw, phone, ssn, country
    } = req.body;

    if (!id) return res.json({ isSuccess: false, code: 301, message: "아이디 입력해주세요." });
    if (id.length > 30) return res.json({
        isSuccess: false,
        code: 302,
        message: "아이디 30자리 미만으로 입력해주세요."
    });

    // if (!regexEmail.test(email)) return res.json({ isSuccess: false, code: 303, message: "이메일을 형식을 정확하게 입력해주세요." });

    if (!pw) return res.json({ isSuccess: false, code: 304, message: "비밀번호를 입력 해주세요." });
    if (pw.length < 6 || pw.length > 20) return res.json({
        isSuccess: false,
        code: 305,
        message: "비밀번호는 6~20자리를 입력해주세요."
    });

    if (!phone) return res.json({ isSuccess: false, code: 306, message: "전화번호 입력 해주세요." });
    if (phone.length > 20) return res.json({
        isSuccess: false,
        code: 307,
        message: "전화번호 형식에 맞추어 입력해주세요."
    });

    if (!ssn) return res.json({ isSuccess: false, code: 306, message: "전화번호 입력 해주세요." });
    if (ssn.length > 20) return res.json({
        isSuccess: false,
        code: 307,
        message: "ssn 형식에 맞추어 입력해주세요."
    });

    if (!country) return res.json({ isSuccess: false, code: 306, message: "전화번호 입력 해주세요." });
    if (country.length > 20) return res.json({
        isSuccess: false,
        code: 307,
        message: "country code 형식에 맞추어 입력해주세요."
    });


    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            // 이메일 중복 확인
            const selectIdQuery = `
                SELECT id
                FROM EbitUser 
                WHERE id = ?;
                `;
            const selectIdParams = [id];
            const [idRows] = await connection.query(selectIdQuery, selectIdParams);

            if (idRows.length > 0) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 308,
                    message: "중복된 아이입니다."
                });
            }

            await connection.beginTransaction(); // START TRANSACTION
            const hashedPassword = await crypto.createHash('sha512').update(pw).digest('hex');

            const insertUserInfoQuery = `
                INSERT INTO UserInfo(id, pw, phone, ssn, country)
                VALUES (?, ?, ?, ?, ?);
                    `;
            const insertUserInfoParams = [id, hashedPassword, phone, ssn, country];
            await connection.query(insertUserInfoQuery, insertUserInfoParams);

            await connection.commit(); // COMMIT
            connection.release();
            return res.json({
                isSuccess: true,
                code: 200,
                message: "회원가입 성공"
            });
        } catch (err) {
            await connection.rollback(); // ROLLBACK
            connection.release();
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`App - SignUp DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};