const mongoose = require('mongoose');

const PopupSchema = new mongoose.Schema({
    image: { type: String, required: true },
    status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const PopupModel = mongoose.model('Popup', PopupSchema)

module.exports = PopupModel