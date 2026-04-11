const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

const http = require('http');
const socketIo = require('socket.io');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, "http://localhost:5173"] : "*",
        methods: ["GET", "POST"]
    }
});

// Make io accessible to our routers
app.set('io', io);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

// Basic Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Socket Connection
io.on('connection', (socket) => {
    console.log('New client connected');
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Something went wrong',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// Port
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
