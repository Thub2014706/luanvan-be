const mongoose = require('mongoose');

const PriceSchema = new mongoose.Schema({
    typeUser: { type: String, required: true },
    time: { type: String, required: true },
    price: { type: Number, required: true },
}, {
    timestamps: true 
});

const PriceModel = mongoose.model('Price', PriceSchema)

module.exports = PriceModel