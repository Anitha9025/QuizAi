import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import QuizForm from '../components/Quiz/QuizForm';
import { createQuiz, QuizPayload } from '../api/quizzes';

const CreateQuiz: React.FC = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (quizPayload: QuizPayload) => {
        setIsLoading(true);
        setError(null);
        try {
            await createQuiz(quizPayload);
            // On success, redirect to dashboard
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create quiz. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="mb-8 flex items-center space-x-4">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create a New Quiz</h1>
                    <p className="text-slate-500 mt-1">Design your own quiz manually or use AI to generate questions in seconds.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center">
                    <span className="font-medium">{error}</span>
                </div>
            )}

            <QuizForm onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
    );
};

export default CreateQuiz;
