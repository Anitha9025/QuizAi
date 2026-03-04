import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, BrainCircuit, Pencil, Trash2, PlayCircle, Clock, Key, BarChart2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getQuizzes, deleteQuiz, joinQuizByPin } from '../api/quizzes';
import { Quiz } from '../types';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [joinPin, setJoinPin] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [joinError, setJoinError] = useState('');

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const data = await getQuizzes();
                setQuizzes(data);
            } catch (error) {
                console.error("Failed to fetch quizzes", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchQuizzes();
    }, []);

    const handleDeleteQuiz = async (quizId: string, quizTitle: string) => {
        if (window.confirm(`Are you sure you want to delete the quiz "${quizTitle}"? This cannot be undone.`)) {
            try {
                await deleteQuiz(quizId);
                // Remove the quiz from local state so UI updates immediately
                setQuizzes(prevQuizzes => prevQuizzes.filter(q => q._id !== quizId));
            } catch (error) {
                console.error("Failed to delete quiz:", error);
                alert("An error occurred while deleting the quiz.");
            }
        }
    };

    const handleJoinQuiz = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!joinPin) return;
        setIsJoining(true);
        setJoinError('');
        try {
            const quiz = await joinQuizByPin(joinPin);
            navigate(`/take-quiz/${quiz._id}`);
        } catch (err: any) {
            setJoinError(err.response?.data?.message || 'Invalid PIN or error joining quiz');
        } finally {
            setIsJoining(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto py-8">
            <div className="flex justify-between items-end mb-10">
                <div>
                    <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                        Welcome back, {user?.name || 'Instructor'}!
                    </h1>
                    <p className="text-lg text-slate-500 mt-2">Manage your quizzes and track student progress.</p>
                </div>
                {user?.role === 'Instructor' && (
                    <button
                        onClick={() => navigate('/create-quiz')}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] flex items-center"
                    >
                        <PlusCircle className="w-5 h-5 mr-2" />
                        Create New Quiz
                    </button>
                )}
            </div>

            {user?.role === 'Student' && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-10">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <Key className="w-5 h-5 mr-2 text-indigo-500" />
                        Join a Quiz
                    </h2>
                    <form onSubmit={handleJoinQuiz} className="flex flex-col sm:flex-row gap-4">
                        <input
                            type="text"
                            placeholder="Enter 6-digit Quiz PIN"
                            value={joinPin}
                            onChange={(e) => setJoinPin(e.target.value.toUpperCase())}
                            maxLength={6}
                            className="flex-grow px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-center text-lg tracking-widest"
                        />
                        <button
                            type="submit"
                            disabled={isJoining || joinPin.length < 6}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                        >
                            {isJoining ? 'Joining...' : 'Enter Quiz'}
                        </button>
                    </form>
                    {joinError && <p className="text-red-500 text-sm mt-3 font-medium">{joinError}</p>}
                </div>
            )}

            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <BrainCircuit className="w-6 h-6 mr-2 text-indigo-500" />
                All Available Quizzes
            </h2>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="animate-pulse bg-slate-100 h-48 rounded-2xl border border-slate-200"></div>
                    ))}
                </div>
            ) : quizzes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {quizzes.map((quiz) => (
                        <div key={quiz._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                            {user?.role === 'Instructor' && (
                                <div className="absolute top-3 right-3 flex space-x-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => navigate(`/edit-quiz/${quiz._id}`)}
                                        className="p-1.5 text-slate-400 hover:text-indigo-600 transition-colors bg-white rounded-lg hover:bg-slate-50 border border-slate-200"
                                        title="Edit Quiz"
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteQuiz(quiz._id, quiz.title)}
                                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors bg-white rounded-lg hover:bg-red-50 border border-slate-200 hover:border-red-200"
                                        title="Delete Quiz"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            {/* PIN Banner - always visible, no overlap */}
                            {user?.role === 'Instructor' && quiz.quizPin && (
                                <div className="flex items-center justify-between bg-indigo-600 text-white px-4 py-2.5 rounded-xl mb-4">
                                    <div className="flex items-center space-x-2">
                                        <Key className="w-4 h-4 opacity-80" />
                                        <span className="text-xs font-bold uppercase tracking-widest opacity-80">Quiz PIN</span>
                                    </div>
                                    <span className="font-mono font-black text-xl tracking-widest">{quiz.quizPin}</span>
                                </div>
                            )}

                            <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-semibold border border-indigo-100 mb-3">
                                {quiz.category}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 pr-20">{quiz.title}</h3>
                            <div className="flex items-center space-x-4 mb-4 text-slate-500 text-sm">
                                <span>{quiz.questions.length} questions</span>
                                {quiz.timeLimit ? (
                                    <span className="flex items-center text-orange-600 font-medium">
                                        <Clock className="w-4 h-4 mr-1" />
                                        {quiz.timeLimit} mins
                                    </span>
                                ) : (
                                    <span className="text-slate-400">No time limit</span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-2">
                                <button
                                    onClick={() => navigate(`/take-quiz/${quiz._id}`)}
                                    className="py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors flex items-center justify-center border border-indigo-200"
                                >
                                    <PlayCircle className="w-5 h-5 mr-2" />
                                    {user?.role === 'Instructor' ? 'Preview' : 'Attend'}
                                </button>
                                {user?.role === 'Instructor' && (
                                    <button
                                        onClick={() => navigate(`/quiz-results/${quiz._id}`)}
                                        className="py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl transition-colors flex items-center justify-center border border-slate-200"
                                    >
                                        <BarChart2 className="w-5 h-5 mr-2 text-indigo-500" />
                                        Results
                                    </button>
                                )}
                            </div>

                            <div className="pt-4 border-t border-slate-100 text-sm text-slate-400 mt-4">
                                Created by {quiz.creator?.name || 'Unknown'}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center max-w-2xl mx-auto mt-10">
                    <BrainCircuit className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-700 mb-2">No Quizzes Found</h3>
                    <p className="text-slate-500 mb-6">You haven't created any quizzes yet. Get started by clicking the button below.</p>
                    <button
                        onClick={() => navigate('/create-quiz')}
                        className="text-indigo-600 font-medium hover:text-indigo-700"
                    >
                        Create your first quiz &rarr;
                    </button>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
