const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
    row: { type: Number, required: true },
    col: { type: Number, required: true },
    type: { type: String, required: true },
    status: { type: Boolean, required: true, default: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true},
    isDelete: { type: Boolean, default: false },
    bottom: { type: Number, default: 0 },
    left: { type: Number, default: 0 },
    right: { type: Number, default: 0 },
}, {
    timestamps: true 
});

const SeatModel = mongoose.model('Seat', SeatSchema)

module.exports = SeatModel