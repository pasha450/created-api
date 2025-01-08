const express = require('express');
const db = require('../config/mongoose');
const router = express.Router();


router.use('/api', require('./auth')); 
router.use('/api/user', require('./user'));

module.exports = router;
