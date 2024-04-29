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
// | id | nomDossier | nomCreateur |
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

//------------------Boutons sur la page--------------------
