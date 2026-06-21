const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
{
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    conversationId: {
        type: String,
        required: true
    },

    message: {
        type: String,
        trim: true
    },

    attachments: [
        {
            type: String
        }
    ],

    messageType: {
        type: String,
        enum: [
            'text',
            'image',
            'video',
            'audio',
            'document',
            'gift',
            'escrow'
        ],
        default: 'text'
    },

    isRead: {
        type: Boolean,
        default: false
    },

    readAt: Date,

    deletedBySender: {
        type: Boolean,
        default: false
    },

    deletedByReceiver: {
        type: Boolean,
        default: false
    }
},
{
    timestamps: true
});

module.exports = mongoose.model(
    'Message',
    messageSchema
);
