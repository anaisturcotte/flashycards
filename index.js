// Imports
const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

// Connections
const port = 5100;

//-------------------Lien avec sql-------------------
const connection = mysql.createConnection({
	host     : '127.0.0.1',
	user     : 'nikola',
	password : '123456789',
	database : 'nodelogin'
});

const app = express();

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting to MySQL database: ' + err.stack);
        return;
    }
    console.log('Connected to MySQL database as ID ' + connection.threadId);
});

// accès au site sur host local:
// http://localhost:5100/index.html#

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

//---------------------lien avec html---------------------

app.get('/', function(request, response) {
	// Render login template
	response.sendFile(path.join(__dirname, 'public/index.html'));
});

//---------------------Login----------------------
app.post('/login', function(request, response) { 
    // Capture the input fields
    console.log(`request.body=${JSON.stringify(request.body)}`)
    let username = request.body.username;
    let password = request.body.password;
    // Ensure the input fields exist and are not empty
    if (username && password) {
        // Execute SQL query that'll select the account from the database based on the specified username and password
        connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) {
                console.error('Error executing SQL query: ' + error);
                response.send('An error occurred. Please try again later.');
            } else {
                // If the account exists
                if (results.length > 0) {
                    // Authenticate the user
                    request.session.loggedin = true;
                    request.session.username = username;
                    // Redirect to home page
                    response.redirect('/profil');
                } else {
                    response.send('Incorrect Username and/or Password!');
                }
            }
            response.end();
        });
    } else {
        response.send('Username or password missing.');
        response.end();
    }
});


//-------------------Sign Up-------------------

app.post('/signup', function(request, response) { 
    // Capture the input fields
    console.log(`request.body=${JSON.stringify(request.body)}`)
    let newUsername = request.body.newUsername;
	let newEmail = request.body.newEmail;
    let newPassword = request.body.newPassword;
    // Ensure the input fields exist and are not empty
    if (newUsername && newPassword) {
        // Execute SQL query that'll select the account from the database based on the specified newUsername and newPassword
        connection.query('INSERT INTO accounts (username, email, password) VALUES (?, ?, ?)', [newUsername, newEmail, newPassword], function(error, results, fields) {
            // If there is an issue with the query, output the error
            if (error) {
                console.error('Error executing SQL query: ' + error);
                response.send('An error occurred. Please try again later.');
            } else {
				// Authenticate the user
				request.session.loggedin = true;
				request.session.newUsername = newUsername;
				// Redirect to home page
				response.redirect('/newProfil');
			}
            response.end();
        });
    } else {
        response.send('Username or password missing.');
        response.end();
    }
});


//-------------------Profil redirect-------------------
app.get('/profil', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send('Welcome back, ' + request.session.username + '!');
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});

//-------------------newProfil redirect-------------------

app.get('/newProfil', function(request, response) {
	// If the user is loggedin
	if (request.session.loggedin) {
		// Output username
		response.send('Welcome to Flashy Cards, ' + request.session.newUsername + '!');
	} else {
		// Not logged in
		response.send('Please login to view this page!');
	}
	response.end();
});

//-------------------Initialiser le serveur-------------------
app.listen(port, () => console.info(`App listening on port ${port}`))