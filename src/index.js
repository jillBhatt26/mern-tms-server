// Requires
// ------------------------------------
const dotenv = require('dotenv');
const express = require('express');
const { connect } = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const appRouter = require('./router');
const errorHandlerMiddleware = require('./middleware/error');
const config = require('./config/env');
// const os = require('os');

// INIT, Config, SETUP
// ------------------------------------

dotenv.config();

// init app
const app = express();

// cookie parser middleware
app.use(cookieParser());

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

console.log('config: ', config);
console.log('PRO_DB_URL: ', process.env);

const DB_URL = config.DB_URL;
const PORT = process.env.PORT || 5000;

// app.get('/', (_, res) => {
//     return res.json({ host: os.hostname() });
// });

connect(DB_URL)
    .then(() => {
        app.listen(PORT, err => {
            if (err) throw err;
            else console.log(`🚀....Server live....🚀`);

            // console.log('current host: ', os.hostname());
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
