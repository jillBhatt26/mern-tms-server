// Requires
// ------------------------------------
require('dotenv/config');
const express = require('express');
const { connect } = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const appRouter = require('./router');
const errorHandlerMiddleware = require('./middleware/error');
const config = require('./config/env');
const os = require('os');

// INIT, Config, SETUP
// ------------------------------------

// init app
const app = express();

// cookie parser middleware
app.use(cookieParser());

console.log('config: ', config);

// cors middleware
app.use(
    cors({
        origin: config.CLIENT_URL,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
        allowedHeaders: ['Content-Type']
    })
);

// url parsing setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const DB_URL = config.DB_URL;
const PORT = config.PORT || 5000;

app.get('/api', (_, res) => {
    return res.json({ host: os.hostname() });
});

connect(DB_URL)
    .then(() => {
        app.listen(PORT, err => {
            if (err) {
                console.log('Listen error: ', err);
            } else console.log(`🚀....Server live....🚀`);

            console.log('current host: ', os.hostname());
        });
    })
    .catch(err => {
        console.log(`Error connecting to mongodb: ${err.message}`);
    });

app.use('/api', appRouter);

app.use(errorHandlerMiddleware);

app.use('*', (req, res) => {
    return res.status(404).json({
        message: 'No route found'
    });
});
