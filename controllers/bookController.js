const Book = require('../models/book');
const Author = require('../models/author')
const BookInstance = require('../models/bookInstance')
const Genre = require('../models/genre')
const {body, validationResult} = require('express-validator/check')
const {sanitizeBody} = require('express-validator/filter')

let async = require('async')

exports.index = function(req, res) {
    // res.send('NOT IMPLEMENTED: Site Home Page');
    async.parallel({
        book_count: (callback) => {
            Book.countDocuments({}, callback)
        },
        book_instance_count: (callback) => {
            BookInstance.countDocuments({}, callback)
        },
        book_instance_available_count: (callback) => {
            BookInstance.countDocuments({status:'Available'}, callback)
        },
        author_count: (callback) => {
            Author.countDocuments({}, callback)
        },
        genre_count: (callback) => {
            Genre.countDocuments({}, callback)
        }
    }, (err, results) => {
        res.render('index', {title: 'Local Library Home', error:err, data: results})
    })
};

// Display list of all books.
exports.book_list = function(req, res, next) {
    Book.find({}, 'title author')
        .populate('author')
        .exec((err, list_books) => {
            if (err) {
                return next(err)
            }
            res.render('book_list', {title: 'Book List', book_list: list_books})
        })
};

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {
    async.parallel({
        book: (callback) => {
            Book.findById(req.params.id)
                .populate('author')
                .populate('genre')
                .exec(callback)
        },
        bookInstances: (callback) => {
            BookInstance.find({book: req.params.id})
                .exec(callback)
        }
        
    }, (err, results) => {
        if (err) return next(err)
        res.render('book_details', {title:'Book details', book: results.book, bookInstances: results.bookInstances})
    })
};

// Display book create form on GET.
exports.book_create_get = function(req, res, next) {
    async.parallel({
        authors: (callback) => {
            Author.find(callback)
        },
        genres: (callback) => {
            Genre.find(callback)
        }
    },
        (err, results) => {
            if (err) return next(err)
            res.render('book_form', {title: 'Create book', authors: results.authors, genres: results.genres})
    })
};

// Handle book create on POST.
exports.book_create_post = [

    //convert genre to array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre === 'undefined') {
                req.body.genre = []
            }
            else {
                req.body.genre = [req.body.genre]
            }
        }
        next()
    },
    body('title', 'Title must not be empty').isLength({min: 1}).trim(),
    body('author', 'Author must not be empty').isLength({min: 1}).trim(),
    body('summary', 'Summary must not be empty').isLength({min: 1}).trim(),
    body('isbn', 'ISBN must not be empty').isLength({min: 1}).trim(),
    sanitizeBody('*').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(body)
        let book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: req.body.genre
        })
        console.log(book)
        if (!errors.isEmpty()){
            async.parallel({
                    authors: (callback) => {
                        Author.find(callback)
                    },
                    genres: (callback) => {
                        Genre.find(callback)
                    }
                },
                (err, results) => {
                    if (err) return next(err)
                    for (let genre of results.genres){
                        if (book.genre.indexOf(genre._id) > -1){
                            genre.checked = 'true'
                        }
                    }
                    res.render('book_form', {title: 'Create book', authors: results.authors, genres: results.genres, book: book, errors: errors.array()})
                })
            return
        }
        else {
            book.save((err) => {
                if (err) return next(err)
                res.redirect(book.url)
            })
        }

    }

]

// Display book delete form on GET.
exports.book_delete_get = function(req, res, next) {
    async.parallel({
        book: (callback) => {
            Book.findOne({_id: req.params.id})
                .populate('author')
                .populate('genre')
                .exec(callback)
        },
        bookInstances: (callback) => {
            BookInstance.find({book: req.params.id}).exec(callback)
        }
    }, (err, results) => {
        if (err) next(err)
        res.render('book_delete', {title: 'Delete book', book: results.book, bookInstances: results.bookInstances})
    })
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {
    async.parallel({
        book: (callback) => {
            Book.findOne({_id: req.body.bookid})
                .populate('author')
                .populate('genre')
                .exec(callback)
        },
        bookInstances: (callback) => {
            BookInstance.find({book: req.body.bookid}).exec(callback)
        }
    }, (err, results) => {
        if (err) return next(err)
        if (results.bookInstances.length > 0) {
            res.render('book_delete', {title:'Delete book', book: results.book, bookInstances: results.bookInstances})
            return
        }
        else {
            Book.findOneAndDelete({_id: req.body.bookid}, (err) => {
                if (err) return next(err)
                res.redirect('/catalog/books')
            })
        }
        
    })
};

// Display book update form on GET.
exports.book_update_get = function(req, res, next) {
    async.parallel({
        book: (callback) => {
            Book.findOne({_id: req.params.id})
                .populate('author')
                .populate('genre')
                .exec(callback)
        },
        authors:(callback) => {
            Author.find()
                .exec(callback)
        },
        genres: (callback) => {
            Genre.find()
                .exec(callback)
        }
    }, (err, results) => {
        if (err) return next(err)
        if (results.book == null) {
            const err = new Error('Book not found')
            err.status = 404
            return next(err)
        }
        for (book_genre of results.book.genre) {
            for (genre of results.genres){
                if (book_genre._id.toString() == genre._id.toString()) {
                    genre.checked = true
                }
            }
        }
        res.render('book_form', {title: 'Update book', book: results.book, authors: results.authors, genres: results.genres})
    })
};

// Handle book update on POST.
exports.book_update_post = [
    (req, res, next) => {
        if (!(req.body.genre instanceof Array)) {
            if (typeof req.body.genre === 'undefined') {
                req.body.genre = []
            }
            else {
                req.body.genre = new Array(req.body.genre)
            }
        }
        next()
    },
    body('title', 'Title must not be empty').isLength({min: 1}).trim(),
    body('author', 'Author must not be empty').isLength({min: 1}).trim(),
    body('summary', 'Summary must not be empty').isLength({min: 1}).trim(),
    body('isbn', 'ISBN must not be empty').isLength({min: 1}).trim(),
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('isbn').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req)
        const book = new Book({
            title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined'? [] : req.body.genre),
            _id: req.params.id // this is required or new book create, not update.
        })
        if (!errors.isEmpty()) {
            async.parallel({
                authors: (callback) => {
                    Author.find().exec(callback)
                },
                genres: (callback) => {
                    Genre.find().exec(callback)
                }
            }, (err, results) => {
                console.log(book.genre)
                if (err) next(err)
                for (genre of results.genres) {
                    if (book.genre.indexOf(genre._id) > -1) {
                        genre.checked = 'true'
                    }
                }
                res.render('book_form', {title: 'Update book', authors: results.authors, genres: results.genres, book: book, errors: errors.array(), page: 'update'})
                return
            })
        }
        else {
            Book.findOneAndUpdate({_id: req.params.id}, book, {}, (err, theBook) => {
                if (err) return next(err)
                res.redirect(theBook.url)
            })
        }
        
    }
    
]
