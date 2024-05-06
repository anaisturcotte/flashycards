// Imports
const mysql = require('mysql');
const express = require('express');
const session = require('express-session');
const path = require('path');
const mustacheExpress = require('mustache-express');
const app = express();

// Connections
const port = 5100;

// userInfo
let user = '';
let userID = '';

//-------------------Lien avec sql-------------------
const connection = mysql.createConnection({
	host     : '127.0.0.1',
	user     : 'nikola',
	password : '123456789',
	database : 'nodelogin'
});


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

app.get("/profile", (req, res) => {
    res.render("profile", { user });
});

app.get("/creerDossier", (req, res) => {
    res.render("creerDossier");
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
                    userID = results[0]['id'];
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
                connection.query('SELECT * FROM accounts WHERE username=? and email=? and password=?', [newUsername, newEmail, newPassword], function(error, results, fields) {
                    // If there is an issue with the query, output the error
                    if (error) {
                        console.error('Error executing SQL query: ' + error);
                        response.send('An error occurred. Please try again later.');
                    } else {
                        userID = results[0]['id'];
                    }
                    response.end();
                });
                // Redirect to home page
                console.log(`redirecting... user=${user}`);
                response.redirect(`home?user=${user}`);
            }
            response.end();
        });
    } else {
        response.send('Username or password missing.');
        response.end();
    }
});



// Route to render the form
app.get('/explore', async (req, res) => {
    try {
        const liste_dossiers = await new Promise((resolve, reject) => {
            connection.query('SELECT dossiers.nomDossier FROM dossiers, accounts WHERE dossiers.idCreateur = accounts.id AND accounts.id = ?;', [userID], (error, results, fields) => {
                if (error) {
                    console.error('Error executing SQL query:', error);
                    reject(error);
                } else {
                    const dossiersList = results.map(result => result.nomDossier);
                    resolve(dossiersList);
                }
            });
        });
        const liste_ensembles = await new Promise((resolve, reject) => {
            connection.query('SELECT ensembles.nomEnsemble FROM ensembles, dossiers, accounts where ensembles.idDossier = dossiers.id and dossiers.idCreateur=accounts.id and accounts.id=?;', [userID], (error, results, fields) => {
                if (error) {
                    console.error('Error executing SQL query:', error);
                    reject(error);
                } else {
                    const ensemblesList = results.map(result => result.nomEnsemble);
                    resolve(ensemblesList);
                }
            });
        });
        console.log('1. liste_dossiers:', liste_dossiers);
        console.log('1. liste_ensembles:', liste_ensembles);
        res.render('explore', { dossiers: liste_dossiers, ensembles: liste_ensembles});
    } catch (error) {
        console.error('Error fetching data:', error);
        res.send('An error occurred. Please try again later.');
    }
});


app.get('/creer', async (req, res) => {
    try {
        const liste_dossiers = await new Promise((resolve, reject) => {
            connection.query('SELECT dossiers.nomDossier FROM dossiers, accounts WHERE dossiers.idCreateur = accounts.id AND accounts.id = ?;', [userID], (error, results, fields) => {
                if (error) {
                    console.error('Error executing SQL query:', error);
                    reject(error);
                } else {
                    const dossiersList = results.map(result => result.nomDossier);
                    resolve(dossiersList);
                }
            });
        });
        const liste_ensembles = await new Promise((resolve, reject) => {
            connection.query('SELECT ensembles.nomEnsemble FROM ensembles, dossiers, accounts where ensembles.idDossier = dossiers.id and dossiers.idCreateur=accounts.id and accounts.id=?;', [userID], (error, results, fields) => {
                if (error) {
                    console.error('Error executing SQL query:', error);
                    reject(error);
                } else {
                    const ensemblesList = results.map(result => result.nomEnsemble);
                    resolve(ensemblesList);
                }
            });
        });
        console.log('2. liste_dossiers:', liste_dossiers);
        console.log('2. liste_ensembles:', liste_ensembles);
        res.render('creer', { dossiers: liste_dossiers});
    } catch (error) {
        console.error('Error fetching data:', error);
        res.send('An error occurred. Please try again later.');
    }
});


