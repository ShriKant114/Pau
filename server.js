const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session'); // Import express-session

const app = express();

// Database connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'userdb'
});

db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

// Middleware

// Middleware to prevent caching for pages that require login
app.use('/home', (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store');
    next();
});


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files (HTML, CSS, JS, etc.)

// Use express-session to manage user sessions
app.use(session({
    secret: 'secret-key',  // Session secret key for encryption
    resave: false,
    saveUninitialized: true,
}));

// Set views folder for rendering HTML
app.set('views', path.join(__dirname, 'views'));  // Set the views folder

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html')); // Serve index.html
});

// Login Route
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html')); // Serve login.html
});

// Register Route
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html')); // Serve register.html
});

// Register User
app.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
    db.query(sql, [name, email, password], (err, result) => {
        if (err) throw err;
        res.send('Registration successful! <a href="/login">Login</a>');
    });
});

// Login User
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            // Store user info in session
            req.session.user = result[0];
            res.redirect('/home');  // Redirect to home after login
        } else {
            res.send('Invalid credentials. <a href="/login">Try again</a>');
        }
    });
});

// Route for home page after login
app.get('/home', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/login');  // Redirect to login if not logged in
    }
    res.sendFile(path.join(__dirname, 'views', 'home.html')); // Serve home.html from views folder
});



// Logout User
// Logout User
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.redirect('/login'); // Redirect to login after logging out
    });
});


// Start Server
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
