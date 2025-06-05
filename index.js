const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const morgan = require('morgan');
const app = express();
const { initializeSocket } = require('./socketServer');
const PORT = process.env.PORT || 3000;

// Load environment variables from .env file
dotenv.config();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));



// Socket.io setup
const server = http.createServer(app);
initializeSocket(server);



// Import routes
const authRoutes = require('./routes/auth.routes.js');
const taskRoutes = require('./routes/task.routes.js');

// Mount routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);

//mongo connection setup 
const initDb = require('./config/db');

 



app.get('/', (req, res) => {
    res.send('Welcome to the API');
});


initDb().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error('Failed to connect to the database:', error);
    process.exit(1);
});

