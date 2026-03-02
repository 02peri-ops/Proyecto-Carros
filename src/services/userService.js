const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

// Use environment variable for data path (Render provides /tmp for temporary storage)
// For persistent storage, use a persistent disk mount path
const dataDir = process.env.DATA_PATH || path.join(__dirname, '../data');
const dataFilePath = path.join(dataDir, 'users.json');

// Ensure data directory exists
const ensureDataDir = () => {
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
};

// Helper function to read users from JSON file
const readUsers = () => {
    try {
        if (!fs.existsSync(dataFilePath)) {
            // Create default users file if it doesn't exist
            ensureDataDir();
            const defaultData = {
                users: [{
                    _id: 'admin-001',
                    username: 'admin',
                    password: '$2b$10$5i8IarhnQ6greECz71NBfON/7MsqfBQMhnuAYfwBQhuhapUFv1mqy',
                    role: 'admin'
                }]
            };
            fs.writeFileSync(dataFilePath, JSON.stringify(defaultData, null, 2), 'utf8');
            return defaultData.users;
        }
        const data = fs.readFileSync(dataFilePath, 'utf8');
        return JSON.parse(data).users || [];
    } catch (error) {
        console.error('Error reading users file:', error.message);
        return [];
    }
};

// Helper function to write users to JSON file
const writeUsers = (users) => {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify({ users }, null, 2), 'utf8');
    } catch (error) {
        console.error('Error writing users file:', error.message);
        throw error;
    }
};

// Find user by username
const findUserByUsername = async (username) => {
    const users = readUsers();
    return users.find(user => user.username === username);
};

// Find user by ID
const findUserById = async (id) => {
    const users = readUsers();
    return users.find(user => user._id === id);
};

// Create new user
const createUser = async (userData) => {
    const users = readUsers();
    
    // Check if username already exists
    const existingUser = users.find(user => user.username === userData.username);
    if (existingUser) {
        throw new Error('Username already exists');
    }
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create new user
    const newUser = {
        _id: `user-${Date.now()}`,
        username: userData.username,
        password: hashedPassword,
        role: userData.role || 'user'
    };
    
    users.push(newUser);
    writeUsers(users);
    
    return newUser;
};

// Validate password
const validatePassword = async (password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword);
};

// Ensure admin user exists on startup
const ensureAdminExists = async () => {
    const users = readUsers();
    const adminExists = users.find(u => u.username === 'admin');
    
    if (!adminExists) {
        console.log('Creating default admin user...');
        try {
            await createUser({
                username: 'admin',
                password: 'admin123',
                role: 'admin'
            });
            console.log('Default admin user created successfully');
        } catch (error) {
            console.error('Error creating admin user:', error.message);
        }
    }
};

// Initialize admin user on module load
ensureAdminExists();

module.exports = {
    findUserByUsername,
    findUserById,
    createUser,
    validatePassword,
    ensureAdminExists
};
