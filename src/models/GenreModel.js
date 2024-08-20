const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema({
    name: { type: String, required: true },
    // status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const GenreModel = mongoose.model('Genre', GenreSchema)

module.exports = GenreModel