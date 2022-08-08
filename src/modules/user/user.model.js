const { Schema, model } = require('mongoose');

const isEmail = require('validator/lib/isEmail');

// schema definition
const UserSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Username is required!'],
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: [isEmail, 'Please enter a valid email!']
    },
    password: {
        type: String,
        required: [true, 'Password is required!'],
        minLength: [5, 'Minimum 5 characters required!']
    },
    role: {
        type: String,
        enum: ['ADMIN', 'TM USER'],
        default: 'TM USER'
    }
});

const User = model('User', UserSchema);

module.exports = User;
