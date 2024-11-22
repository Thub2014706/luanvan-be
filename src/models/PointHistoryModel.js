const mongoose = require('mongoose');

const PointHistorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    point: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
}, {
    timestamps: true 
});

const PointHistoryModel = mongoose.model('PointHistory', PointHistorySchema)

module.exports = PointHistoryModel