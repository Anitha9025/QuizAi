import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, Clock, CheckCircle2 } from 'lucide-react';
import { getQuiz, submitQuiz } from '../api/quizzes';
import { Quiz } from '../types';
import { useTimer } from '../hooks/useTimer';

const TakeQuiz: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Quiz taking state
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [score, setScore] = useState(0);

    // Fetch quiz data
    useEffect(() => {
        const fetchQuiz = async () => {
            if (!id) return;
            try {
                const data = await getQuiz(id);
                setQuiz(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load quiz');
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuiz();
    }, [id]);

    // Define handleSubmit first so handleTimeExpire can use it
    const handleSubmit = useCallback(async () => {
        if (!quiz || isSubmitted || !id || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const result = await submitQuiz(id, answers);
            setScore(result.score);
            setIsSubmitted(true);
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to submit quiz. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    }, [quiz, isSubmitted, id, isSubmitting, answers]);

    // Handle timer expiration
    const handleTimeExpire = useCallback(() => {
        if (!isSubmitted && !isSubmitting) {
            alert("Time's up! Submitting your current answers automatically.");
            handleSubmit();
        }
    }, [isSubmitted, isSubmitting, handleSubmit]);

    const timeLimit = quiz?.timeLimit || 0;
    const { formattedTime, isRunning } = useTimer(
        isSubmitted ? 0 : timeLimit,
        handleTimeExpire
    );

    const handleSelectOption = (questionId: string, option: string) => {
        if (isSubmitted || isSubmitting) return;
        setAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !quiz) {
        return (
            <div className="text-center py-20">
                <p className="text-red-500 mb-4">{error || 'Quiz not found'}</p>
                <button onClick={() => navigate('/dashboard')} className="text-indigo-600 font-medium">
                    &larr; Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto py-8">
            <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-4 z-10">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{quiz.title}</h1>
                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold mt-2 border border-indigo-100">
                        {quiz.category}
                    </span>
                </div>

                <div className="flex items-center space-x-6">
                    {timeLimit > 0 && !isSubmitted && (
                        <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-mono text-lg font-bold border ${isRunning ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
                            <Clock className="w-5 h-5" />
                            <span>{formattedTime}</span>
                        </div>
                    )}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="text-slate-500 hover:text-slate-800 transition-colors"
                        title="Exit Quiz"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {isSubmitted && (
                <div className="bg-emerald-50 border border-emerald-200 p-8 rounded-2xl text-center mb-8 shadow-sm">
                    <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                    <h2 className="text-3xl font-extrabold text-emerald-900 mb-2">Quiz Complete!</h2>
                    <p className="text-xl text-emerald-700 font-semibold mb-6">
                        You scored {score} out of {quiz.questions.length} ({(score / quiz.questions.length * 100).toFixed(0)}%)
                    </p>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition"
                    >
                        Return to Dashboard
                    </button>
                </div>
            )}

            <div className="space-y-8">
                {quiz.questions.map((q, index) => {
                    const qId = q._id || q.text;
                    const selectedAnswer = answers[qId];
                    const isCorrect = selectedAnswer === q.correctAnswer;

                    return (
                        <div key={qId} className={`bg-white p-6 rounded-2xl border shadow-sm ${isSubmitted ? (isCorrect ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-red-300 ring-2 ring-red-100') : 'border-slate-200'}`}>
                            <h3 className="text-lg font-semibold text-slate-900 mb-4 tracking-tight">
                                <span className="text-slate-400 mr-2">{index + 1}.</span>
                                {q.text}
                            </h3>

                            <div className="space-y-3">
                                {q.options.map((opt, optIndex) => {
                                    const isSelected = selectedAnswer === opt;
                                    const isActuallyCorrect = q.correctAnswer === opt;

                                    let optionStyle = "border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 cursor-pointer";

                                    if (isSubmitted) {
                                        optionStyle = "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed";
                                        if (isActuallyCorrect) {
                                            optionStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-bold border-2";
                                        } else if (isSelected && !isActuallyCorrect) {
                                            optionStyle = "border-red-500 bg-red-50 text-red-900 font-bold border-2";
                                        }
                                    } else if (isSelected) {
                                        optionStyle = "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500 font-semibold";
                                    }

                                    return (
                                        <button
                                            key={optIndex}
                                            disabled={isSubmitted}
                                            onClick={() => handleSelectOption(qId, opt)}
                                            className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${optionStyle}`}
                                        >
                                            <div className="flex items-center">
                                                <div className={`w-5 h-5 rounded-full border flex flex-shrink-0 items-center justify-center mr-3 ${isSelected ? 'border-indigo-500 border-4' : 'border-slate-300'}`}>
                                                </div>
                                                <span>{opt}</span>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {!isSubmitted && (
                <div className="mt-10 mb-20 text-center">
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || Object.keys(answers).length < quiz.questions.length}
                        className="bg-indigo-600 text-white px-10 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed w-full md:w-auto flex items-center justify-center mx-auto"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Submitting...
                            </>
                        ) : 'Submit Quiz'}
                    </button>
                    {Object.keys(answers).length < quiz.questions.length && !isSubmitting && (
                        <p className="text-amber-600 text-sm mt-3 font-medium">Please answer all questions before submitting.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default TakeQuiz;
