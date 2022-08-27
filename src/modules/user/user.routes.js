const { Router } = require('express');

const authMiddleware = require('../../middleware/auth');

const { create, login, activeUser, logout } = require('./user.controllers');

const router = Router();

router.get('/', authMiddleware, activeUser);

router.post('/create', authMiddleware, create);

router.post('/login', login);

router.post('/logout', authMiddleware, logout);

module.exports = router;
