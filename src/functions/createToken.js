const jwt = require('jsonwebtoken');
require('dotenv/config');

const createToken = id => {
    const maxAge = 24 * 60 * 60 * 1; // 1 day in terms of seconds

    return jwt.sign({ id }, process.env.JWT_SECRET || 'appSecret', {
        expiresIn: maxAge
    });
};

module.exports = createToken;
