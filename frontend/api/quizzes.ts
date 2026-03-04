import api from './axios';

export interface GenerateQuizPayload {
    topic: string;
    numQuestions?: number;
}

export interface QuizPayload {
    title: string;
    category: string;
    timeLimit?: number;
    questions: {
        text: string;
        options: string[];
        correctAnswer: string;
    }[];
}

export const generateQuizFromAI = async (payload: GenerateQuizPayload) => {
    const response = await api.post('/quizzes/generate', payload);
    return response.data;
};

export const createQuiz = async (payload: QuizPayload) => {
    const response = await api.post('/quizzes', payload);
    return response.data;
};

export const getQuizzes = async () => {
    const response = await api.get('/quizzes');
    return response.data;
};

export const getQuiz = async (id: string) => {
    const response = await api.get(`/quizzes/${id}`);
    return response.data;
};

export const updateQuiz = async (id: string, payload: QuizPayload) => {
    const response = await api.put(`/quizzes/${id}`, payload);
    return response.data;
};

export const deleteQuiz = async (id: string) => {
    const response = await api.delete(`/quizzes/${id}`);
    return response.data;
};

export const joinQuizByPin = async (pin: string) => {
    const response = await api.get(`/quizzes/join/${pin}`);
    return response.data;
};

export const submitQuiz = async (id: string, answers: Record<string, string>) => {
    const response = await api.post(`/quizzes/${id}/submit`, { answers });
    return response.data;
};

export const getQuizResults = async (id: string) => {
    const response = await api.get(`/quizzes/${id}/results`);
    return response.data;
};
