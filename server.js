// Built-in Node.js modules
let fs = require('fs');
let path = require('path');
let cors = require('cors');

// NPM modules
let express = require('express');
let sqlite3 = require('sqlite3');


let db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

let app = express();
let port = 8080;

app.use(express.json());
app.use(cors());

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
    let query = "SELECT * FROM Codes";
    let params = [];
    let codes = req.query.code;
    if (codes !== undefined) {
        var array = codes.split(",");
        if (array.length > 1) {
            query += " WHERE code in (" + array + ')';
        } else {
            query += " WHERE code = ?";
            params = codes;
        }
    }
    query += " ORDER BY code";
    databaseSelect(query, params)
    .then(data => {
        res.status(200).type('json').send(data);
    })
    .catch(err => {
        res.status(500).send('Error: ' + err);
    });
});

// GET request handler for neighborhoods
app.get('/neighborhoods', (req, res) => {
    console.log(req.query); // query object (key-value pairs after the ? in the url)
    let query = 'SELECT * FROM Neighborhoods ORDER BY neighborhood_number'
    let params = [];
    var id = req.query.id;
    if (id !== undefined) {
        var arr = id.split(",");
        console.log(arr);
        if(arr.length > 1) {
            query = "SELECT * FROM Neighborhoods WHERE neighborhood_number in (" + arr + ')';
        } else if (arr.length === 1){
            query = "SELECT * FROM Neighborhoods WHERE neighborhood_number = ? ORDER BY neighborhood_number";
            params = arr;
        }
    }
    databaseSelect(query, params)
    .then(values => {
        res.status(200).type('json').send(values);
    })
    .catch(err => {
        res.status(500).send('Error: ' + err);
    });
});

// GET request handler for crime incidents
app.get('/incidents', (req, res) => {
    let query = 'SELECT * FROM Incidents';
    query = buildIncidentQuery(query, req.query);
    databaseSelect(query)
    .then((data) => {
        //split date and time
        for(let i = 0; i < data.length; i++) {
            data[i].date = data[i].date_time.split('T')[0];
            data[i].time = data[i].date_time.split('T')[1];
            delete data[i].date_time;
        }
        res.status(200).type('json').send(data);
    })
    .catch((err) => {
        res.status(500).send('Error: Unable to retrieve incidents');
    });
});

function buildIncidentQuery(query, obj) {
    let keys = Object.keys(obj);
    let clause = ' WHERE ';
    if(keys.includes('start_date')) {
        query += clause + "date_time => date('" + obj.start_date + "')";
        clause = ' AND ';
    }
    if(keys.includes('end_date')) {
        query += clause + "date_time <= date('" + obj.end_date + "')";
        clause = ' AND ';
    }
    if(keys.includes('code')) {
        let codes = obj.code.split(',');
        if(codes.length > 1) {
            query += clause + 'code in (' + codes + ')';
        } else if (codes.length === 1){
            query += clause + 'code = ' + codes[0];
        }
        clause = ' AND ';
    }
    if(keys.includes('grid')) {
        let grids = obj.grid.split(',');
        if(grids.length > 1) {
            query += clause + 'police_grid in (' + grids + ')';
        } else if (grids.length === 1){
            query += clause + 'police_grid = ' + grids[0];
        }
        clause = ' AND ';
    }
    if(keys.includes('neighborhood')) {
        let hoods = obj.neighborhood.split(',');
        if(hoods.length > 1) {
            query += clause + 'neighborhood_number in (' + hoods + ')';
        } else if (grids.length === 1){
            query += clause + 'neighborhood_number = ' + hoods[0];
        }
        clause = ' AND ';
    }
    query += ' ORDER BY date_time DESC'
    if(keys.includes('limit')) { //Should be added to end of query
        query += ' LIMIT ' + obj.limit;
    } else { //Set default limit to 1000
        query += ' LIMIT 1000';
    }
    return query;
}

// PUT request handler for new crime incident
app.put('/new-incident', (req, res) => {
    let data = req.body;
    databaseSelect("SELECT * FROM Incidents WHERE case_number = ?", data.case_number)
    .then((data) => {
        res.status(500).send('Error: Case_number already exists in the database');
    })
    .catch((err) => {
        if(err !== "No Records Found") {
            res.status(500).send('Error: ' + err);
        }
        var date_time = data.date + 'T' + data.time;
        let params = [data.case_number, date_time, data.code, data.incident, data.police_grid, data.neighborhood_number, data.block];
        let query = "INSERT INTO incidents VALUES (?, ?, ?, ?, ?, ?, ?);"
        databaseRun(query, params)
        .then(() => {
            res.status(200).type('txt').send('OK');
        })
        .catch((err) => {
            res.status(500).type('txt').send('Unable to insert new incident due to ' + err);
        })
    });
});

// DELETE request handler for new crime incident
app.delete('/remove-incident', (req, res) => {
    databaseSelect("SELECT * FROM Incidents WHERE case_number = ?", req.query.case_number)
    .then((data) => {
        let query = "DELETE FROM incidents WHERE case_number = ?"
        databaseRun(query, req.query.case_number)
        .then(() => {
            res.status(200).type('txt').send('OK '+ this.change);
        })
        .catch((err) => {
            res.status(500).type('txt').send('Error: ' + err);
        });
    })
    .catch((err) => {
        res.status(500).send('Error: ' + err);
    });
});


// Create Promise for SQLite3 database SELECT query 
function databaseSelect(query, params) {
    return new Promise((resolve, reject) => {
        db.all(query, params, (err, rows) => {
            if (err) {
                reject(err);
            }
            else if (rows.length === 0) {
                reject("No Records Found");
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
