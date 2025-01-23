const express = require('express');
const router = express.Router();
const { githubLogin, githubCallback } = require('../controllers/githubAuth');

// GitHub OAuth routes
router.get('/auth/github', githubLogin);
router.get('/auth/github/callback', githubCallback);

module.exports = router;
