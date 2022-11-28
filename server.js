// Built-in Node.js modules
let fs = require('fs');
let path = require('path');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

let app = express();
let port = 8000;

app.use(express.json());

// Open SQLite3 database (in read-only mode)
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
        console.log('Error opening ' + path.basename(db_filename));
    }
    else {
        console.log('Now connected to ' + path.basename(db_filename));
    }
});


// GET request handler for crime codes
app.get('/codes', (req, res) => {
    let query = "SELECT * FROM Codes ORDER BY code";
    let params = [];
    let codes = req.query.code;
    if (codes !== undefined) {
        var array = codes.split(",");
        if(array.length > 1) {
            query = "SELECT * FROM Codes WHERE code in (" + array + ')';
        } else if (array.length === 1){
            query = "SELECT * FROM Codes WHERE code = ? ORDER BY code";
            params = codes;
        }
    }
    databaseSelect(query, params).then(values => {
        res.status(200).type('json').send(values);
    });
});

// GET request handler for neighborhoods
app.get('/neighborhoods', (req, res) => {
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    
    let query = 'SELECT * FROM Neighborhoods'
    if (err) {
        res.status(500).send("Error: Neighborhood not in database");
    }
    else if (Object.keys(req.query).length === 0) {
        db.all(query, (err, rows) => {
            if (err) {
                res.status(500).send("Error: Neighborhood not in database");
            }
            else {
                res.status(200).type('json').send(rows);
            }
        });
    }
    else {
        let id = req.query.id.split(',');
        var clause = query + ' WHERE neighborhood_number = ' + id[0];
        function id_resolver(array) {
            var holder = '';
            let i;
            for (i=0; i < array.length; i++) {
                holder = holder + " OR neighborhood_number = " + array[i];
            }
            return holder;
        }
        clause = clause + id_resolver(id);
        db.all(clause, (err, rows) => {
            if (err) {
                res.status(500).send("Error: Neighborhood not in database");
            }
            else {
                res.status(200).type('json').send(rows);
            }
        });
    }
});

// GET request handler for crime incidents
app.get('/incidents', (req, res) => {
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    
    res.status(200).type('json').send({}); // <-- you will need to change this
});

// PUT request handler for new crime incident
app.put('/new-incident', (req, res) => {
    console.log(req.body); // uploaded data
    
    res.status(200).type('txt').send('OK'); // <-- you may need to change this
});

// DELETE request handler for new crime incident
app.delete('/remove-incident', (req, res) => {
    console.log(req.body); // uploaded data
    
    res.status(200).type('txt').send('OK'); // <-- you may need to change this
});


// Create Promise for SQLite3 database SELECT query 
function databaseSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(rows);
            }
        });
    });
}

// Create Promise for SQLite3 database INSERT or DELETE query
function databaseRun(query, params) {
    return new Promise((resolve, reject) => {
        db.run(query, params, (err) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}


// Start server - listen for client connections
app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
