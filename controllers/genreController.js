const Genre = require('../models/genre');
const Book = require('../models/book')
const async = require('async')
const {body, validationResult} = require('express-validator/check')
const {sanitizeBody} = require('express-validator/filter')
// Display list of all Genre.
exports.genre_list = function(req, res, next) {
    Genre.find()
        .sort([['name', 'ascending']])
        .exec((err, genres) =>{
            if (err) return next(err)
            res.render('genre_list', {title: 'Genre list', genre_list: genres})
        })
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: (callback) => {
            Genre.findById(req.params.id)
                .exec(callback)
        },
        genre_books: (callback) =>{
            Book.find({'genre': req.params.id})
                .exec(callback)
        }
    }, (err, results) => {
        if (err) return next(err)
        if (results.genre == null) {
            let error = new Error('Genre not found')
            error.status = 404
            return next(error)
        }
        res.render('genre_detail', {title: 'Genre', genre: results.genre, genre_books: results.genre_books})
    })
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res, next) {
    res.render('genre_form', {title:'Create Genre'})
};

// Handle Genre create on POST.
exports.genre_create_post = [
    body('name', 'Genre name must be specified.').isLength({min: 1}).trim(),
    sanitizeBody('name').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        const genre = new Genre({name : req.body.name})
        if (!errors.isEmpty()) {
            res.render('genre_form', {title: 'Create genre', genre: genre, errors: errors.array()})
            return
        }
        else {
            Genre.findOne({'name': req.body.name})
                .exec((err, found_genre) => {
                    if (err) return next(err)
                    if (found_genre) {
                        res.redirect(found_genre.url)
                    }
                    else {
                        genre.save((err) => {
                            if (err) return next(err)
                            res.redirect(genre.url)
                        })
                    }
                })
        }
    }
]

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {
    async.parallel({
        genre: (callback) => {
            Genre.findById(req.params.id)
                .exec(callback)
        },
        genre_books: (callback) =>{
            Book.find({'genre': req.params.id})
                .exec(callback)
        }
    }, (err, results) => {
        if (err) return next(err)
        if (results.genre == null) {
            let error = new Error('Genre not found')
            error.status = 404
            return next(error)
        }
        res.render('genre_delete', {title: 'Genre', genre: results.genre, genre_books: results.genre_books})
    })
        
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next) {
    async.parallel({
        genre: (callback) => {
            Genre.findById(req.body.genreid)
                .exec(callback)
        },
        genre_books: (callback) =>{
            Book.find({'genre': req.body.genreid})
                .exec(callback)
        }
    }, (err, results) => {
        if (err) return next(err)
        if (results.genre == null) {
            let error = new Error('Genre not found')
            error.status = 404
            return next(error)
        }
        if (results.genre_books.length > 0){
            res.render('genre_delete', {title: 'Genre', genre: results.genre, genre_books: results.genre_books})
            return
        }
        else {
            Genre.findOneAndDelete({_id: req.body.genreid}).exec((err) => {
                if (err) return next(err)
                res.redirect('/catalog/genres')
            })
        }
        
    })
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res, next) {
    Genre.findOne({_id: req.params.id})
        .exec((err, genre) => {
            if (err) return next(err)
            res.render('genre_form', {title: 'Update genre', genre: genre})
        })
};

// Handle Genre update on POST.
exports.genre_update_post = [
    body('name', 'Genre name must be specified.').isLength({min: 1}).trim(),
    sanitizeBody('name').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        
        if (!errors.isEmpty()) {
            Genre.findOne({_id: req.params.id}).exec((err) => {
                if (err) return next(err)
                else {
                    res.render('genre_form', {title: 'Create genre', genre: genre, errors: errors.array()})
                    return
                }
            })
        }
        else {
            Genre.findOneAndUpdate({_id: req.params.id}, {$set: req.body}, {}, (err) => {
                if (err) return next(err)
                res.redirect('/catalog/genres')
            })
        }
    }
]
