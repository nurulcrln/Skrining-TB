const express = require('express');
const router = express.Router();

// routing halaman beranda
router.get('/', (req, res) => {
    res.render('pages/beranda');
  });

module.exports = router;