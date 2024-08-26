const mongoose = require('mongoose');

const SurchargeSchema = new mongoose.Schema({
    type: { type: String, required: true },
    price: { type: Number, required: true },
}, {
    timestamps: true 
});

const SurchargeModel = mongoose.model('Surcharge', SurchargeSchema)

module.exports = SurchargeModel