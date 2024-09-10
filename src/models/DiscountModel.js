const mongoose = require('mongoose');

const DiscountSchema = new mongoose.Schema({
    name: { type: String, required: true },
    code: { type: String, required: true },
    percent: { type: Number, required: true },
    quantity: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: { type: Boolean, required: true, default: false },
}, {
    timestamps: true 
});

const DiscountModel = mongoose.model('Discount', DiscountSchema)

module.exports = DiscountModel