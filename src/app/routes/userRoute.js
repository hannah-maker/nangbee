module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/user').post(user.signUp);
    app.route('/token').post(user.signIn);


    app.get('/tokenTest', jwtMiddleware, user.verifyToken); // 토큰 검증이 하고 싶으면 이렇게 앞에 다가 달면 됨.. get에 app을 달면 인식을 못한다.
    // app.get('/decodeToken', jwtMiddleware, user.decodeJwtToken);
    // app.get('/tokenTest', jwtMiddleware, user.verifyToken); // 토큰 검증이 하고 싶으면 이렇게 앞에 다가 달면 됨.. get에 app을 달면 인식을 못한다.
    // app.post('/signin', user.signIn); //
//app을 붙이는게 무슨 차이인거냐 왜안돼
    // app.get('app/testToken', user.verifyToken);

    // app.route('/app/jwtt').post(user.verifyToken); //토큰 검증 post
    // app.get('/app/verified', user.verifyToken);증 //토큰 검증 get

    // app.get('/user', user.getUser);            // 모듈 사용하지 않고 회원정보 받아오기
    app.get('/moduleuser', user.getModuleUser); // 모듈 사용하여 회원정보 받아오기
}
