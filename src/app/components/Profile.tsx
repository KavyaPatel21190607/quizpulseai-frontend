import { Mail, MapPin, Calendar, Edit, Award, TrendingUp, Target } from 'lucide-react';
import { Card } from './Card';
import { Button } from './Button';
import { Input } from './Input';
import { Badge } from './Badge';

export function Profile() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 lg:space-y-8">
      {/* Profile Header - Responsive */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-r from-indigo-600 to-purple-600" />
        <div className="relative pt-20 lg:pt-24">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 lg:w-32 lg:h-32 rounded-full bg-white p-2">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-3xl lg:text-4xl font-bold">
                  AJ
                </div>
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 lg:w-10 lg:h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors">
                <Edit size={16} />
              </button>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Alex Johnson</h1>
              <p className="text-gray-600 mb-2">Intermediate Learner</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Mail size={16} />
                  alex.johnson@email.com
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={16} />
                  San Francisco, CA
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={16} />
                  Joined March 2025
                </span>
              </div>
            </div>
            <Button variant="secondary" className="w-full sm:w-auto">
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* Stats Summary - Responsive Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Award, label: 'Total Quizzes', value: '42', color: 'text-indigo-600' },
          { icon: TrendingUp, label: 'Avg Score', value: '85%', color: 'text-green-600' },
          { icon: Target, label: 'Completed', value: '156', color: 'text-purple-600' },
          { icon: Award, label: 'Achievements', value: '12', color: 'text-yellow-600' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card key={i}>
              <Icon size={24} className={`${stat.color} mb-3`} />
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className="text-2xl lg:text-3xl font-bold text-gray-900">{stat.value}</div>
            </Card>
          );
        })}
      </div>

      {/* Two Column Layout - Stack on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Edit Information - 2/3 Width on Desktop */}
        <Card className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-gray-900">Personal Information</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name" defaultValue="Alex" />
            <Input label="Last Name" defaultValue="Johnson" />
            <Input label="Email" type="email" defaultValue="alex.johnson@email.com" className="sm:col-span-2" />
            <Input label="Phone" type="tel" placeholder="+1 (555) 000-0000" />
            <Input label="Location" defaultValue="San Francisco, CA" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Bio</label>
            <textarea
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors resize-none"
              rows={4}
              placeholder="Tell us about yourself..."
              defaultValue="Passionate about web development and continuously learning new technologies."
            />
          </div>
          <Button className="w-full sm:w-auto">Save Changes</Button>
        </Card>

        {/* Achievements - 1/3 Width on Desktop */}
        <Card className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
          <div className="space-y-3">
            {[
              { title: 'First Quiz', description: 'Completed your first quiz', color: 'bg-blue-100' },
              { title: '10 Day Streak', description: 'Studied for 10 days in a row', color: 'bg-orange-100' },
              { title: 'Perfect Score', description: 'Got 100% on a quiz', color: 'bg-green-100' },
              { title: 'Quick Learner', description: 'Completed 5 quizzes in one day', color: 'bg-purple-100' },
            ].map((achievement, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className={`w-12 h-12 ${achievement.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <Award size={24} className="text-gray-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm">{achievement.title}</h4>
                  <p className="text-xs text-gray-600">{achievement.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Activity Timeline - Full Width */}
      <Card>
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Completed React Fundamentals quiz', score: '85%', time: '2 hours ago', type: 'success' },
            { action: 'Started learning TypeScript', time: '1 day ago', type: 'info' },
            { action: 'Achieved 10-day streak', time: '2 days ago', type: 'success' },
            { action: 'Joined study group "Web Dev Masters"', time: '3 days ago', type: 'info' },
            { action: 'Completed JavaScript ES6+ quiz', score: '92%', time: '5 days ago', type: 'success' },
          ].map((activity, i) => (
            <div key={i} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
              <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                activity.type === 'success' ? 'bg-green-500' : 'bg-blue-500'
              }`} />
              <div className="flex-1 min-w-0">
                <p className="text-gray-900">
                  {activity.action}
                  {activity.score && (
                    <Badge variant="success" className="ml-2">
                      {activity.score}
                    </Badge>
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-1">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
