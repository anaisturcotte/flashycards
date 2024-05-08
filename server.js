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

//------------------- Déconnexion -------------------
app.post('/deconnexion', function(request, response) { 
    // Capture the input fields
    console.log('deconnexion')
    user = '';
    userID = '';
    response.render("index");
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


//------------------- creerCarte -------------------
app.post('/creerCarte', async (request, response) => {
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
            const [ensembleResult] = await Promise.all(
                [queryPromise(connection, 'SELECT id FROM ensembles WHERE nomEnsemble = ?', [nomEnsemble])
            ]);
            console.log('ensembleResult', ensembleResult);
        }
        
        const idEnsemble = ensembleResult[0].id;
        console.log('idEnsemble : ' + idEnsemble);

        // Insert data into the database
        console.log('insert into cartes ', motTerme, motDefinition, idEnsemble);
        await queryPromise(connection, 'INSERT INTO cartes (motTerme, motDefinition, idEnsemble) VALUES (?, ?, ?)', [motTerme, motDefinition, idEnsemble]);
        response.render('creer', { dossiers: liste_dossiers});
    } catch (error) {
        console.error('Error creating card:', error);
        response.render('creer', { dossiers: liste_dossiers});
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
    i: 0,
    presentCard: 0,
    ensemble: '',
    terms: [],
    definitions: [],
    knownLevel: [],
    randNumList: []
}


let front = '';
let back = '';

app.post('/postData', async (req, res) => {
    try {const data = req.body.data;
        console.log('req.body.data', req.body.data); // le nom de l'ensemble
        const [termes, definitions, niveauxConnus] = await Promise.all([
            queryPromise(connection, 'SELECT motTerme FROM cartes, ensembles WHERE ensembles.nomEnsemble=? and ensembles.id=cartes.idEnsemble;', [data]),
            queryPromise(connection, 'SELECT motDefinition FROM cartes, ensembles WHERE ensembles.nomEnsemble=? and ensembles.id=cartes.idEnsemble;', [data]),
            queryPromise(connection, 'SELECT nivConnu FROM cartes, ensembles WHERE ensembles.nomEnsemble=? and ensembles.id=cartes.idEnsemble;', [data])
        ]);
        
        card_set.terms = [];
        card_set.definitions = [];
        card_set.knownLevel = [];
        card_set.randNumList = [];
        card_set.i = 0;
        for (let i = 0; i < termes.length; i++) {
            card_set.terms.push(termes[i].motTerme);
            card_set.definitions.push(definitions[i].motDefinition);
            if (niveauxConnus[i].nivConnu == null) {
                card_set.knownLevel.push(0);
            } else {
                card_set.knownLevel.push(niveauxConnus[i].nivConnu);
            }
        }
        
        console.log('card_set.terms :', card_set.terms);
        console.log('card_set.definitions :', card_set.definitions);
        console.log('card_set.knownLevel :', card_set.knownLevel);

        for (let i = 0; i < card_set.terms.length; i++) {
            let randomNumber;
            function inside() {
                randomNumber = _.random(0, (card_set.terms.length)-1);
                if (card_set.randNumList.includes(randomNumber)) {
                    inside(); // Retry generating a random number
                } else {
                    card_set.randNumList.push(randomNumber);
                }
            }
            inside();
        }
        console.log(`card_set.randNumList: ${card_set.randNumList}`);
        card_set.presentCard = card_set.randNumList[0];
        console.log('card_set.presentCard : ', card_set.presentCard);
        front = card_set.terms[card_set.presentCard];
        back = card_set.definitions[card_set.presentCard];
        niveau = card_set.knownLevel[card_set.presentCard];

        console.log(`front : ${front}, back :  ${back}, niveau : 0`);
        
        res.render('ex_cards', {front: front, back: back, niveau: 0});
    } catch (error) {
        console.error('Error opening card set:', error);
        res.render('page_probleme');
    }
});

app.post('/nextCard', (req, res) => {
    // const data = req.body.data;
    // console.log('next_card req.body.data', req.body.data);
    // card_set.knownLevel.push(data);
    // try {const data = req.body.data; // le niveau de connaissance
    //     queryPromise(connection, 'UPDATE cartes (nivConnu)VALUES (?) WHERE catrtes.motTerme=?;', [data, card_set.terms[card_set.presentCard]]);
    // } catch (error) {
    //     console.error('Error opening card set:', error);
    //     res.render('page_probleme');
    // }
    card_set.i = card_set.i + 1;
    if ((card_set.i)+1 > card_set.terms.length) {
        res.render('home', {user: user});
    }
    nextNum = card_set.randNumList[card_set.i];
    front = card_set.terms[nextNum];
    back = card_set.definitions[nextNum];
    niveau = card_set.knownLevel[nextNum];
    console.log(`next_card card_set.i: ${card_set.i}, nextNum: ${nextNum}, front: ${front}, back: ${back}, niveau: ${niveau}`);
    res.render('ex_cards', {front: front, back: back, niveau: 1});
});


//-------------------Initialiser le serveur-------------------
app.listen(port, () => console.info(`App listening on port ${port}`))