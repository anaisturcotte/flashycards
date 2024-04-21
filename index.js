// Imports
const express = require('express');
const session = require('express-session');
const app = express();
const mysql = require('mysql');
const port = 5100;

// accès au site sur host local:
// http://localhost:5100/index.html#

app.use(express.static('public'));

//-------------------Initialiser le serveur-------------------
app.listen(port, () => console.info(`App listening on port ${port}`))

app.use(session({
	secret: 'poop',
	resave: true,
	saveUninitialized: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//---------------------Login----------------------
app.post('/auth', function(request, response) { 
	// Capture the input fields
	console.log(`request.body=${JSON.stringify(request.body)}`)
	let username = request.body.username;
	let password = request.body.password;
	// Ensure the input fields exists and are not empty
	if (username && password) {
		// Execute SQL query that'll select the account from the database based on the specified username and password
		connection.query('SELECT * FROM accounts WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			// If there is an issue with the query, output the error
			if (error) throw error;
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
			response.end();
		});
	} else {
		response.send('Please enter Username:' + username + 'Password:' + password);
		response.end();
	}
});

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