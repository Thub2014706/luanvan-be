const mongoose = require('mongoose');

const ShowTimeSchema = new mongoose.Schema({
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true},
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true},
    schedule: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true},
    date: { type: Date, required: true },
    translate: { type: String, required: true },
    timeStart: { type: String, required: true },
    timeEnd: { type: String, required: true },
    type: { type: String, required: true },
    status: { type: String, required: true },
    isDelete: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const ShowTimeModel = mongoose.model('ShowTime', ShowTimeSchema)

module.exports = ShowTimeModel