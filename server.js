import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs'; // To interact with the filesystem
import bodyParser from 'body-parser'; // To parse incoming request bodies
import bcrypt from 'bcrypt'; // For hashing passwords
import session from 'express-session'; // For session management
import clientRoutes from './server/routes/clientRoutes.js';



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware to parse URL-encoded data and JSON
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Session management middleware
app.use(session({
    secret: 'your_secret_key', // Replace with a secure secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Set the views directory to the 'views' folder
app.set('views', path.join(__dirname, 'server', 'views'));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Route for home page
app.get('/', (req, res) => {
    res.render('home'); // Render home.ejs on root URL
});

// Route for login page
app.get('/login', (req, res) => {
    res.render('login'); // Render login.ejs on /login URL
});

// Route for registration page
app.get('/register', (req, res) => {
    res.render('register'); // Render register.ejs on /register URL
});

// Handle user registration
app.post('/register', (req, res) => {
    const { username, password, email, firstName, lastName, dob, role } = req.body;

    // Load existing users from users.json
    fs.readFile('./data/users.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users.json:', err);
            return res.status(500).send('Internal Server Error');
        }

        const users = JSON.parse(data);

        // Check if the username already exists
        const userExists = users.find(u => u.username === username);
        if (userExists) {
            return res.status(400).send('Username already exists');
        }

        // Hash the password before saving
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Generate a user ID
        const userId = users.length ? users[users.length - 1].id + 1 : 1;

        // Create a new user object
        const newUser = {
            id: userId,
            username,
            password: hashedPassword, // Store the hashed password
            email,
            firstName,
            lastName,
            dob,
            role,
        };

        // Add the new user to the users array
        users.push(newUser);

        // Save the updated users array back to users.json
        fs.writeFile('./data/users.json', JSON.stringify(users, null, 2), (err) => {
            if (err) {
                console.error('Error writing to users.json:', err);
                return res.status(500).send('Internal Server Error');
            }
            res.redirect('/login'); // Redirect to login page after successful registration
        });
    });
});

// Handle user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Load existing users from users.json
    fs.readFile('./data/users.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading users.json:', err);
            return res.status(500).send('Internal Server Error');
        }

        const users = JSON.parse(data);

        // Find the user with the matching username
        const user = users.find(u => u.username === username);
        if (user && bcrypt.compareSync(password, user.password)) {
            // Successful login
            req.session.userId = user.id; // Store user ID in session
            return res.redirect('/clientDashboard'); // Redirect to client dashboard
        } else {
            // Login failed
            res.status(401).send('Invalid credentials'); // Redirect to login with error message
        }
    });
});
// Route for logging out
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/login'); // Redirect to login page after logging out
    });
});


// Use client routes for the client dashboard
app.use('/clientDashboard', clientRoutes);

// Define the server port and start the app
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
