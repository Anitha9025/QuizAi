import React, { useState } from 'react';
import { Sparkles, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { generateQuizFromAI, QuizPayload } from '../../api/quizzes';
import { Question } from '../../types';

interface QuizFormProps {
    onSubmit: (quiz: QuizPayload) => Promise<void>;
    isLoading: boolean;
    initialData?: QuizPayload;
}

const QuizForm: React.FC<QuizFormProps> = ({ onSubmit, isLoading, initialData }) => {
    const [title, setTitle] = useState(initialData?.title || '');
    const [category, setCategory] = useState(initialData?.category || '');
    const [timeLimit, setTimeLimit] = useState(initialData?.timeLimit || 0);
    const [questions, setQuestions] = useState<Question[]>(initialData?.questions || []);

    const [aiTopic, setAiTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiError, setAiError] = useState('');

    React.useEffect(() => {
        if (initialData) {
            setTitle(initialData.title);
            setCategory(initialData.category);
            setTimeLimit(initialData.timeLimit || 0);
            setQuestions(initialData.questions);
        }
    }, [initialData]);

    const handleGenerateAI = async () => {
        if (!aiTopic) return;
        setIsGenerating(true);
        setAiError('');
        try {
            const generatedQuestions = await generateQuizFromAI({ topic: aiTopic, numQuestions: 5 });
            setQuestions([...questions, ...generatedQuestions]);
            setAiTopic('');
        } catch (err: any) {
            setAiError(err.response?.data?.message || 'Failed to generate questions. Try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const addEmptyQuestion = () => {
        setQuestions([
            ...questions,
            { text: '', options: ['', '', '', ''], correctAnswer: '' }
        ]);
    };

    const removeQuestion = (index: number) => {
        const newQuestions = [...questions];
        newQuestions.splice(index, 1);
        setQuestions(newQuestions);
    };

    const updateQuestion = (index: number, field: keyof Question, value: any) => {
        const newQuestions = [...questions];
        (newQuestions[index] as any)[field] = value;
        setQuestions(newQuestions);
    };

    const updateOption = (qIndex: number, oIndex: number, value: string) => {
        const newQuestions = [...questions];
        newQuestions[qIndex].options[oIndex] = value;
        // auto-update correct answer if it matched the old option exactly, to prevent disconnects
        setQuestions(newQuestions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (questions.length === 0) {
            alert("Please add at least one question.");
            return;
        }

        // Validate that correctAnswer equals one of the options
        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.text || q.options.some(opt => !opt) || !q.correctAnswer) {
                alert(`Please fill all fields in Question ${i + 1}`);
                return;
            }
            if (!q.options.includes(q.correctAnswer)) {
                alert(`Correct answer for Question ${i + 1} must exactly match one of the options.`);
                return;
            }
        }

        await onSubmit({ title, category, timeLimit, questions });
    };

    return (
        <div className="space-y-8">
            {/* AI Header Section */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm">
                <h3 className="text-lg font-semibold text-indigo-900 flex items-center mb-4">
                    <Sparkles className="w-5 h-5 mr-2 text-indigo-500" />
                    Generate with AI
                </h3>
                <div className="flex space-x-3">
                    <input
                        type="text"
                        placeholder="E.g., Basics of Thermodynamics"
                        value={aiTopic}
                        onChange={(e) => setAiTopic(e.target.value)}
                        className="flex-grow px-4 py-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        disabled={isGenerating}
                    />
                    <button
                        onClick={handleGenerateAI}
                        disabled={isGenerating || !aiTopic}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center"
                    >
                        {isGenerating ? 'Generating...' : 'Generate Questions'}
                    </button>
                </div>
                {aiError && <p className="text-red-500 text-sm mt-2">{aiError}</p>}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quiz Meta */}
                <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Quiz Title</label>
                        <input
                            required
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Enter quiz title"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                        <input
                            required
                            type="text"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="e.g., Physics, History, Math"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Time Limit (minutes)</label>
                        <input
                            type="number"
                            min="0"
                            value={timeLimit}
                            onChange={(e) => setTimeLimit(parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="0 for no limit"
                        />
                        <p className="text-xs text-slate-500 mt-1">Set to 0 if you don't want a time limit.</p>
                    </div>
                </div>

                {/* Questions Editor */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center justify-between">
                        Questions ({questions.length})
                        <button
                            type="button"
                            onClick={addEmptyQuestion}
                            className="text-sm px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 flex items-center font-medium"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Add Question
                        </button>
                    </h3>

                    {questions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white border rounded-xl shadow-sm p-6 relative">
                            <button
                                type="button"
                                onClick={() => removeQuestion(qIndex)}
                                className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors"
                                title="Remove Question"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>

                            <div className="mb-4 pr-8">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Question {qIndex + 1}</label>
                                <textarea
                                    required
                                    value={q.text}
                                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    rows={2}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {q.options.map((opt, oIndex) => (
                                    <div key={oIndex} className="flex items-center space-x-2">
                                        <span className="text-sm font-medium text-slate-400 w-4">{String.fromCharCode(65 + oIndex)}.</span>
                                        <input
                                            required
                                            type="text"
                                            value={opt}
                                            onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                            className="flex-grow px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder={`Option ${oIndex + 1}`}
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t">
                                <label className="block text-sm font-medium text-emerald-700 mb-1 flex items-center">
                                    <CheckCircle2 className="w-4 h-4 mr-1" /> Correct Answer
                                </label>
                                <select
                                    required
                                    value={q.correctAnswer}
                                    onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                                    className="w-full border-emerald-200 rounded-lg px-4 py-2 focus:ring-emerald-500 focus:border-emerald-500 bg-emerald-50"
                                >
                                    <option value="" disabled>Select correct option...</option>
                                    {q.options.map((opt, oIndex) => (
                                        opt.trim() !== '' && <option key={oIndex} value={opt}>{opt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    ))}

                    {questions.length === 0 && (
                        <div className="text-center py-12 bg-slate-50 border-2 border-dashed rounded-xl border-slate-200">
                            <p className="text-slate-500">No questions yet. Add one manually or use AI to generate some!</p>
                        </div>
                    )}
                </div>

                <div className="pt-6">
                    <button
                        type="submit"
                        disabled={isLoading || questions.length === 0}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl font-semibold text-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-200"
                    >
                        {isLoading ? 'Saving Quiz...' : 'Save Quiz'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default QuizForm;
