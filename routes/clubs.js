const express = require('express');
const router = express.Router();
const { registrarClub } = require('../controllers/clubController');

router.post('/register', registrarClub);

module.exports = router;
