import fs from 'fs/promises';
import path from 'path';

// Define the path to users.json in the main Smart Farm folder
const usersFilePath = path.join(process.cwd(), 'data', 'users.json');

// Client Dashboard Function
export const clientDashboard = async (req, res) => {
    if (!req.session.userId) {
        return res.redirect('/login'); // Redirect to login if not authenticated
    }

    try {
        // Load user data or any other necessary data for the dashboard
        const data = await fs.readFile(usersFilePath, 'utf8');
        const users = JSON.parse(data);
        
        // Find the current user based on userId in session
        const currentUser = users.find(user => user.id === req.session.userId);

        if (!currentUser) {
            return res.status(404).send('User not found');
        }

        // Render the client dashboard and pass the current user data
        res.render('clientDashboard', { user: currentUser });
    } catch (err) {
        console.error('Error loading dashboard data:', err);
        res.status(500).send('Internal Server Error');
    }
};
