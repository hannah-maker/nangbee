module.exports = function(app){
    const item = require('../controllers/itemController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    
    app.post('/item' , jwtMiddleware, item.addItem); // 아이템 추가 API
    app.get('/item' , jwtMiddleware, item.getItems); // 아이템 조회 API
    app.delete('/item' , jwtMiddleware, item.deleteItem); // 아이템 삭제 API
    app.patch('/item' , jwtMiddleware, item.updateItem); // 아이템 수정 API
}
