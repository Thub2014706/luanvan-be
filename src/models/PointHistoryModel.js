const mongoose = require('mongoose');

const PointHistorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    point: { type: Number, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    // order: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    order: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'orderModel', // Tham chiếu động
    },
    orderModel: {
        type: String,
        required: true,
        enum: ['OrderTicket', 'OrderCombo'], // Các mô hình có thể tham chiếu
    },
}, {
    timestamps: true 
});

const PointHistoryModel = mongoose.model('PointHistory', PointHistorySchema)

module.exports = PointHistoryModel