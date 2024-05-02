// -------------------------------- //
// Script pour manipuler les cartes //
// -------------------------------- //

// MySQL database: nodelogin

// mysql> select * from accounts;
// +----+-----------+----------+---------------------+
// | id | username  | password | email               |
// +----+-----------+----------+---------------------+
// |  1 | nikola    | test1    | nikola@test.com     |
// |  2 | Jean      | test2    | jean.test@test.com  |
// |  3 | Jean      | test2    | jean.test@test.com  |
// |  4 | Jean      | test3    | jean.test@test.com  |
// |  5 | coriandre | test5    | cori.andre@test.com |
// |  6 | bic       | test6    | stylo.bic@test.com  |
// +----+-----------+----------+---------------------+

// mysql> select * from dossiers;
// +----+------------+-------------+
// | id | nomDossier | idCreateur |
// +----+------------+-------------+
// |  1 |            |             |
// +----+------------+-------------+

// mysql> select * from ensembles;
// +----+-------------+-----------+
// | id | nomEnsemble | idDossier |
// +----+-------------+-----------+
// |  1 |             |           |
// +----+-------------+-----------+

// mysql> select * from cartes;
// +----+------------+----------+---------------+------+----------+
// | id | idEnsemble | motTerme | motDefinition | aide | nivConnu |
// +----+------------+----------+---------------+------+----------+
// |  1 |            |          |               |      |          |
// +----+------------+----------+---------------+------+----------+

//------------------Côté serveur / Côté client--------------------
// Côté serveur:
// | MySQL
// |   | Affichage des cartes
// |   | paramètres de connexion

// Côté client:
// | username et email passés dans le url lors de la connexion
// | fonctions utilisées pour les annimations

//------------------utiliser les requêtes dans le HTML--------------------

// Toutes instances où une variable contenue dans le MySQL est utilisée dans une page HTML 
// doivent être dans un conteneur <p> / <div> / ... avec id : "#userInfo" + le nom de 
// l'enregistrement où elle est contenue.
// Puisque toutes les tables sont connectées à accounts avec l'ID de l'utisisateur

//------------------utiliser des templates avec mustache--------------------
// https://www.npmjs.com/package/mustache

// install mustache: npm install mustache --save