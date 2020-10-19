const { pool, connectionNonTransaction } = require('../../../config/database');
const { logger } = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const utils = require('../../../config/resModule');
const jwtDecode = require('jwt-decode');
// var decoded = jwt_decode(token);
const regexDay = /^[1-9]{1}$|^[1-3]{1}[0-1]{1}$|^10$/;
const regexWateAmount = /^[0-9]+$/;
const regexNum = /^[0-9]*$/;


/**
 update : 2020.10
 01.항목 추가 api / addItem
 */

exports.addItem = async function (req, res) { // 배열 형식으로 수정.
    const token = req.headers['x-access-token'] || req.query.token;
    const decoded = jwt.verify(token, secret_config.jwtsecret);
    const email = decoded.email;
    const {
        name, amount, itemList
    } = req.body;

    if(null!= name) {
        if (!name) return res.json({isSuccess: false, code: 100, message: "항목명을 입력해주세요."});
        if (!amount) return res.json({isSuccess: false, code: 101, message: "금액을 입력해주세요."});
        if (!regexNum.test(amount)) return res.json({isSuccess: false, code: 102, message: "금액을 숫자로만 입력해주세요."});

        if (name.length > 30) return res.json({
            isSuccess: false,
            code: 103,
            message: "항목명을 30자리 미만으로 입력해주세요."
        });
        if (amount.length > 30) return res.json({
            isSuccess: false,
            code: 104,
            message: "금액을 30자리 미만으로 입력해주세요."
        });
    }


    if(null != itemList){
        for (let i = 0; i < itemList.length; i++) { //cartNo 개수만큼 orderNo insert
            if (!itemList[i].name) return res.json({isSuccess: false, code: 100, message: "항목명을 입력해주세요."});
            if (!itemList[i].amount) return res.json({isSuccess: false, code: 101, message: "금액을 입력해주세요."});
            if (!regexNum.test(itemList[i].amount)) return res.json({isSuccess: false, code: 102, message: "금액을 숫자로만 입력해주세요."});

            if (itemList[i].name.length > 30) return res.json({
                isSuccess: false,
                code: 103,
                message: "항목명을 30자리 미만으로 입력해주세요."
            });
            if (itemList[i].amount.length > 30) return res.json({
                isSuccess: false,
                code: 104,
                message: "금액을 30자리 미만으로 입력해주세요."
            });
        }
    }

    try {
        if(itemList){
            const addItemsQuery = 'INSERT INTO WasteItem (userId, name, amount) VALUES (?,?,?);'

            for (let i = 0; i < itemList.length; i++){
                let addItemsParams = [email, itemList[i].name, itemList[i].amount];
                const addIteemRows = await connectionNonTransaction(
                   addItemsQuery, addItemsParams
               )
            }
            // const selectLatestRows2 = await connectionNonTransaction(
            //     `SELECT no FROM WasteItem ORDER BY NO DESC LIMIT 1;`
            // )
            return res.json({
                isSuccess: true,
                code: 200,
                message: "낭비 항목 추가 성공",
                // itemNo: selectLatestRows2[0].no
            })

        }

        const insertItemQuery = `INSERT INTO WasteItem (userId, name, amount) VALUES (?,?,?);`
        const rows = await connectionNonTransaction(
            `INSERT INTO WasteItem (userId, name, amount) VALUES (?,?,?);`, [email, name, amount]
        );
        const selectLatestRows = await connectionNonTransaction(
            `SELECT no FROM WasteItem ORDER BY NO DESC LIMIT 1;`
        )
        return res.json({
            isSuccess: true,
            code:200,
            message: "낭비 항목 추가 성공",
            itemNo: selectLatestRows[0].no
        });
    } catch (err) {
        logger.error(`App - addItem DB Connection error\n: ${JSON.stringify(err)}`);
        return res.send(utils.successFalse(400, "DB 연결 실패"));
    }
}


/**
 update : 2020.09.09
 01.항목 조회 api / getItems
 */

