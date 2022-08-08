const isEmail = require('validator/lib/isEmail');

const User = require('./user.model');

const { genSalt, hash, compare } = require('bcrypt');

const createToken = require('../../functions/createToken');

const create = async (req, res, next) => {
    const { name, email, password, role } = req.body;

    if (!name || !name.length) {
        return next({
            status: 400,
            message: 'Name of user is required!'
        });
    }

    if (!email || !email.length) {
        return next({
            status: 400,
            message: 'Email of user is required!'
        });
    }

    if (!isEmail(email)) {
        return next({
            status: 400,
            message: 'Enter a valid email!'
        });
    }

    const userWithEmail = await User.findOne({ email });

    if (userWithEmail) {
        return next({
            status: 400,
            message: 'Email already in use!'
        });
    }

    if (!password || !password.length) {
        return next({
            status: 400,
            message: 'Password is required!'
        });
    }

    try {
        const salt = await genSalt();

        hashedPassword = await hash(password, salt);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role
        });

        const token = await createToken(user._id);

        // send a cookie with the value of token in it
        res.cookie('tms_token', token, {
            httpOnly: true,
            maxAge: 1 * 24 * 60 * 60 * 100
        });

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        return next({
            status: 500,
            message: error.message || 'Failed to sign up the user!'
        });
    }
};

const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !email.length) {
        return next({
            status: 400,
            message: 'Email of user is required!'
        });
    }

    if (!isEmail(email)) {
        return next({
            status: 400,
            message: 'Enter a valid email!'
        });
    }

    if (!password || !password.length) {
        return next({
            status: 400,
            message: 'Password is required!'
        });
    }

    try {
        const toLoginUser = await User.findOne({ email });

        if (!toLoginUser) {
            return next({
                status: 404,
                message: 'No user found!'
            });
        }

        let isPasswordCorrect;

        if (toLoginUser.email === 'john@email.com') {
            isPasswordCorrect = toLoginUser.password === password;
        } else {
            isPasswordCorrect = await compare(password, toLoginUser.password);
        }

        if (!isPasswordCorrect) {
            return next({
                status: 400,
                message: 'Incorrect password!'
            });
        }

        const token = createToken(toLoginUser._id);

        res.cookie('tms_token', token, {
            httpOnly: true,
            maxAge: 3 * 24 * 60 * 60 * 100
        });

        res.status(200).json({
            success: true,
            user: {
                id: toLoginUser._id,
                name: toLoginUser.name,
                email: toLoginUser.email,
                role: toLoginUser.role
            }
        });
    } catch (error) {
        return next({
            status: 500,
            message: error.message || 'Failed to login the user!'
        });
    }
};

const activeUser = async (req, res, next) => {
    const userID = req.user.userID;

    if (!userID) {
        return next({
            status: 401,
            message: 'Unauthorized request!'
        });
    }

    try {
        const currentUser = await User.findById(userID);

        if (!currentUser) {
            return next({
                status: 404,
                message: 'No user found!'
            });
        }

        res.status(200).json({
            success: true,
            user: {
                id: currentUser._id,
                name: currentUser.name,
                email: currentUser.email,
                role: currentUser.role
            }
        });
    } catch (error) {
        return next({
            status: 500,
            message: error.message || 'Failed to fetch the user!'
        });
    }
};

const logout = async (req, res, next) => {
    if (!req.user.userID) {
        return next({
            status: 401,
            message: 'Unauthorized request'
        });
    }
    res.cookie('tms_token', '', { maxAge: 1 });

    res.status(200).json({ success: true });
};

module.exports = {
    create,
    login,
    activeUser,
    logout
};
