// Create a new router
const express = require("express")
const router = express.Router()
const bcrypt = require('bcrypt')
const saltRounds = 10

router.get('/register', function (req, res, next) {
    res.render('register.ejs')                                                               
})    

router.post('/registered', function (req, res, next) {
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
        ];

        db.query(sqlquery, values, function (error, results) {
            if (error) {
                console.error(error); // Log any errors from the database
                return res.status(500).send('Error saving user to database.'); // Error response
            }
      

            // res.send(' Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email)     
            
            result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email
            result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword
            res.send(result)
        }); 
    }); 
}); 

router.get('/listusers', function(req, res, next) {
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