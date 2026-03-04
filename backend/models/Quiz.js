const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'Question text is required']
    },
    options: [{
        type: String,
        required: [true, 'Options are required']
    }],
    correctAnswer: {
        type: String,
        required: [true, 'Correct answer is required']
    }
});

const quizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Quiz title is required'],
        trim: true
    },
    category: {
        type: String,
        required: [true, 'Quiz category is required'],
        trim: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    timeLimit: {
        type: Number,
        default: 0
    },
    quizPin: {
        type: String,
        unique: true
    },
    questions: [questionSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Quiz', quizSchema);
