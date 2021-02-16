const express = require('express');
const viewController = require('./../controllers/viewController');
const authController = require('./../controllers/authController');

const router = express.Router();
router.get('/me', authController.protect, viewController.getuser);
router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/login', authController.isLoggedIn, viewController.getLogin);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

module.exports = router;
