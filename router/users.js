const express = require('express');
const router = express.Router();
const userController = require('../controller/user');

router.get('/skrininguser', userController.index);
router.post('/skrininguser', userController.store);
module.exports = router;