var mysql = require("mysql2"); // mysql 모듈을 불러옵니다.

// 커넥션을 정의합니다.
// RDS Console 에서 본인이 설정한 값을 입력해주세요.
var connection = mysql.createConnection({
    host: "makeus.crrwqxfatpvw.ap-northeast-2.rds.amazonaws.com",
    user: "hannah",
    password: "Hsh0913**",
    database: "makeus"
});

// RDS에 접속합니다.
connection.connect(function(err) {
    if (err) {
        throw err; // 접속에 실패하면 에러를 throw 합니다.
    } else {
        // 접속시 쿼리를 보냅니다.
        connection.query("SELECT * FROM User", function(err, rows, fields) {
            console.log(rows); // 결과를 출력합니다!
        });
    }
});
