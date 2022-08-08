require('dotenv/config');

const NODE_ENV = process.env.NODE_ENV;

if (NODE_ENV.trim().toLowerCase() === 'development') {
    module.exports = {
        PORT: process.env.DEV_PORT,
        HOST: process.env.DEV_HOST,
        DB_URL: process.env.DEV_DB_URL,
        CLIENT_URL: process.env.DEV_CLIENT_URL,
        JWT_SECRET: process.env.JWT_SECRET
    };
}

if (NODE_ENV.trim().toLowerCase() === 'production') {
    module.exports = {
        PORT: process.env.PRO_PORT,
        HOST: process.env.PRO_HOST,
        DB_URL: process.env.PRO_DB_URL,
        CLIENT_URL: process.env.PRO_CLIENT_URL,
        JWT_SECRET: process.env.JWT_SECRET
    };
}
