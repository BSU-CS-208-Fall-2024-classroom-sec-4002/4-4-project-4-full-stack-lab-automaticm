import express from 'express'
import sql from 'sqlite3'

const sqlite3 = sql.verbose()

// Create an in memory table to use
const db = new sqlite3.Database(':memory:')

// This is just for testing you would not want to create the table every
// time you start up the app feel free to improve this code :)
db.run(`CREATE TABLE todo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL)`)

const app = express()
app.use(express.static('public'))
app.set('views', 'views')
app.set('view engine', 'pug')
app.use(express.urlencoded({ extended: false }))

app.get('/', function (req, res) {
    const local = { tasks: [] }
    db.each('SELECT id, task FROM todo', function (err, row) {
        if (err) {
        console.log(err)
        } else {
        local.tasks.push({ id: row.id, task: row.task })
        console.log("GET called.")
        }
    }, function (err, numrows) {
        if (!err) {
        res.render('index', local)
        } else {
        console.log(err)
        }
    })
});

// inserting
app.post('/', function (req, res) {
    const stmt = db.prepare('INSERT INTO todo (task) VALUES (?)');
    stmt.run(req.body.task, function() {
        console.log('Task ' + req.body.task + ' added');
        res.redirect('/');
    });
    stmt.finalize();
});

// deleting
app.post('/delete', function (req, res) {
    const stmt = db.prepare('DELETE FROM todo WHERE id = ?');
    stmt.run(req.body.id, function() {
        console.log("Task " + req.body.id + " removed");
        res.redirect('/');
    });
    stmt.finalize();
});

// Start the web server
app.listen(3000, function () {
    console.log('Listening on port 3000...')
})
