const express = require('express');
const router = express.Router();

// Bring in Article Model
let Article = require('../models/article.js')
// Bring in User Model
let User = require('../models/user');

// BUILD ROUTES

// add route
router.get('/add', ensureAuthenticated, function(req, res){
    res.render('add_article', {
        title: 'Add Article'
    })
})


// SHOW Edit article VIEW
router.get('/edit/:id', ensureAuthenticated, function(req, res){
    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            req.flash('danger', 'User not authorized');
            res.redirect('/');
        }
        if(err){
            console.log(err);
        } else {
            res.render('edit_article', {
                title: 'Edit Article: ' + article.title,
                article: article
            });
        }
    })
});

// Add Submit route POST
router.post('/add', function(req,res){
    req.checkBody('title', 'Title is required').notEmpty();
    // req.checkBody('author', 'Author is required').notEmpty();
    req.checkBody('body', 'Body text is required').notEmpty();

    //Get Errors
    let errors = req.validationErrors();

    if(errors){
        res.render('add_article', {
            title: 'Add Article',
            errors: errors
        })
    } else {

        let article = new Article();
        article.title = req.body.title;
        article.author = req.user._id;
        article.body = req.body.body;
        
        article.save(function(err){
            if(err){
                console.log(err);
                return;
            } else {
                req.flash('success', 'Article added!')
                res.redirect('/');
            }
        })
    }
})

// Edit article route
router.post('/:id', function(req,res){
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}

    Article.update(query, article, function(err){
        if(err){
            console.log(err);
            return;
        } else {
            req.flash('success', 'Article Updated!');
            res.redirect('/');
        }
    });
});

// Delete Article Route (using AJAX with jQuery)
router.delete('/:id', function(req, res){
    if(!req.user._id){
        res.status(500).send();
    }

    let query = {_id: req.params.id};

    Article.findById(req.params.id, function(err, article){
        if(article.author != req.user._id){
            res.status(500).send();
        } else {
            Article.remove(query, function(err){
                if(err){
                    console.log(err);
                }
                res.send('Success');
            })
        }
    })
})

// get single article
router.get('/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
        User.findById(article.author, function(err, user){
            if(err){
                console.log(err);
            } else {
                res.render('article', {
                    article: article,
                    author: user.name
                }); 
            }
        })
    })
});

// Access Control
function ensureAuthenticated(req, res, next){
    if(req.isAuthenticated()){
        return next();
    } else {
        req.flash('danger', 'User must be logged in');
        res.redirect('/users/login');
    }
}

module.exports = router;
