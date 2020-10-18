const { pool, connectionNonTransaction } = require('../../../config/database');
const { logger } = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const utils = require('../../../config/resModule');
const jwtDecode = require('jwt-decode');
// var decoded = jwt_decode(token);
// const regexDay = /^[1-9]{1}$|^[1-3]{1}[0-1]{1}$|^10$/;
const regexWateAmount = /^[0-9]+$/;

/**
 update : 2019.11.01
 01.signUp API = 회원가입
 */
exports.signUp = async function (req, res) {
    const {
        email, password, nickName, wasteAmount, startDay, character
    } = req.body;

    if (!email) return res.json({ isSuccess: false, code: 301, message: "이메일을 입력해주세요." });
    if (email.length > 30) return res.json({
        isSuccess: false,
        code: 302,
        message: "이메일은 30자리 미만으로 입력해주세요."
    });

    if (!regexEmail.test(email)) return res.json({ isSuccess: false, code: 303, message: "이메일을 형식을 정확하게 입력해주세요." });

    if (!password) return res.json({ isSuccess: false, code: 304, message: "비밀번호를 입력 해주세요." });
    if (password.length < 4 || password.length > 20) return res.json({
        isSuccess: false,
        code: 305,
        message: "비밀번호는 4~20자리를 입력해주세요."
    });

    if (!nickName) return res.json({ isSuccess: false, code: 306, message: "닉네임을 입력 해주세요." });
    if (nickName.length > 20) return res.json({
        isSuccess: false,
        code: 307,
        message: "닉네임은 20자리 미만으로 입력해주세요."
    });

    if (!wasteAmount) return res.json({ isSuccess: false, code: 308, message: "목표 낭비 금액을 입력해주세요." });
    if (wasteAmount.length > 50) return res.json({
        isSuccess: false,
        code: 309,
        message: "금액을 50자리 이하로 입력해주세요. "
    });
    if (!regexWateAmount.test(wasteAmount)) return res.json({ isSuccess: false, code: 310, message: "숫자로만 금액을 입력해주세요." });

    if (!startDay) return res.json({ isSuccess: false, code: 311, message: "시작 날짜를 입력해주세요." });

    if (!character) return res.json({ isSuccess: false, code: 315, message: "캐릭터 설정을 입력해주세요." });
    if (character.length > 30) return res.json({
        isSuccess: false,
        code: 316,
        message: "캐릭터 설정 30자리 미만으로 입력해주세요."
    });
    // if (!regexDay.test(startDay)) return res.json({ isSuccess: false, code: 312, message: "시작 날짜를 날짜로 입력해 주세요" });

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            // 이메일 중복 확인
            const selectEmailQuery = `
                SELECT email
                FROM User 
                WHERE email = ?;
                `;
            const selectEmailParams = [email];
            const [emailRows] = await connection.query(selectEmailQuery, selectEmailParams); //값을 넣어서 완전한 쿼리를 만듦

            if (emailRows.length > 0) { //결과값이 있으면 0보타 크므로
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 313,
                    message: "중복된 이메일입니다."
                });
            }

            await connection.beginTransaction(); // START TRANSACTION
            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');

            const insertUserQuery = `
                INSERT INTO User(email, pswd, nickName, wasteAmount, startDay, \`character\`)
                VALUES (?, ?, ?, ?, ?, ?);
                    `;
            const insertUserParams = [email, hashedPassword, nickName, wasteAmount, startDay, character]; // 두 값을 넣을 때면 이런식으로 나열
            await connection.query(insertUserQuery, insertUserParams);

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

/**
 update : 2019.11.01
 02.signIn API = 로그인
 **/
