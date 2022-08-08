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

// INIT, Config, SETUP
// ------------------------------------

// init app
const app = express();

app.set('trust proxy', 1);

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
app.use(
    cookieParser({
        secret: 'shhhhhhh!!',
        secureProxy: true
    })
);

const DB_URL = config.DB_URL;
const PORT = process.env.PORT || 5000;

connect(DB_URL)
    .then(() => {
        app.listen(PORT, err => {
            if (err) throw err;
            else console.log(`🚀...Server live...`);
        });
    })
    .catch(err => {
        console.log(`Error connecting to mongodb: ${err.message}`);
    });

app.get('/', (req, res) => {
    return res.status(200).json({ msg: 'Welcome!!' });
});

app.use(appRouter);

app.use(errorHandlerMiddleware);
