
const Author = require('../models/author')
const async = require('async')
const Book = require('../models/book')
const {body, validationResult} = require('express-validator/check')
const {sanitizeBody} = require('express-validator/filter')

// Display list of all Authors.
exports.author_list =function (req, res, next) {
    Author.find()
        .sort([['family_name', 'ascending']])
        .exec((err, list_authors) => {
            if (err) return next(err)
            res.render('author_list', {title: 'Author list', author_list: list_authors})
        })
}

// Display detail page for a specific Author.
exports.author_detail = (req, res, next) => {
    async.parallel({
        author_books: (callback) => {
            Book.find({'author': req.params.id}, 'title summary')
                .exec(callback)
        },
        author: (callback) => {
            Author.findById(req.params.id)
                .exec(callback)
        }
    }, (err, results) => {
        if (err) return next(err)
        if (results.author == null) { 
            let err = new Error('Author not found')
            err.status = 404
            return next(err)
        }
        res.render('author_detail',{title:'Author detail', author_books: results.author_books, author: results.author})
    })
}

// Display Author create form on GET
exports.author_create_get = (req, res) => {
    res.render('author_form', {title:'Create author'})
}

// Handle Author create on POST
exports.author_create_post = [
    body('first_name').isLength({min: 1}).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric character.'),
    body('family_name').isLength({min: 1}).trim().withMessage('Family name must be specified')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric character.'),
    body('date_of_birth').optional({checkFalsy: true}).isISO8601(),
    body('date_of_death').optional({checkFalsy: true}).isISO8601(),
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render('author_form', {title: 'Create author', author: req.body, errors: errors.array()})
            return
        }
        else {
            const author = new Author({
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            })
            
            author.save((err) => {
                if (err) return next(err)
                res.redirect(author.url)
            })
        }
    }
]

// Display Author delete form on GET
exports.author_delete_get = (req, res, next) => {
    async.parallel({
        author: (callback) => {
            Author.findById(req.params.id)
                .exec(callback)
        },
        author_books:(callback) => {
            Book.find({'author': req.params.id})
                .exec(callback)
        }
    }, (err, results) => {
        if (err) return next(err)
        if (results.author == null){
            res.redirect('/catalog/authors')
        }
        res.render('author_delete', {title:'Delete author', author: results.author, author_books:results.author_books})
    })
}

// Handle Author delete on POST
exports.author_delete_post = (req, res, next) => {
    async.parallel({
        author: (callback) =>{
            Author.findById(req.body.authorid).exec(callback)
        },
        author_books: (callback) => {
            Book.find({'author': req.body.authorid}).exec(callback)
        }
    }, (err, results) => {
        if (err) return next(err)
        if (results.author_books.length > 0) {
            res.render('author_delete', {title:'Delete author', author: results.author, author_books: results.author_books})
            return
        }
        else {
            Author.findOneAndDelete({_id:req.body.authorid}, (err) => {
                if (err) return next(err)
                res.redirect('/catalog/authors')
            })
        }
    })
}

// Display Author update form on GET
exports.author_update_get = (req, res, next) => {
    Author.findOne({_id: req.params.id}).exec((err, author) => {
        if (err) return next(err)
        res.render('author_form', {title: 'Update author', author: author})
    })
}

// Handle Author update on POST
exports.author_update_post = [
    body('first_name').isLength({min: 1}).trim().withMessage('First name must be specified.')
        .isAlphanumeric().withMessage('First name has non-alphanumeric character.'),
    body('family_name').isLength({min: 1}).trim().withMessage('Family name must be specified')
        .isAlphanumeric().withMessage('Family name has non-alphanumeric character.'),
    body('date_of_birth').optional({checkFalsy: true}).isISO8601(),
    body('date_of_death').optional({checkFalsy: true}).isISO8601(),
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render('author_form', {title: 'Update author', author: req.body, errors: errors.array()})
            return
        }
        else {
            Author.findOneAndUpdate({_id: req.params.id}, {$set:req.body}, {}, (err, author) => {
                if (err) return next(err)
                res.redirect('/catalog/authors')
            })
        }
    }
]




