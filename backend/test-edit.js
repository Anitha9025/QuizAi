const User = require('./models/User');
const Quiz = require('./models/Quiz');
const mongoose = require('mongoose');
require('dotenv').config();

async function runTest() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Create one instructor
    const inst1 = await User.create({ name: 'Editing Inst', email: 'editinginst@test.com', password: 'password', role: 'Instructor' });

    // 2. Create quiz
    const q = await Quiz.create({
        title: 'Old Title', category: 'Math', creator: inst1._id,
        questions: [{ text: 'a', options: ['a', 'b'], correctAnswer: 'a' }]
    });

    console.log('Original Quiz Title:', q.title);

    // 3. Simulate API PUT /api/quizzes/:id logic manually for this test script without starting an express server
    const reqUser = { _id: inst1._id };
    const reqBody = { title: 'New Title', category: 'Science', questions: q.questions };

    let quiz = await Quiz.findById(q._id);
    if (quiz.creator.toString() !== reqUser._id.toString()) {
        console.error('Not authorized to edit this quiz');
    } else {
        quiz.title = reqBody.title || quiz.title;
        quiz.category = reqBody.category || quiz.category;
        quiz.questions = reqBody.questions || quiz.questions;
        await quiz.save();
        console.log('Updated Quiz Title:', quiz.title);
    }

    // cleanup
    await User.deleteMany({ email: 'editinginst@test.com' });
    await Quiz.deleteMany({ _id: q._id });

    await mongoose.disconnect();
}

runTest().catch(console.error);
