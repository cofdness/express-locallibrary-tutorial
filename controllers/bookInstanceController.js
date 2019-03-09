const BookInstance = require('../models/bookInstance');
const Book = require('../models/book')
const {body, validationResult} = require('express-validator/check')
const {sanitizeBody} = require('express-validator/filter')
const async = require('async')

// Display list of all BookInstances.
exports.bookinstance_list = function(req, res, next) {
    BookInstance.find()
        .populate('book')
        .exec((err, list_instances) => {
            if (err) return next(err)
            res.render('bookinstance_list', {title: 'Book Instance List', bookinstance_list: list_instances})
        })
};

// Display detail page for a specific BookInstance.
 exports.bookinstance_detail = function(req, res, next) {

     BookInstance.findById(req.params.id)
         .populate('book')
         .exec(function (err, bookinstance) {
             if (err) { return next(err); }
             if (bookinstance==null) { // No results.
                 var err = new Error('Book copy not found');
                 err.status = 404;
                 return next(err);
             }
             // Successful, so render.
             res.render('bookinstance_detail', { title: 'Book:', bookinstance:  bookinstance});
         })

 };

// Display BookInstance create form on GET.
exports.bookinstance_create_get = function(req, res, next) {
    Book.find({}, 'title')
        .exec((err, books) =>{
            if (err) return next(err)
            res.render('bookinstance_form', {title: 'Create Book instance', book_list: books})
        })
}


// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
    body('book','Book must be specified').isLength({min: 1}).trim(),
    body('imprint', 'Imprint must be specified').isLength({min: 1}).trim(),
    body('status', 'Status must be specified').isLength({min: 1}).trim(),
    body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601(),
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        })
        if (!errors.isEmpty()) {
            Book.find({}, 'title')
                .exec((err, books) =>{
                    if (err) return next(err)
                    res.render('bookinstance_form', {title: 'Create Book instance', book_list: books, bookinstance: bookInstance, selected_book: bookInstance.book._id, errors: errors.array()})
                })
            return
        }
        else {
            bookInstance.save((err) => {
                if (err) return next(err)
                res.redirect(bookInstance.url)
            })
        }
    }
]

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = function(req, res, next) {
    BookInstance.findOne({_id: req.params.id})
        .populate('book')
        .exec((err, bookInstance) => {
            if (err) return next(err)
            res.render('bookinstance_delete', {title: 'Delete book copy', bookInstance: bookInstance})
        })
};

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = function(req, res, next) {
    BookInstance.findOneAndDelete({_id: req.body.bookinstanceid}).exec((err) => {
        if (err) return next(err)
        res.redirect('/catalog/bookinstances')
    })
};

// Display BookInstance update form on GET.
exports.bookinstance_update_get = function(req, res, next) {
    async.parallel({
        bookInstance: (callback) => {
            BookInstance.findOne({_id: req.params.id})
                .populate('book')
                .exec(callback)
        },
        books: (callback) => {
            Book.find().exec(callback)
        }
    }, (err, results) => {
        if (err) return next(err)
        if (results.bookInstance == null) {
            const err = new Error('Book copy not found')
            err.status = 404
            return next(err)
        }
        res.render('bookinstance_form',{title: 'Update book copy', bookinstance: results.bookInstance, book_list: results.books, selected_book: results.bookInstance.book._id })
    })
    
};

// Handle bookinstance update on POST.
exports.bookinstance_update_post = [
    body('book','Book must be specified').isLength({min: 1}).trim(),
    body('imprint', 'Imprint must be specified').isLength({min: 1}).trim(),
    body('status', 'Status must be specified').isLength({min: 1}).trim(),
    body('due_back', 'Invalid date').optional({checkFalsy: true}).isISO8601(),
    sanitizeBody('book').trim().escape(),
    sanitizeBody('imprint').trim().escape(),
    sanitizeBody('status').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        const bookInstance = new BookInstance({
            book: req.body.book,
            imprint: req.body.imprint,
            status: req.body.status,
            due_back: req.body.due_back
        }) //wrong implement, look genre controller
        if (!errors.isEmpty()) {
            Book.find({}, 'title')
                .exec((err, books) =>{
                    if (err) return next(err)
                    res.render('bookinstance_form', {title: 'Create Book instance', book_list: books, bookinstance: bookInstance, selected_book: bookInstance.book._id, errors: errors.array()})
                })
            return
        }
        else {
            BookInstance.findOneAndUpdate({_id: req.params.id}, {$set:req.body}, {} , (err) => {
                if(err) return next(err)
                res.redirect('/catalog/bookinstances')
            })
        }
    }
]
