const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const Result = require('../models/Result');
const jwt = require('jsonwebtoken');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Middleware to protect routes
const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized, no token' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

// @route   POST /api/quizzes/generate
// @desc    Generate a quiz using Gemini AI
// @access  Private
router.post('/generate', protect, async (req, res) => {
    try {
        const { topic, numQuestions = 5 } = req.body;

        if (!topic) {
            return res.status(400).json({ message: 'Please provide a topic' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ message: 'Gemini API key is not configured on the server' })
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        // Use the reliable flash model for JSON tasks
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Generate a multiple choice quiz about "${topic}" with ${numQuestions} questions.
    
    You MUST return ONLY valid JSON. The JSON must have this exact structure:
    {
      "questions": [
        {
          "text": "The question text, e.g., What is the capital of France?",
          "options": ["London", "Paris", "Berlin", "Madrid"],
          "correctAnswer": "Paris"
        }
      ]
    }
    
    Ensure that the correctAnswer is EXACTLY matching one of the items in the options array. Do not include markdown blocks like \`\`\`json around your response.`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Attempt to parse the JSON. 
        // Sometimes models wrap in markdown, so we do a quick cleanup just in case.
        let cleanedText = responseText.trim();
        if (cleanedText.startsWith('\`\`\`json')) {
            cleanedText = cleanedText.replace(/^\`\`\`json/m, '').replace(/\`\`\`$/m, '').trim();
        } else if (cleanedText.startsWith('\`\`\`')) {
            cleanedText = cleanedText.replace(/^\`\`\`/m, '').replace(/\`\`\`$/m, '').trim();
        }

        const quizData = JSON.parse(cleanedText);
        res.json(quizData.questions);

    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({ message: error.message || 'Error generating quiz' });
    }
});

// @route   POST /api/quizzes
// @desc    Create a new quiz in the database
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, category, questions, timeLimit } = req.body;

        if (!title || !category || !questions || questions.length === 0) {
            return res.status(400).json({ message: 'Please provide title, category, and at least one question' });
        }

        // Generate a unique 6-digit alphanumeric PIN
        const generatePin = () => {
            const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid O, 0, I, 1 for clarity
            let result = '';
            for (let i = 0; i < 6; i++) {
                result += characters.charAt(Math.floor(Math.random() * characters.length));
            }
            return result;
        };

        let quizPin = generatePin();
        // Check if PIN already exists (rare, but good practice)
        let pinExists = await Quiz.findOne({ quizPin });
        while (pinExists) {
            quizPin = generatePin();
            pinExists = await Quiz.findOne({ quizPin });
        }

        const quiz = await Quiz.create({
            title,
            category,
            timeLimit: timeLimit || 0,
            quizPin,
            // Since req.user is now the full user document, we can use req.user._id
            creator: req.user._id,
            questions
        });

        res.status(201).json(quiz);
    } catch (error) {
        console.error('Quiz creation error:', error);
        res.status(500).json({ message: error.message });
    }
});

// @route   GET /api/quizzes
// @desc    Get all quizzes
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let query = {};

        // If the user is an instructor, they should only see quizzes they created
        if (req.user.role === 'Instructor') {
            query.creator = req.user._id;
        }

        const quizzes = await Quiz.find(query).populate('creator', 'name email');
        res.json(quizzes);
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        res.status(500).json({ message: 'Server error fetching quizzes' });
    }
});

// @route   GET /api/quizzes/:id
// @desc    Get single quiz by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (error) {
        console.error('Error fetching quiz:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.status(500).json({ message: 'Server error fetching quiz' });
    }
});

// @route   PUT /api/quizzes/:id
// @desc    Update a quiz
// @access  Private
router.put('/:id', protect, async (req, res) => {
    try {
        const { title, category, questions, timeLimit } = req.body;

        let quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Ensure user is the creator
        if (quiz.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to edit this quiz' });
        }

        quiz.title = title || quiz.title;
        quiz.category = category || quiz.category;
        quiz.questions = questions || quiz.questions;
        if (timeLimit !== undefined) {
            quiz.timeLimit = timeLimit;
        }

        await quiz.save();
        res.json(quiz);
    } catch (error) {
        console.error('Error updating quiz:', error);
        res.status(500).json({ message: 'Server error updating quiz' });
    }
});

// @route   DELETE /api/quizzes/:id
// @desc    Delete a quiz
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Ensure user is the creator
        if (quiz.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this quiz' });
        }

        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz removed' });
    } catch (error) {
        console.error('Error deleting quiz:', error);
        if (error.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.status(500).json({ message: 'Server error deleting quiz' });
    }
});

// @route   GET /api/quizzes/join/:pin
// @desc    Get quiz by PIN
// @access  Private
router.get('/join/:pin', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ quizPin: req.params.pin.toUpperCase() }).populate('creator', 'name');
        if (!quiz) {
            return res.status(404).json({ message: 'Invalid Quiz PIN' });
        }
        res.json(quiz);
    } catch (error) {
        console.error('Error joining quiz:', error);
        res.status(500).json({ message: 'Server error joining quiz' });
    }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Submit quiz answers and save result
// @access  Private
router.post('/:id/submit', protect, async (req, res) => {
    try {
        const { answers } = req.body;
        const quiz = await Quiz.findById(req.params.id);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        let score = 0;
        quiz.questions.forEach((q) => {
            const qId = q._id.toString();
            if (answers[qId] === q.correctAnswer) {
                score++;
            }
        });

        // Only save results for Students. Instructors previewing their quiz get
        // the score back but their attempt is NOT stored in the database.
        if (req.user.role === 'Student') {
            const result = await Result.create({
                quiz: quiz._id,
                student: req.user._id,
                score,
                total: quiz.questions.length,
                answers
            });
            return res.status(201).json(result);
        }

        // Instructor preview — return calculated score only, no DB save
        res.json({ score, total: quiz.questions.length, preview: true });
    } catch (error) {
        console.error('Error submitting quiz:', error);
        res.status(500).json({ message: 'Server error submitting quiz' });
    }
});

// @route   GET /api/quizzes/:id/results
// @desc    Get all results for a specific quiz (Instructor only)
// @access  Private
router.get('/:id/results', protect, async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Only the creator can see results
        if (quiz.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to view these results' });
        }

        const results = await Result.find({ quiz: req.params.id })
            .populate('student', 'name email')
            .sort({ createdAt: -1 });

        res.json(results);
    } catch (error) {
        console.error('Error fetching results:', error);
        res.status(500).json({ message: 'Server error fetching results' });
    }
});

module.exports = router;
