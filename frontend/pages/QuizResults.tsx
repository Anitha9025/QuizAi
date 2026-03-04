import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Users, Calendar, Award } from 'lucide-react';
import { getQuiz, getQuizResults } from '../api/quizzes';
import { Quiz, Result } from '../types';

const QuizResults: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [results, setResults] = useState<Result[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const [quizData, resultsData] = await Promise.all([
                    getQuiz(id),
                    getQuizResults(id)
                ]);
                setQuiz(quizData);
                setResults(resultsData);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load results');
            } finally {
                setIsLoading(false);
            }
        };
        fetchDetails();
    }, [id]);

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
                <p className="text-red-500 mb-4">{error || 'Data not found'}</p>
                <button onClick={() => navigate('/dashboard')} className="text-indigo-600 font-medium">
                    &larr; Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-8">
            <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors mb-6 font-medium"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </button>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm mb-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">{quiz.title}</h1>
                    <div className="flex items-center space-x-4 text-slate-500">
                        <span className="flex items-center"><Users className="w-4 h-4 mr-1.5" /> {results.length} Attempts</span>
                        <span className="flex items-center"><Award className="w-4 h-4 mr-1.5" /> Avg: {results.length > 0 ? (results.reduce((acc, r) => acc + r.score, 0) / results.length).toFixed(1) : 0} / {quiz.questions.length}</span>
                    </div>
                </div>
                <div className="bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100 text-center">
                    <span className="block text-[10px] uppercase tracking-widest text-indigo-400 font-bold mb-1">Quiz PIN</span>
                    <span className="text-2xl font-mono font-black text-indigo-700">{quiz.quizPin}</span>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="text-lg font-bold text-slate-800">Student Results</h2>
                </div>

                {results.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                    <th className="px-8 py-4">Student</th>
                                    <th className="px-8 py-4">Score</th>
                                    <th className="px-8 py-4">Percentage</th>
                                    <th className="px-8 py-4 text-right">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {results.map((result) => {
                                    const student = typeof result.student === 'object' ? result.student : { name: 'Unknown', email: '' };
                                    const percentage = (result.score / result.total) * 100;

                                    return (
                                        <tr key={result._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-8 py-5">
                                                <div className="font-semibold text-slate-900">{student.name}</div>
                                                <div className="text-xs text-slate-400">{student.email}</div>
                                            </td>
                                            <td className="px-8 py-5 font-mono font-bold text-slate-700">
                                                {result.score} / {result.total}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center">
                                                    <div className="flex-grow w-24 bg-slate-100 h-2 rounded-full mr-3 overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${percentage >= 70 ? 'bg-emerald-500' : percentage >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                            style={{ width: `${percentage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className={`text-sm font-bold ${percentage >= 70 ? 'text-emerald-600' : percentage >= 40 ? 'text-amber-600' : 'text-red-600'}`}>
                                                        {percentage.toFixed(0)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-right text-sm text-slate-400 flex items-center justify-end">
                                                <Calendar className="w-3.5 h-3.5 mr-1.5 opacity-40" />
                                                {new Date(result.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="p-12 text-center text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-10" />
                        <p>No students have taken this quiz yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizResults;
