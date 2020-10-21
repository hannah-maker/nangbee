// nodemailer 모듈 요청
const nodemailer = require('nodemailer');

// 메일발송 객체
const mailSender = {
    // 메일발송 함수
    sendGmail : function(param){
        const transporter = nodemailer.createTransport({
            service: 'gmail'
            ,host :'smtp.gmail.com'
            ,secure : false
            ,requireTLS : true
            , auth: {
                user: 'mpmd37@gmail.com'
                ,pass: 'Kjoy2357**'
            }
        });
        // 메일 옵션
        const mailOptions = {
            from: 'mpmd37@gmail.com',
            to: param.toEmail, // 수신할 이메일
            subject: param.subject, // 메일 제목
            text: param.text, // 메일 내용

            attachments:param.attachments, //첨부 파일
            // attachments: [
            //     {
            //         filename: req.files.fieldname,
            //         path: req.files.path
            //     }
            // ]
        };
        // 메일 발송
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }
}
// 메일객체 exports
module.exports = mailSender;