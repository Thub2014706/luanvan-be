const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    type: { type: String, required: true },
    status: { type: Boolean, required: true, default: false },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true},
}, {
    timestamps: true 
});

const SeatModel = mongoose.model('Seat', SeatSchema)

module.exports = SeatModel