exports.getItems = async function (req, res) {
    const token = req.headers['x-access-token'] || req.query.token;
    const decoded = jwt.verify(token, secret_config.jwtsecret);
    const email = decoded.email;

    try {
        const selectItemQuery = `SELECT no as itemNo, name, amount, date_format(createdAt, '%Y-%m-%d') as createdAt FROM
        WasteItem
WHERE userId = ? and isDeleted = 'N'
ORDER BY WasteItem.createdAt DESC;`

        const selectItemRows = await connectionNonTransaction(selectItemQuery, [email]);
        if(selectItemRows.length < 1){
            res.send(utils.successFalse(300, "추가된 낭비 항목이 없습니다."));
        }
        return res.send(utils.successTrue(200, "낭비 항목 목록 조회 성공", selectItemRows))
    } catch (err) {
        logger.error(`App - UsersList DB Connection error\n: ${JSON.stringify(err)}`);
        return res.send(utils.successFalse(400, "DB 연결 실패"));
    }
}

/**
 update : 2020.09.09
 항목 수정 api/ updateItem
 */
exports.updateItem = async function (req, res) {
    const token = req.headers['x-access-token'] || req.query.token;
    const decoded = jwt.verify(token, secret_config.jwtsecret);
    const email = decoded.email;
    const {
        itemNo, name, amount
    } = req.body;

    if (!itemNo) return res.json({ isSuccess: false, code: 100, message: "항목 번호를 입력해주세요." });
    if(amount) {
        if (!regexNum.test(amount)) return res.json({isSuccess: false, code: 101, message: "금액을 숫자로만 입력해주세요."});
    }

    try {
        const selectItemQuery = `SELECT no FROM WasteItem WHERE userId = ? and no = ? and isDeleted = 'N';`
        const selectItemRows = await connectionNonTransaction(
            selectItemQuery, [email, itemNo]
        )
        if(selectItemRows < 1){
            res.send(utils.successFalse(301, "존재하지 않는 항목 번호입니다."))
        }
        if(name) {
            const updateNameQuery = `UPDATE WasteItem SET name = ? WHERE userId = ? and no = ? and isDeleted = 'N';`
            const updateNameRows = await connectionNonTransaction(
                updateNameQuery, [name, email, itemNo]
            );
        }
        if(amount) {
            const updateNameQuery = `UPDATE WasteItem SET amount = ? WHERE userId = ? and no = ? and isDeleted = 'N';`
            const updateNameRows = await connectionNonTransaction(
                updateNameQuery, [amount, email, itemNo]
            );
        }
        return res.send(utils.successTrue(200, "항목 수정 성공."))
    } catch (err) {
        logger.error(`App - UsersList DB Connection error\n: ${JSON.stringify(err)}`);
        return res.send(utils.successFalse(400, "DB 연결 실패"));
    }
}

/**
 update : 2020.09.10
 항목 삭제 api/ deleteItem
 */

exports.deleteItem = async function (req, res) {
    const token = req.headers['x-access-token'] || req.query.token;
    const decoded = jwt.verify(token, secret_config.jwtsecret);
    const email = decoded.email;
    const {
        itemNo
    } = req.query;

    if (!itemNo) return res.json({ isSuccess: false, code: 100, message: "아이템 번호를 입력해주세요." })
    if (!regexNum.test(itemNo)) return res.json({ isSuccess: false, code: 101, message: "아이템 번호를 숫자로만 입력해주세요." });
    if (itemNo.length > 30) return res.json({
        isSuccess: false,
        code: 302,
        message: "아이템 번호를 30자리 미만으로 입력해주세요."
    });

    try {
        const existItemRows = await connectionNonTransaction(
            `SELECT no FROM WasteItem
            WHERE userId = ? and no = ? and isDeleted = 'N'`,[email, itemNo]
        );
        if (existItemRows.length < 1) {
            return res.send(utils.successFalse(301, "존재하지 않거나 삭제된 항목 번호입니다."));
        }
        const deleteItemRows = await connectionNonTransaction(
            `UPDATE WasteItem SET isDeleted = 'Y' WHERE userId = ? and no = ?;`, [email, itemNo]
        );
        return res.send(utils.successTrue(200, "낭비 항목 삭제 성공."))
    } catch (err) {
        logger.error(`App - UsersList DB Connection error\n: ${JSON.stringify(err)}`);
        return res.send(utils.successFalse(400, "DB 연결 실패"));
    }
}
