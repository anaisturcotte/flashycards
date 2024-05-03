// Imports
const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');

const mustacheExpress = require('mustache-express');

// Connections
const port = 5100;

// userInfo
let user = '';

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
// http://localhost:5100/index.html

// Set Mustache as the view engine
app.engine("mustache", mustacheExpress());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));

// Middleware to parse JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// css and images
app.use(express.static(__dirname + '/public'));

//---------------------lien avec html---------------------

app.get("/index", (req, res) => {
    res.render("index");
});

app.get("/home", (req, res) => {
    res.render("home", { user });
});

app.get("/a_propos", (req, res) => {
    res.render("a_propos");
});

app.get("/ex_cards", (req, res) => {
    res.render("ex_cards");
});

app.get("/explore", (req, res) => {
    res.render("explore");
});

app.get("/profile", (req, res) => {
    res.render("profile", { user });
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
                    user = request.session.username;
                    // Redirect to home page
                    console.log(`redirecting... user=${user}`);
                    response.redirect(`/home?user=${user}`);
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
                request.session.username = newUsername;
                user = request.session.username;
                // Redirect to home page
                console.log(`redirecting... user=${user}`);
                response.redirect(`/home?user=${user}`);
            }
            response.end();
        });
    } else {
        response.send('Username or password missing.');
        response.end();
    }
});

// app.post('/profil', function(req, res) {
//     console.log(`redirecting... user=${user}`);
//     response.redirect(`/profile?user=${user}`);
// });

    
// ----------------------------------------------------------------------------------------------------------- //
// ------------------------------------------- Openning a card set ------------------------------------------- //
// ----------------------------------------------------------------------------------------------------------- //

const _ = require('lodash');

let card_set = {
    ids:[],
    terms: [],
    definitions: [],
    hints: [],
    knownLevel: [],
    randNumList: []
}

// example of results :
// [
    //     { id: 1, name: 'Card 1', description: 'Description of Card 1', idEnsemble: 1 },
    //     { id: 2, name: 'Card 2', description: 'Description of Card 2', idEnsemble: 1 },
    //     { id: 3, name: 'Card 3', description: 'Description of Card 3', idEnsemble: 2 }
    // ]
        
function open(cardSet) {
    console.log(`open(cardSet) entered !!!`);
    connection.query("select * from cartes where ensemble.nomEnsemble=? and ensemble.id=cartes.idEnsemble", [cardSet], function(error, results, fields) {
        if (error) {
            console.error('Error executing SQL query: ' + error);
        } else {
            var randomNumber = 0;
            for (let i = 0; i <= results.length; i++) {
                card_set.ids.push(results[i]['id']);
                card_set.terms.push(results[i]['motTerme']);
                card_set.definitions.push(results[i]['motDefinition']);
                card_set.hints.push(results[i]['aide']);
                card_set.knownLevel.push(results[i]['nivConnu']);
                card_set.randNumList.push(randomNumber = _.random(1, 10));
            }
            console.log(`card_set: ${card_set}`);
        }
    });
}
        
// ------------------------------------------------------------------------------------------------------------- //
// ----------------------------------------------- with MUSTACHE ----------------------------------------------- //
// ------------------------------------------------------------------------------------------------------------- //


//-------------------Initialiser le serveur-------------------
app.listen(port, () => console.info(`App listening on port ${port}`))