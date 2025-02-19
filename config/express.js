const express = require('express');
const compression = require('compression');
const methodOverride = require('method-override');
const cors = require('cors');
module.exports = function () {
    const app = express();

    app.use(compression());

    app.use(express.json());

    app.use(express.urlencoded({extended: true}));

    app.use(methodOverride());

    app.use(cors());

    app.use(express.static('public')); // image 파일을 읽기 위한 경로 추가.
    // app.use(express.static(process.cwd() + '/public'));

    /* App (Android, iOS) */
    require('../src/app/routes/indexRoute')(app);
    require('../src/app/routes/userRoute')(app);
    require('../src/app/routes/testRoute')(app);
    require('../src/app/routes/itemRoute')(app);


    /* Web */
    // require('../src/web/routes/indexRoute')(app);

    /* Web Admin*/
    // require('../src/web-admin/routes/indexRoute')(app);
    return app;
};