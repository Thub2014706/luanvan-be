const mongoose = require('mongoose');

const ScanTicketSchema = new mongoose.Schema({
    order: { type: mongoose.Schema.Types.ObjectId, required: true },
    type: { type: String, enum: ['OrderTicket', 'OrderCombo'], required: true }
}, {
    timestamps: true 
});

const ScanTicketModel = mongoose.model('ScanTicket', ScanTicketSchema)

module.exports = ScanTicketModel