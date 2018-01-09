const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const router = express.Router();

let User = require('../models/user.js');

// Register form
router.get('/register', function(req, res){
    res.render('register');
});

// Register Process
router.post('/register', function(req, res){
    const name = req.body.name;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const password2 = req.body.password2;

    req.checkBody('name', 'Please enter your name below').notEmpty();
    req.checkBody('email', 'Please provide your email').notEmpty();
    req.checkBody('email', 'Email provided must be a valid email').isEmail();
    req.checkBody('username', 'Please provide a username for your account').notEmpty();
    req.checkBody('password', 'Please enter a password for your account').notEmpty();
    req.checkBody('password2', 'Passwords must match! Please make sure they are the same').equals(req.body.password);

    let errors = req.validationErrors();

    if (errors){
        res.render('register', {
            errors: errors
        });
    } else {
        let newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password
        });

        bcrypt.genSalt(10, function(err, salt){
            console.log(salt);
            bcrypt.hash(newUser.password, salt, function(err, hash){
                if(err){
                    console.log(err)
                } 
                newUser.password = hash;
                newUser.save(function(err){
                    if(err){
                        console.log(err);
                        return;
                    } else {
                        req.flash('success', 'You are now registered and can log in.');
                        res.redirect('/users/login');
                    }
                });
            });
        });
    }   
});

// Get login form
router.get('/login', function(req, res){
    res.render('login');
});

// Login process
router.post('/login', function(req, res, next){
    passport.authenticate('local', {
        successRedirect: '/',
        failureRedirect: '/users/login', 
        failureFlash: true
    })(req, res, next);

})

// Logout
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'You are logged out');
    res.redirect('/users/login');
});

module.exports = router;