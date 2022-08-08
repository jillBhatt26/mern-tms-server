// Requires
// ------------------------------------
const express = require('express');
const { connect } = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const appRouter = require('./router');
const errorHandlerMiddleware = require('./middleware/error');
const config = require('./config/env');

// INIT, Config, SETUP
// ------------------------------------

// dotenv configs
dotenv.config();

// init app
const app = express();

// cors middleware
app.use(
    cors({
        origin: [config.CLIENT_URL],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true,
        allowedHeaders: ['Content-Type']
    })
);

// url parsing setup middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cookie parser middleware
app.use(cookieParser());

const PORT = config.PORT;
const HOST = config.HOST;
const DB_URL = config.DB_URL;

connect(DB_URL)
    .then(() => {
        app.listen(PORT, HOST, err => {
            if (err) throw err;
            else console.log(`App hosted on: ${HOST}:${PORT}`);
        });
    })
    .catch(err => {
        console.log(`Error connecting to mongodb: ${err.message}`);
    });

app.use(appRouter);

app.use(errorHandlerMiddleware);
