const mongoose = require('mongoose');

const PrintTicketSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'OrderTicket', required: true},
}, {
    timestamps: true 
});

const PrintTicketModel = mongoose.model('PrintTicket', PrintTicketSchema)

module.exports = PrintTicketModel