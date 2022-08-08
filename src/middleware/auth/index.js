const jwt = require('jsonwebtoken');
const User = require('../../modules/user/user.model');

const authMiddleware = (req, res, next) => {
    const token = req.cookies.tms_token;

    console.log('process.env.JWT_SECRET: ', process.env.JWT_SECRET);

    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedToken) => {
        if (err) {
            return next({
                status: 500,
                message: err.message || 'Failed to authorize user!'
            });
        } else {
            try {
                const user = await User.findById(decodedToken.id, {
                    password: 0
                });

                const userID = user.toJSON()._id;

                delete user.toJSON()._id;

                req.user = {
                    ...user.toJSON(),
                    userID
                };

                next();
            } catch (error) {
                return next({
                    status: 500,
                    message: error.message || 'Failed to validate the user!'
                });
            }
        }
    });
};

module.exports = authMiddleware;
