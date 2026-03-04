/**
 * Cleanup Script: Remove all Results where the student is also the quiz creator.
 * Run this ONCE to clean up instructor preview entries from the database.
 * Usage: node scripts/cleanup-instructor-results.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const quizSchema = new mongoose.Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Result = mongoose.model('Result', resultSchema);
const Quiz = mongoose.model('Quiz', quizSchema);

async function cleanupInstructorResults() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected!\n');

        // Find all results and check if the student is the quiz creator
        const results = await Result.find({}).populate('quiz');
        let deleteCount = 0;

        for (const result of results) {
            if (result.quiz && result.quiz.creator.toString() === result.student.toString()) {
                await Result.findByIdAndDelete(result._id);
                deleteCount++;
                console.log(`Deleted result ${result._id} (instructor preview)`);
            }
        }

        console.log(`\n✅ Done! Removed ${deleteCount} instructor preview result(s).`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

cleanupInstructorResults();
