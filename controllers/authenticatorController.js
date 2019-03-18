const User = require('../models/user')
const {body, validationResult} = require('express-validator/check')
const {sanitizeBody} = require('express-validator/filter')

exports.login_get = (req, res, next) => {
    res.send('will implement')
}
exports.login_post = (req, res, next) => {
    res.send('will implement')
}
exports.register_get = (req, res, next) => {
    res.render('register_form', {title:'Register'})
}
exports.register_post = [
    (req, res, next) => {
        if  (req.body.password !== req.body.confirmpassword) {
            const err = new Error('Confirm password not match')
            return res.render('register_form', {user: req.body, errors: [error]})
        }
        next()
    },
    body('name').isLength({min: 1}).trim().escape(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({min: 5}).trim().escape(),
    (req, res, next) => {
        console.log('abc')
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.render('register_form', {user: req.body, errors: errors.array()})
        }
        else {
            const userData = {
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            }
            console.log(req.body.name)
            console.log(req.body.password)
            User.create(userData, (err, user) => {
                if (err) return next(err)
                else {
                    req.session.userId = user._id
                    return res.redirect('/user/profile')
                }
            })
        }
    }
]
exports.logout_get = (req, res, next) => {
    res.send('will implement')
}
exports.logout_post = (req, res, next) => {
    res.send('will implement')
}
