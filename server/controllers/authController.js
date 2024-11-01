import fs from 'fs/promises';
import bcrypt from 'bcrypt';
import path from 'path';


// Define the path to users.json in the main Smart Farm folder
const usersFilePath = path.join(process.cwd(), 'data', 'users.json'); // Adjust this based on your actual folder structure


// Registration function
export const registerUser = async (req, res) => {
    const { username, password, email, firstName, lastName, dob, role } = req.body;

    try {
        // Load existing users from users.json
        const data = await fs.readFile(usersFilePath, 'utf8');
        const users = JSON.parse(data);

        // Check if the username already exists
        const userExists = users.find(u => u.username === username);
        if (userExists) {
            return res.status(400).send('Username already exists.'); // More user-friendly error message
        }

        // Hash the password
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
        await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));
        res.redirect('/login'); // Redirect to login page after successful registration
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).send('Internal Server Error');
    }
};

// Login function
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Load existing users from users.json
        const data = await fs.readFile(usersFilePath, 'utf8');
        const users = JSON.parse(data);

        // Find the user with the matching username
        const user = users.find(u => u.username === username);
        if (user && bcrypt.compareSync(password, user.password)) {
            // Successful login
            req.session.userId = user.id; // Store user ID in session
            return res.redirect('/clientDashboard'); // Redirect to user dashboard
        } else {
            // Login failed
            return res.status(401).send('Invalid credentials. Please try again.'); // User-friendly error message
        }
    } catch (err) {
        console.error('Error during login:', err);
        return res.status(500).send('Internal Server Error'); // Avoid exposing internal errors
    }
};

// Logout function (if you need it)
export const logoutUser = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Internal Server Error');
        }
        res.redirect('/'); // Redirect to home page after logout
    });
};
