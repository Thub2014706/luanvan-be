const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    title: { type: String, required: true },
    image: { type: String, required: true },
    content: { type: String, required: true },
    staff: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff', required: true}
}, {
    timestamps: true 
});

const NewsModel = mongoose.model('News', NewsSchema)

module.exports = NewsModel