import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import QuizForm from '../components/Quiz/QuizForm';
import { getQuiz, updateQuiz, QuizPayload } from '../api/quizzes';

const EditQuiz: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [quizData, setQuizData] = useState<QuizPayload | null>(null);

    useEffect(() => {
        const fetchQuiz = async () => {
            if (!id) return;
            try {
                const data = await getQuiz(id);
                setQuizData({
                    title: data.title,
                    category: data.category,
                    questions: data.questions,
                });
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load quiz. It may not exist.');
            } finally {
                setIsFetching(false);
            }
        };
        fetchQuiz();
    }, [id]);

    const handleSubmit = async (quizPayload: QuizPayload) => {
        if (!id) return;
        setIsLoading(true);
        setError(null);
        try {
            await updateQuiz(id, quizPayload);
            // On success, redirect to dashboard
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update quiz. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isFetching) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

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
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Edit Quiz</h1>
                    <p className="text-slate-500 mt-1">Make changes to your quiz and save them.</p>
                </div>
            </div>

            {error && (
                <div className="mb-6 bg-red-50 text-red-600 p-4 rounded-xl border border-red-100 flex items-center">
                    <span className="font-medium">{error}</span>
                </div>
            )}

            {!error && quizData && (
                <QuizForm onSubmit={handleSubmit} isLoading={isLoading} initialData={quizData} />
            )}
        </div>
    );
};

export default EditQuiz;
