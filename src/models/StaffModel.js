const mongoose = require('mongoose');

const StaffSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true, minlength: 8 },
    avatar: { type: String },
    phone:  { type: String, required: true },
    // qrCode: { type: String, required: true, unique: true },
    role: { type: Number, default: 1 },
    access: { type: Array },
    status: { type: Boolean, required: true, default: true },
    isDelete: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const StaffModel = mongoose.model('Staff', StaffSchema)

module.exports = StaffModel