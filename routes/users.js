const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController')
const userHelper = require('../middleware/user_helper')

/* GET users listing. */
// router.get('/login', userController.user_login_get)
//
// router.post('/login', userController.user_logout_post)
//
// router.get('/logout', userController.user_logout_get)
//
// router.post('/logout', userController.user_logout_post)

router.get('/profile',userHelper.requiresLogin, userController.user_profile_get)
router.post('/profile', userController.user_profile_post)

module.exports = router;
