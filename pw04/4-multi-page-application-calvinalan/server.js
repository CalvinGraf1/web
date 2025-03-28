import express from 'express';
import sqlite3 from "sqlite3";
import * as path from "path";
import { fileURLToPath } from 'url';

const app = express();

const file = fileURLToPath(import.meta.url)
const folder = path.dirname(file);

// Configure express
app.set('view engine', 'pug');
app.set('views', path.join(folder, 'render'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));


// Connect to the database
const db = new sqlite3.Database('./dictons.sqlite', (err) => {
    if (err) console.error("Error : Server can't open the database " + err.message);
});


// GET /
// Displays a random dicton in HTML.
// Example: <q>random dicton</q>
app.get('/', function(req, res) {
    db.get(`SELECT dicton FROM dictons ORDER BY RANDOM() LIMIT 1;`, (err, row) => {
        if (err) res.status(400).json({"Error with the GET / request : ": err.message});
        else res.render('index', {dicton: row.dicton});
    });
});

// GET /list
// Displays all the dictons ordered by id in HTML
// Example: <ul><li><a href="/1">dicton 1</a></li></ul>
app.get('/list', function(req, res) {
    db.all('SELECT * FROM dictons ORDER BY ID;', (err, dictons) => {
        if (err) res.status(400).json({"Error with the GET /list request : ": err.message});
        else res.render('list', { dictons });
    });
});



// GET /create
// Displays a HTML form for creating new dictons with POST requests.
// Example: <form method=POST><input type='text' name='dicton'></input><button>Nouveau dicton</button></form>
app.get('/create', function(req, res) {
    res.render('create');
});


// POST /create
// Inserts a new dicton in the database and redirect the user to its url
// Example: 301 /list
app.post('/create', function(req, res) {
    const value = req.body.dicton;

    db.run('INSERT INTO dictons (dicton) VALUES (?);', [value], function(err) {
        if (err) res.status(400).json({"Error with the POST /create request : ": err.message});
        else {
            const id = this.lastID;
            res.redirect('/' + id);
        }
    });
});



// GET /:id
// Returns a dicton by its id.
app.get('/:id', function(req, res) {
    const dictonId = req.params.id;

    db.get('SELECT dicton FROM dictons WHERE id=?;', [dictonId], (err, row) => {
        if (err) res.status(400).json({"Error with the GET /:id request : ": err.message});
        else res.render('index', {dicton: row.dicton});
    });
});


export default app;