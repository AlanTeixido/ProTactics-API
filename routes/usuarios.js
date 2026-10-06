const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const asyncHandler = require('../utils/asyncHandler');
const { validateIdParam } = require('../utils/validation');
const { getResumen } = require('../controllers/usuarioController');

const router = express.Router();
router.param('id', validateIdParam);

// Activity summary of a user (own summary, or a club looking at one of its coaches)
router.get('/:id/resumen', authMiddleware, asyncHandler(getResumen));

module.exports = router;
