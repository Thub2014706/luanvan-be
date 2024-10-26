const mongoose = require('mongoose');

const TicketRefundSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderTicket', required: true},
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
}, {
    timestamps: true 
});

const TicketRefundModel = mongoose.model('TicketRefund', TicketRefundSchema)

module.exports = TicketRefundModel