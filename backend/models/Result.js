const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    quiz: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        required: true
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    answers: {
        type: Object,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);
