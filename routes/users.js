// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10

const { check, validationResult } = require('express-validator');

const redirectLogin = (req, res, next) => {
    if (!req.session.userId ) {
      res.redirect('/users/login') // redirect to the login page
    } else { 
        next (); // move to the next middleware function
    } 
}

router.get('/logout', redirectLogin, (req,res) => {
    req.session.destroy(err => {
    if (err) {
      return res.redirect('/home')
    }
    res.send('you are now logged out. <a href='+'/home'+'>Home</a>');
    })
})

router.get('/register', function (req, res, next) {
    res.render('register.ejs')                                                               
})    

router.get('/login', function (req, res, next) {

    req.body.username = req.sanitize(req.body.username);

    res.render('login.ejs')
})

router.post('/registered', [
    check('email').isEmail(), 
    check('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
], function (req, res, next) {
    req.body.first = req.sanitize(req.body.first);
    req.body.last = req.sanitize(req.body.last);
    req.body.username = req.sanitize(req.body.username);
    req.body.email = req.sanitize(req.body.email); 

    const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.redirect('./register', { errors: errors.array() }); }
else {
    // saving data in database
    const plainPassword = req.body.password

    bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
        // Store hashed password in your database.
        if (err) {
            console.error(err); // Log the error for debugging
            return res.status(500).send('Error registering user. Please try again later.'); // Error response
        }

        // SQL query to insert user data into the users table
        let sqlquery = `INSERT INTO users (username, first_name, last_name, email, hashed_password) 
            VALUES (?, ?, ?, ?, ?)`;

        // Values to be inserted
        const values = [
            req.body.username,   
            req.body.first,    
            req.body.last,       
            req.body.email,      
            hashedPassword       
        ]

        db.query(sqlquery, values, function (error, results) {
            if (error) {
                console.error(error); // Log any errors from the database
                return res.status(500).send('Error saving user to database.'); // Error response
            }
      

            // res.send(' Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email)     
            
            result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email
            result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword
            res.send(result)
        })
    })
}
}) 

router.post('/loggedin', function (req, res, next) {
    const username = req.body.username; // Get the username from the request
    const plainPassword = req.body.password; // Get the password from the request
    
    // Save user session here, when login is successful
    req.session.userId = req.body.username;


    // SQL query to find the user by username
    let sqlquery = `SELECT * FROM users WHERE username = ?`;
    
    db.query(sqlquery, [username], function (error, results) {
        if (error) {
            console.error(error); // Log any database errors
            return res.status(500).send('Error querying the database.'); // Error response
        }

        // Check if user exists
        if (results.length === 0) {
            return res.status(401).send('Login failed: User does not exist.'); // User not found
        }

        // Get the hashed password from the database
        const hashedPassword = results[0].hashed_password;
        
    bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
        if (err) {
          // TODO: Handle error
          console.error(err); // Log the error for debugging
          return res.status(500).send('Error logging in user. Please try again.'); // Error response
        }
        else if (result == true) {
          // TODO: Send message

          // Save user session here, when login is successful
          req.session.userId = req.body.username;
          
        //   return res.send('Login successful! Welcome, ' + username + '!');

        req.flash('success', 'Login successful! Welcome, ' + username + '!')

        return res.redirect('/home');



        }
        else {
          // TODO: Send message
          return res.status(401).send('Login failed: Incorrect password.');
        }
      }) 
    })     
})

router.get('/listusers', redirectLogin, function(req, res, next) {
    let sqlquery = "SELECT * FROM users" // query database to get all the users
    // execute sql query
    db.query(sqlquery, (err, result) => {
        if (err) {
            next(err)
        }
        res.render("listusers.ejs", {availableUsers:result})
     })
})


// Export the router object so index.js can access it
module.exports = router;