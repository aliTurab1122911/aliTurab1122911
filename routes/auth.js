const express = require('express');
const controller = require('../controllers/authController');

const router = express.Router();

router.get('/login', controller.showLogin);
router.get('/register', controller.showRegister);
router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/logout', controller.logout);

module.exports = router;
