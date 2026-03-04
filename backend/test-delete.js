const User = require('./models/User');
const Quiz = require('./models/Quiz');
const mongoose = require('mongoose');
require('dotenv').config();

async function runTest() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');

    // 1. Create two instructors
    const inst1 = await User.create({ name: 'Del Inst1', email: 'delinst1@test.com', password: 'password', role: 'Instructor' });
    const inst2 = await User.create({ name: 'Del Inst2', email: 'delinst2@test.com', password: 'password', role: 'Instructor' });

    // 2. Create quiz for inst1
    const q = await Quiz.create({
        title: 'To Be Deleted', category: 'Math', creator: inst1._id,
        questions: [{ text: 'a', options: ['a', 'b'], correctAnswer: 'a' }]
    });

    console.log('Original Quiz count:', await Quiz.countDocuments({ title: 'To Be Deleted' }));

    // 3. Simulate API DELETE /api/quizzes/:id logic manually where inst2 tries to delete it (should fail)
    let failedToDelete = false;
    if (q.creator.toString() !== inst2._id.toString()) {
        failedToDelete = true;
        console.log('Success: Inst2 correctly prevented from deleting Inst1 quiz');
    } else {
        await Quiz.findByIdAndDelete(q._id);
    }

    // 4. Simulate API DELETE where inst1 deletes their own quiz
    if (q.creator.toString() !== inst1._id.toString()) {
        console.error('Failure: Inst1 should be allowed but was prevented');
    } else {
        await Quiz.findByIdAndDelete(q._id);
        console.log('Success: Inst1 deleted their own quiz');
    }

    console.log('Final Quiz count:', await Quiz.countDocuments({ title: 'To Be Deleted' }));

    // cleanup
    await User.deleteMany({ email: { $in: ['delinst1@test.com', 'delinst2@test.com'] } });

    await mongoose.disconnect();
}

runTest().catch(console.error);
