const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 8 },
    avatar: { type: String },
    // cccd: { type: String, required: true, unique: true },
    // birth:  { type: Date, required: true },
    phone:  { type: String, required: true, unique: true },
    qrCode: { type: String, required: true, unique: true },
    role: { type: Number, default: 2 },
    status: { type: Boolean, required: true, default: false },
    // access: { type: Array, required: true },
}, {
    timestamps: true 
});

const UserModel = mongoose.model('User', UserSchema)

module.exports = UserModel