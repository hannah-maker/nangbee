module.exports = function(app){
    const test = require('../controllers/testController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    app.get('/test', test.getTest);             // 테스트 api
}

// module.exports = function(app){
//     const user = require('../controllers/userController');
//     const jwtMiddleware = require('../../../config/jwtMiddleware');
//
//     app.route('/app/signUp').post(user.signUp);
//     app.route('/app/signIn').post(user.signIn);
//
//     app.get('/user', user.getUser);             // 모듈 사용하지 않고 회원정보 받아오기
//     // app.get('/test', test.practice);             // 모듈 사용하지 않고 회원정보 받아오기
//     app.get('/moduleuser', user.getModuleUser); // 모듈 사용하여 회원정보 받아오기
// }