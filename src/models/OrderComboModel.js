const mongoose = require('mongoose');

const OrderComboSchema = new mongoose.Schema({
    idOrder: { type: String, required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true},
    price: { type: Number, required: true },
    usePoint: { type: Number },
    combo: { type: Array },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: { type: String, required: true },
}, {
    timestamps: true 
});

const OrderComboModel = mongoose.model('OrderCombo', OrderComboSchema)

module.exports = OrderComboModel