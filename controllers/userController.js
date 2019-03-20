const User = require('../models/user')
const BookInstance = require('../models/bookInstance')
const {body, validationResult} = require('express-validator/check')
const {sanitizeBody} = require('express-validator/check')
const async = require('async')

exports.user_login_get = (req, res, next) => {
    res.render('user_login', {title: 'Login:'})
}

exports.user_login_post = (req, res, next) => {
    res.send('not implement')
}

exports.user_logout_get = (req, res, next) => {
    res.render('user_logout', {title: 'Logout'})
}

exports.user_logout_post = (req, res, next) => {
    res.send('not implement')
}

exports.user_profile_get = (req, res, next) => {
    let userId = req.session.userId
    if (!userId) {
        const err = new Error('You must login to view this page')
        err.status = 401
        return res.render('login_form', {errors: [err]})
    }
    else {
        async.parallel({
            bookInstances: (callback) => {
                BookInstance.find({_id: userId})
                    .exec(callback)
            },
            user: (callback) => {
                User.findOne({_id: req.session.userId})
                    .exec(callback)
            }
        }, (err, results) => {
            if (err) {
                return next(err) 
            }
            else {
                const userData = {
                    _id: results.user._id,
                    email: results.user.email,
                    name: results.user.name
                }
                return res.render('user_profile', {user: userData, bookInstances: results.bookInstances})
            }
        })
        // User.findOne({_id: req.session.userId})
        //     .exec((err, user) => {
        //         if (err) return next(err)
        //         const userData = {
        //             _id: user._id,
        //             email: user.email,
        //             name: user.name
        //         }
        //         return res.render('user_profile', {user: userData})
        //     })

    }
}
exports.user_profile_post = (req, res, next) => {
    res.send('will implement')
}

