
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { PlusCircle, PlayCircle, Trophy, BarChart3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HomePage: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-20 px-4">
        <h1 className="text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
          Master Any Subject with <br />
          <span className="text-indigo-600">AI-Powered Quizzes</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
          Create, take, and analyze quizzes with adaptive difficulty and real-time insights. 
          The smarter way to learn and teach.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link 
            to="/register" 
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
          >
            Start for Free
          </Link>
          <Link 
            to="/login" 
            className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-slate-50 transition-all"
          >
            View Demo
          </Link>
        </div>
      </div>
    );
  }

  const isInstructor = user.role === UserRole.INSTRUCTOR;

  return (
    <div className="max-w-6xl mx-auto px-4">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900">
          Hello, {user.name}! 👋
        </h1>
        <p className="text-slate-500">
          {isInstructor 
            ? "Manage your quizzes and track student performance." 
            : "Continue your learning path and challenge yourself."}
        </p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isInstructor ? (
          <>
            <DashboardCard 
              title="Create New Quiz" 
              description="Use AI to generate questions or create them manually."
              icon={<PlusCircle className="text-indigo-600" />}
              link="/create"
              color="indigo"
            />
            <DashboardCard 
              title="My Quizzes" 
              description="Manage your existing assessments and view results."
              icon={<BarChart3 className="text-purple-600" />}
              link="/quizzes"
              color="purple"
            />
            <DashboardCard 
              title="Leaderboards" 
              description="View top performers across all your subjects."
              icon={<Trophy className="text-amber-600" />}
              link="/leaderboards"
              color="amber"
            />
          </>
        ) : (
          <>
            <DashboardCard 
              title="Take a Quiz" 
              description="Browse available quizzes and start learning."
              icon={<PlayCircle className="text-emerald-600" />}
              link="/browse"
              color="emerald"
            />
            <DashboardCard 
              title="My Progress" 
              description="See how you've improved over time."
              icon={<BarChart3 className="text-blue-600" />}
              link="/progress"
              color="blue"
            />
            <DashboardCard 
              title="Global Ranking" 
              description="See where you stand among all students."
              icon={<Trophy className="text-amber-600" />}
              link="/rankings"
              color="amber"
            />
          </>
        )}
      </div>
    </div>
  );
};

const DashboardCard: React.FC<{ 
  title: string; 
  description: string; 
  icon: React.ReactNode; 
  link: string;
  color: string;
}> = ({ title, description, icon, link, color }) => {
  return (
    <Link 
      to={link}
      className="group bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all"
    >
      <div className={`w-12 h-12 rounded-xl bg-${color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-800 mb-2 flex items-center justify-between">
        {title}
        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 translate-x-[-10px] group-hover:translate-x-0 transition-all" />
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed">
        {description}
      </p>
    </Link>
  );
};

export default HomePage;
