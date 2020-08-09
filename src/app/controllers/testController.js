const { pool, exampleNonTransaction } = require('../../../config/database');
const { logger } = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');
const utils = require('../../../config/resModule');

// // exports.practice = async function (req, res) {

exports.getTest = async function (req, res) {
    // console.log("GET 메소드를 사용하는 /test 라우팅 연결이 성공하였습니다.");
    return res.send({"message":"hi"});
};