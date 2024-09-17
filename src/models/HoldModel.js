const mongoose = require('mongoose');

const HoldSchema = new mongoose.Schema({
    showTime: { type: mongoose.Schema.Types.ObjectId, ref: 'ShowTime', required: true},
    seat: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true}],
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
}, {
    timestamps: true 
});

const HoldModel = mongoose.model('Hold', HoldSchema)

module.exports = HoldModel