//------------------- Creer Dossier -------------------
app.post('/creationDossier', async (request, response) => {
        console.log(`request.body=${JSON.stringify(request.body)}`)
        let nomDossier = request.body.nomDossier;
        // Ensure the input fields exist and are not empty
        if (nomDossier) {
            // Execute SQL query that'll select the account from the database based on the specified newUsername and newPassword
            connection.query('INSERT INTO dossiers (nomDossier, idCreateur) VALUES (?, ?)', [nomDossier, userID], function(error, results, fields) {
                // If there is an issue with the query, output the error
                if (error) {
                    console.error('Error executing SQL query: ' + error);
                    response.send('An error occurred. Please try again later.');
                } else {
                    // Redirect to home page
                    console.log(`redirecting... user=${user}`);
                    response.redirect(`home?user=${user}`);
                }
                response.end();
            });
        } else {
            response.send('Username or password missing.');
            response.end();
        }
});


// Route to handle form submission
app.post('/submit', (req, res) => {
    const selectedItems = req.body.checkboxes || [];
    console.log('Selected Items:', selectedItems);
    res.send('Form submitted successfully!');
});


// example of results :
// [
    //     { id: 1, name: 'Card 1', description: 'Description of Card 1', idEnsemble: 1 },
    //     { id: 2, name: 'Card 2', description: 'Description of Card 2', idEnsemble: 1 },
    //     { id: 3, name: 'Card 3', description: 'Description of Card 3', idEnsemble: 2 }
    // ]

// var popup = require('popups');
const notifier = require('node-notifier');
const popup = require('node-popup');


//------------------- creerCarte -------------------
app.post('/creerCarte', async (request, response) => {
    try {
        const nomEnsemble = request.body.nomEnsemble;
        const nomDossier = request.body.nomDossier;
        const motTerme = request.body.motTerme;
        const motDefinition = request.body.motDefinition;
        console.log('request.body', request.body);
        
        // Retrieve the IDs of the dossier and ensemble
        const [dossierResult, ensembleResult] = await Promise.all([
            queryPromise(connection, 'SELECT id FROM dossiers WHERE nomDossier = ?', [nomDossier]),
            queryPromise(connection, 'SELECT id FROM ensembles WHERE nomEnsemble = ?', [nomEnsemble])
        ]);
        
        if (!dossierResult.length) {
            const erreur='Dossier introuvable :(';
            response.render('page_probleme', {message_erreur: erreur});
            return;
        }
        
        const idDossier = dossierResult[0].id;
        console.log('idDossier : ' + idDossier);
        
        if (!ensembleResult.length) {
            console.log('insert into ensembles', nomEnsemble, idDossier);
            await queryPromise(connection, 'INSERT INTO ensembles (nomEnsemble, idDossier) VALUES (?, ?)', [nomEnsemble, idDossier]);
            queryPromise(connection, 'SELECT id FROM ensembles WHERE nomEnsemble = ?', [nomEnsemble]);
            console.log('ensembleResult', ensembleResult);
        }
        
        const idEnsemble = ensembleResult[0].id;
        console.log('idEnsemble : ' + idEnsemble);

        // Insert data into the database
        console.log('insert into cartes ', motTerme, motDefinition, idEnsemble);
        await queryPromise(connection, 'INSERT INTO cartes (motTerme, motDefinition, idEnsemble) VALUES (?, ?, ?)', [motTerme, motDefinition, idEnsemble]);
    } catch (error) {
        console.error('Error creating card:', error);
        response.render('/creer', { dossiers: liste_dossiers});
    }
});

// Helper function to promisify MySQL queries
function queryPromise(connection, sql, values) {
    return new Promise((resolve, reject) => {
        connection.query(sql, values, (error, results, fields) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
}
    
const _ = require('lodash');

let card_set = {
    ensemble: '',
    ids:[],
    terms: [],
    definitions: [],
    hints: [],
    knownLevel: [],
    randNumList: []
}
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



//-------------------Initialiser le serveur-------------------
app.listen(port, () => console.info(`App listening on port ${port}`))