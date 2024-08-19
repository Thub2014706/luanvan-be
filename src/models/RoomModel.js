const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    numRow: { type: Number, required: true },
    numCol: { type: Number, required: true },
    status: { type: Boolean, required: true, default: false },
    theater: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true},
    door: { type: Boolean, required: true, default: false },
    isDelete: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const RoomModel = mongoose.model('Room', RoomSchema)

module.exports = RoomModel