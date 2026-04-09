import { TrendingUp, Target, Lightbulb, AlertCircle, Calendar } from 'lucide-react';
import { Card } from './Card';
import { Badge } from './Badge';

export function AIProgress() {
  const skillLevel = 72; // Percentage

  return (
    <div className="max-w-6xl mx-auto space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          AI Progress Predictor
        </h1>
        <p className="text-gray-600">
          Track your learning journey with AI-powered insights
        </p>
      </div>

      {/* Main Grid - Responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Skill Meter - Full Width on Mobile */}
        <Card className="lg:col-span-1">
          <h3 className="font-bold text-gray-900 mb-6">Current Skill Level</h3>
          <div className="flex flex-col items-center">
            <div className="relative w-48 h-48 mb-6">
              {/* Circular Progress */}
              <svg className="transform -rotate-90 w-48 h-48">
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-gray-100"
                />
                <circle
                  cx="96"
                  cy="96"
                  r="88"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 88}`}
                  strokeDashoffset={`${2 * Math.PI * 88 * (1 - skillLevel / 100)}`}
                  className="text-indigo-600 transition-all duration-1000"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-gray-900">{skillLevel}%</div>
                <div className="text-sm text-gray-600">Intermediate</div>
              </div>
            </div>
            <Badge variant="info" className="text-sm">
              Intermediate Level
            </Badge>
          </div>
        </Card>

        {/* Performance Trend - Spans 2 Columns on Desktop */}
        <Card className="lg:col-span-2">
          <h3 className="font-bold text-gray-900 mb-6">Performance Trend</h3>
          <div className="h-48 lg:h-56 flex items-end justify-between gap-1 lg:gap-2">
            {[45, 52, 48, 58, 65, 62, 68, 72, 70, 75, 72, 78].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all duration-300 hover:from-indigo-700 hover:to-indigo-500"
                  style={{ height: `${height}%` }}
                />
                {(i % 3 === 0 || i === 11) && (
                  <span className="text-xs text-gray-600 hidden sm:block">
                    {['Jan', 'Feb', 'Mar', 'Apr'][Math.floor(i / 3)]}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Current</div>
              <div className="text-xl font-bold text-gray-900">72%</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Growth</div>
              <div className="text-xl font-bold text-green-600">+27%</div>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <div className="text-xs text-gray-600 mb-1">Target</div>
              <div className="text-xl font-bold text-indigo-600">85%</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Insights Grid - Responsive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
              <Target size={20} className="text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900">Your Strengths</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">React Fundamentals</Badge>
            <Badge variant="success">JavaScript ES6+</Badge>
            <Badge variant="success">State Management</Badge>
            <Badge variant="success">Component Design</Badge>
            <Badge variant="success">Performance</Badge>
          </div>
        </Card>

        {/* Areas to Improve */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
              <AlertCircle size={20} className="text-yellow-600" />
            </div>
            <h3 className="font-bold text-gray-900">Areas to Improve</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="warning">Advanced Hooks</Badge>
            <Badge variant="warning">Testing</Badge>
            <Badge variant="warning">TypeScript</Badge>
            <Badge variant="warning">Server Components</Badge>
          </div>
        </Card>
      </div>

      {/* Prediction Card - Full Width */}
      <Card className="bg-gradient-to-br from-indigo-600 to-purple-600 text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Calendar size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-xl lg:text-2xl font-bold mb-2">AI Prediction</h3>
            <p className="text-indigo-100 text-sm lg:text-base">
              Based on your current progress and learning pattern, you will reach{' '}
              <span className="font-bold text-white">Advanced level</span> in approximately{' '}
              <span className="font-bold text-white">45 days</span>.
            </p>
          </div>
          <div className="flex items-center gap-2 text-indigo-100 text-sm self-start lg:self-auto">
            <TrendingUp size={20} />
            <span>85% confidence</span>
          </div>
        </div>
      </Card>

      {/* Personalized Recommendations - Responsive Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Personalized Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: 'Master Advanced Hooks',
              description: 'Focus on useCallback and useMemo',
              priority: 'high',
              time: '2 weeks',
            },
            {
              title: 'Practice Testing',
              description: 'Learn Jest and React Testing Library',
              priority: 'medium',
              time: '3 weeks',
            },
            {
              title: 'TypeScript Fundamentals',
              description: 'Add type safety to your projects',
              priority: 'high',
              time: '2 weeks',
            },
          ].map((rec, i) => (
            <Card key={i} hover>
              <div className="flex items-start justify-between mb-3">
                <Lightbulb size={20} className="text-indigo-600 flex-shrink-0" />
                <Badge variant={rec.priority === 'high' ? 'error' : 'warning'}>
                  {rec.priority}
                </Badge>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">{rec.title}</h4>
              <p className="text-sm text-gray-600 mb-4">{rec.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar size={14} className="mr-1" />
                {rec.time}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
