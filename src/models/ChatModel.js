const mongoose = require('mongoose');

const ChatSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    senderType: { type: Boolean, required: true},
    message: { type: String },
    seen: { type: Boolean, default: false }
}, {
    timestamps: true 
});

const ChatModel = mongoose.model('Chat', ChatSchema)

module.exports = ChatModel