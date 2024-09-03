const mongoose = require('mongoose');

const OrderTicketSchema = new mongoose.Schema({
    idOrder: { type: String, required: true },
    showTime: { type: mongoose.Schema.Types.ObjectId, ref: 'ShowTime', required: true},
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true},
    seat: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', required: true},
    price: { type: Number, required: true }
    // status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const OrderTicketModel = mongoose.model('OrderTicket', OrderTicketSchema)

module.exports = OrderTicketModel