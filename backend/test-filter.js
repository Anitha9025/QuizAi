const User = require('./models/User');
const Quiz = require('./models/Quiz');
const mongoose = require('mongoose');
require('dotenv').config();

async function runTest() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Create two instructors
    const inst1 = await User.create({ name: 'Inst1', email: 'inst1@test.com', password: 'password', role: 'Instructor' });
    const inst2 = await User.create({ name: 'Inst2', email: 'inst2@test.com', password: 'password', role: 'Instructor' });

    // 2. Create quizzes for each
    await Quiz.create({
        title: 'Inst1 Quiz', category: 'Math', creator: inst1._id,
        questions: [{ text: 'a', options: ['a'], correctAnswer: 'a' }]
    });
    await Quiz.create({
        title: 'Inst2 Quiz', category: 'Science', creator: inst2._id,
        questions: [{ text: 'b', options: ['b'], correctAnswer: 'b' }]
    });

    // 3. Simulate API GET /api/quizzes logic for inst1
    const query = { creator: inst1._id };
    const quizzes1 = await Quiz.find(query);
    console.log('Quizzes for Inst1:', quizzes1.map(q => q.title).join(', '));

    // 4. Simulate API GET /api/quizzes logic for inst2
    const query2 = { creator: inst2._id };
    const quizzes2 = await Quiz.find(query2);
    console.log('Quizzes for Inst2:', quizzes2.map(q => q.title).join(', '));

    // cleanup
    await User.deleteMany({ email: { $in: ['inst1@test.com', 'inst2@test.com'] } });
    await Quiz.deleteMany({ title: { $in: ['Inst1 Quiz', 'Inst2 Quiz'] } });

    await mongoose.disconnect();
}

runTest().catch(console.error);