exports.signIn = async function (req, res) {
    const {
        email, password
    } = req.body;

    if (!email) return res.json({ isSuccess: false, code: 301, message: "이메일을 입력해주세요." });
    if (email.length > 30) return res.json({
        isSuccess: false,
        code: 302,
        message: "이메일은 30자리 미만으로 입력해주세요."
    });

    if (!regexEmail.test(email)) return res.json({ isSuccess: false, code: 303, message: "이메일을 형식을 정확하게 입력해주세요." });

    if (!password) return res.json({ isSuccess: false, code: 304, message: "비밀번호를 입력 해주세요." });

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const selectUserInfoQuery = `
                SELECT email, isDeleted, pswd
                
                FROM User
                WHERE email = ?;
                `;

            let selectUserInfoParams = [email];

            const [userInfoRows] = await connection.query(selectUserInfoQuery, selectUserInfoParams);

            if (userInfoRows < 1) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 310,
                    message: "탈퇴됐거나 등록되지 않은 계정입니다. "
                });
            }
            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            if (userInfoRows[0].pswd !== hashedPassword) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 311,
                    message: "비밀번호를 확인해주세요."
                });
            }
            if (userInfoRows[0].isDeleted == 'Y') {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 312,
                    message: "탈퇴된 계정입니다. 관리자에게 문의해주세요."
                });
            }
            // } else if (userInfoRows[0].idDeleted === "Y") {
            //     connection.release();
            //     return res.json({
            //         isSuccess: false,
            //         code: 313,
            //         message: "탈퇴 된 계정입니다. 고객센터에 문의해주세요."
            //     });
            // }
            //토큰 생성
            let token = await jwt.sign({
                email: userInfoRows[0].email,
                // email: email,
                password: hashedPassword,
                // nickname: userInfoRows[0].nickname,
            }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
                {
                    expiresIn: '365d',
                    subject: 'userInfo',
                } // 유효 시간은 365일
            );
            res.json({
                // userInfo: userInfoRows[0],
                jwt: token,
                isSuccess: true,
                code: 201,
                message: "로그인 성공"
            });
            connection.release();
        } catch (err) {
            logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        logger.error(`App - SignIn DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};
/**
 update : 2020.04.18
 03. 모듈안쓰고 회원 정보 가져오기
 **/
exports.getUser = async function (req, res) {
    const connection = await pool.getConnection(async conn => conn);
    try {
        const selectUserInfoQuery = `
            SELECT email, pswd
            FROM User;
            `;
        const [userInfoRows] = await connection.query(selectUserInfoQuery);

        if (userInfoRows.length < 1) {
            connection.release();
            return res.json({
                isSuccess: false,
                code: 301,
                message: "회원이 없습니다."
            });
        }
        return res.json({
            isSuccess: true,
            code: 200,
            message: "회원이 검색되었습니다.",
            result : userInfoRows
        })
    } catch (err) {
        logger.error(`App - getUser DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};
/**
 update : 2020.04.18
 04. 모듈쓰고 회원 정보 가져오기 (database.js / resModule.js)
 **/
exports.getModuleUser = async function (req, res) {
    try {
        const selectUserInfoQuery = `
            SELECT id, pw
            FROM User;
            `;
        const userInfoRows = await exampleNonTransaction(selectUserInfoQuery);
        if (userInfoRows.length < 1) {
            return res.send(utils.successFalse(301, "회원이 없습니다."))
        }
        return res.send(utils.successTrue(200, "회원이 검색되었습니다.", userInfoRows ))
    } catch (err) {
        logger.error(`App - getModuleUser DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

exports.verifyToken = async function (req, res) {

    const token = req.headers['x-access-token'] || req.query.token;
    const decoded = jwt.verify(token, secret_config.jwtsecret);
    const email = decoded.email
    // return res.send({email});

    try {
        const connection = await pool.getConnection(async conn => conn);
        try {
            const selectUserInfoQuery = `
                SELECT email
                FROM User
                WHERE email = ?;
                `;

            let selectUserInfoParams = [email];

            const [userInfoRows] = await connection.query(selectUserInfoQuery, selectUserInfoParams);

            if (userInfoRows < 1) {
                connection.release();
                return res.json({
                    isSuccess: false,
                    code: 310,
                    message: "아이디를 확인해주세요."
                });
            }
            res.json({
                result: userInfoRows[0],
                isSuccess: true,
                code: 200,
                message: "로그인 성공"
            });
            connection.release();
        } catch (err) {
            logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch (err) {
        logger.error(`App - SignIn DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

/**
 update : 2020.09
 사용자 프로필 조회 api
 **/
exports.getUserProfile = async function (req, res) {
    const token = req.headers['x-access-token'] || req.query.token;
    const decoded = jwt.verify(token, secret_config.jwtsecret);
    const email = decoded.email;

    try {
        const selectUserQuery = `SELECT email, wasteAmount, nickName, startDay, wasteAmount, \`character\` FROM User WHERE email = ? and isDeleted = 'N'`

        const selectUserInfoRow = await connectionNonTransaction(selectUserQuery, [email]);

        if(selectUserInfoRow.length < 1){
            return res.send(utils.successFalse(300, "사용자 정보가 없습니다. 관리자에게 문의해주세요."));
        }
        return res.send(utils.successTrue(200, "사용자 프로필 조회 성공", selectUserInfoRow[0]))
    } catch (err) {
        logger.error(`App - getUserProfile DB Connection error\n: ${JSON.stringify(err)}`);
        return res.send(utils.successFalse(400, "DB 연결 실패"));
    }
};


/**
 update : 2020.10
 사용자 탈퇴 api
 **/
exports.deleteUser = async function (req, res) {
    const token = req.headers['x-access-token'] || req.query.token;
    const decoded = jwt.verify(token, secret_config.jwtsecret);
    const email = decoded.email;

    try {
        const existUserRows = await connectionNonTransaction(
            `SELECT email FROM User
            WHERE email = ? and isDeleted = 'N';`,[email]
        );
        if (existUserRows.length < 1) { // 사용자가 존재하지 않는 경우
            return res.send(utils.successFalse(301, "존재하지 않거나 삭제된 사용자 입니다."));
        }
        const deleteUserRows = await connectionNonTransaction(
            `UPDATE User SET isDeleted = 'Y' WHERE email = ?;`, [email]
        );
        return res.send(utils.successTrue(200, "사용자 탈퇴 성공."))
    } catch (err) {
        logger.error(`App - UsersList DB Connection error\n: ${JSON.stringify(err)}`);
        return res.send(utils.successFalse(400, "DB 연결 실패"));
    }
}
