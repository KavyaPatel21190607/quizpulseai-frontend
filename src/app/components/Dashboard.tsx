import { TrendingUp, Award, Target, Flame, ArrowRight, Clock } from 'lucide-react';
import { StatCard, Card } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

export function Dashboard() {
  const recentQuizzes = [
    { id: 1, title: 'React Fundamentals', score: 85, date: '2 days ago', subject: 'Web Development' },
    { id: 2, title: 'JavaScript ES6+', score: 92, date: '5 days ago', subject: 'Programming' },
    { id: 3, title: 'Data Structures', score: 78, date: '1 week ago', subject: 'Computer Science' },
  ];

  const aiRecommended = [
    { id: 1, title: 'Advanced React Patterns', difficulty: 'Intermediate', questions: 15 },
    { id: 2, title: 'TypeScript Essentials', difficulty: 'Beginner', questions: 20 },
    { id: 3, title: 'Node.js Fundamentals', difficulty: 'Intermediate', questions: 12 },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Welcome back, Alex!</h1>
          <p className="text-gray-600 mt-1">Ready to continue your learning journey?</p>
        </div>
        <Button className="w-full sm:w-auto">
          <span className="flex items-center gap-2">
            <Flame size={20} />
            Generate New Quiz
          </span>
        </Button>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Total Quizzes"
          value="42"
          change="+5 this week"
          icon={<Award size={20} />}
        />
        <StatCard
          title="Average Score"
          value="85%"
          change="+3%"
          icon={<Target size={20} />}
        />
        <StatCard
          title="Skill Level"
          value="Intermediate"
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          title="Current Streak"
          value="12 days"
          change="+1 day"
          icon={<Flame size={20} />}
        />
      </div>

      {/* Charts - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Weekly Progress</h3>
          <div className="h-48 lg:h-64 flex items-end justify-between gap-2">
            {[65, 75, 80, 70, 85, 90, 88].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all duration-300 hover:from-indigo-700 hover:to-indigo-500"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-600">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Performance by Subject</h3>
          <div className="space-y-4">
            {[
              { subject: 'Programming', score: 92, color: 'bg-indigo-600' },
              { subject: 'Web Development', score: 85, color: 'bg-purple-600' },
              { subject: 'Computer Science', score: 78, color: 'bg-cyan-600' },
              { subject: 'Algorithms', score: 88, color: 'bg-green-600' },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium text-gray-700">{item.subject}</span>
                  <span className="text-gray-600">{item.score}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Quizzes - Responsive */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Recent Quizzes</h2>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentQuizzes.map((quiz) => (
            <Card key={quiz.id} hover>
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-900">{quiz.title}</h3>
                  <Badge variant={quiz.score >= 85 ? 'success' : 'warning'}>
                    {quiz.score}%
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-4">{quiz.subject}</p>
                <div className="flex items-center text-sm text-gray-500 mt-auto">
                  <Clock size={14} className="mr-1" />
                  {quiz.date}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Recommended - Horizontal Scroll on Mobile */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">AI Recommended for You</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible">
          {aiRecommended.map((quiz) => (
            <Card
              key={quiz.id}
              hover
              className="min-w-[280px] sm:min-w-[320px] lg:min-w-0 flex-shrink-0"
            >
              <div className="flex flex-col h-full">
                <Badge
                  variant={quiz.difficulty === 'Beginner' ? 'info' : 'warning'}
                  className="self-start mb-3"
                >
                  {quiz.difficulty}
                </Badge>
                <h3 className="font-bold text-gray-900 mb-2">{quiz.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{quiz.questions} questions</p>
                <Button variant="secondary" className="mt-auto">
                  <span className="flex items-center gap-2">
                    Start Quiz
                    <ArrowRight size={16} />
                  </span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
