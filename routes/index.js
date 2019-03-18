var express = require('express');
var router = express.Router();
const authenticatorController = require('../controllers/authenticatorController')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index_entry')
});

router.get('/login', authenticatorController.login_get)
router.post('/login', authenticatorController.login_post)
router.get('/register', authenticatorController.register_get)
router.post('/register', authenticatorController.register_post)
router.get('/logout', authenticatorController.logout_get)
router.post('/logout', authenticatorController.logout_get)


module.exports = router;
