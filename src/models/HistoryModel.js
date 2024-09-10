const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema({
    infomation: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    orderCombo: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderCombo' },
    orderTicket: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderTicket' },
}, {
    timestamps: true 
});

const GenreModel = mongoose.model('Genre', GenreSchema)

module.exports = GenreModel