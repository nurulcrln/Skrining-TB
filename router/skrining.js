const express = require('express');
const router = express.Router();
const skriningController = require('../controller/skrining');
const connection = require('../database.js');
const session = require('express-session');
// routing halaman info skrining
router.get('/skrining', (req, res) => {
    res.render('pages/skrining/info');
});
router.get('/skriningform', skriningController.index);
router.post('/skriningform', skriningController.store);
router.get('/skrininghasil', skriningController.showHasil);

router.get('/unduhhasil', (req, res, next) => {
    const nama = req.session.userName;
    const tanggal_lahir = req.session.ttl;

    connection.query('SELECT * FROM user WHERE nama = ? AND tanggal_lahir = ?', [nama,tanggal_lahir], function (err, result) {
        if(err) {
            throw err;
        } else {
            getUser(result);
        }
    });
    const stream = res.writeHead(200,{
        'Content-Type' : 'application/pdf',
        'Content-Disposition' : 'attachment;filename=hasil_skrining.pdf'
    })
    function getUser(result){
        id = result[0].id_user;
        req.session.userId = id;
        
        skriningController.download(
            (chunk) => stream.write(chunk),
            () => stream.end(),
            req.session.userId
        );
    }
});


module.exports = router;