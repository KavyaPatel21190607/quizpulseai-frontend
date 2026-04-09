import { Sparkles, Zap, Plus, Minus } from 'lucide-react';
import { useState } from 'react';
import { Input, Select } from './Input';
import { Button } from './Button';
import { Card } from './Card';

export function QuizGenerator() {
  const [numQuestions, setNumQuestions] = useState(10);
  const [difficulty, setDifficulty] = useState(50);
  const [questionTypes, setQuestionTypes] = useState({
    mcq: true,
    trueFalse: false,
    shortAnswer: false,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="text-center lg:text-left">
        <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
          AI Quiz Generator
        </h1>
        <p className="text-gray-600">
          Create personalized quizzes powered by AI in seconds
        </p>
      </div>

      {/* Generator Form */}
      <Card className="space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Sparkles size={24} className="text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Configure Your Quiz</h2>
            <p className="text-sm text-gray-600">Customize every aspect</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Topic Input */}
          <Input
            label="Topic"
            placeholder="e.g., React Hooks, Machine Learning, World History..."
            className="text-base lg:text-lg"
          />

          {/* Subject Dropdown - Full Width on Mobile */}
          <Select
            label="Subject Category"
            options={[
              { value: 'programming', label: 'Programming' },
              { value: 'web-dev', label: 'Web Development' },
              { value: 'data-science', label: 'Data Science' },
              { value: 'computer-science', label: 'Computer Science' },
              { value: 'mathematics', label: 'Mathematics' },
              { value: 'other', label: 'Other' },
            ]}
          />

          {/* Difficulty Slider */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Difficulty Level
            </label>
            <div className="space-y-3">
              <input
                type="range"
                min="0"
                max="100"
                value={difficulty}
                onChange={(e) => setDifficulty(Number(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-indigo-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md"
              />
              <div className="flex justify-between text-sm">
                <span className={difficulty < 33 ? 'text-green-600 font-medium' : 'text-gray-500'}>
                  Easy
                </span>
                <span className={difficulty >= 33 && difficulty < 66 ? 'text-yellow-600 font-medium' : 'text-gray-500'}>
                  Medium
                </span>
                <span className={difficulty >= 66 ? 'text-red-600 font-medium' : 'text-gray-500'}>
                  Hard
                </span>
              </div>
            </div>
          </div>

          {/* Question Types - Responsive Grid */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Question Types
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { key: 'mcq', label: 'Multiple Choice' },
                { key: 'trueFalse', label: 'True/False' },
                { key: 'shortAnswer', label: 'Short Answer' },
              ].map((type) => (
                <label
                  key={type.key}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    questionTypes[type.key as keyof typeof questionTypes]
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={questionTypes[type.key as keyof typeof questionTypes]}
                    onChange={(e) =>
                      setQuestionTypes({
                        ...questionTypes,
                        [type.key]: e.target.checked,
                      })
                    }
                    className="w-5 h-5 text-indigo-600 rounded"
                  />
                  <span className="font-medium text-gray-900 text-sm lg:text-base">
                    {type.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Number of Questions - Responsive */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Number of Questions
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setNumQuestions(Math.max(1, numQuestions - 1))}
                className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <Minus size={20} />
              </button>
              <div className="flex-1 text-center">
                <div className="text-3xl lg:text-4xl font-bold text-gray-900">
                  {numQuestions}
                </div>
                <div className="text-sm text-gray-600">questions</div>
              </div>
              <button
                onClick={() => setNumQuestions(Math.min(50, numQuestions + 1))}
                className="w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-xl border-2 border-gray-200 hover:border-indigo-600 hover:bg-indigo-50 transition-all"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Generate Button - Full Width on Mobile */}
        <div className="pt-4 border-t border-gray-100">
          <Button className="w-full py-4 text-base lg:text-lg">
            <span className="flex items-center justify-center gap-2">
              <Zap size={20} />
              Generate Quiz with AI
            </span>
          </Button>
        </div>
      </Card>

      {/* Quick Templates - Horizontal Scroll on Mobile */}
      <div>
        <h3 className="font-bold text-gray-900 mb-4">Quick Templates</h3>
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-3 lg:overflow-visible">
          {[
            { title: 'Quick 5-Minute Quiz', questions: 5, time: '5 min' },
            { title: 'Standard Practice', questions: 15, time: '15 min' },
            { title: 'Deep Dive Challenge', questions: 30, time: '30 min' },
          ].map((template, i) => (
            <Card
              key={i}
              hover
              className="min-w-[260px] sm:min-w-[280px] lg:min-w-0 flex-shrink-0"
            >
              <h4 className="font-bold text-gray-900 mb-2">{template.title}</h4>
              <p className="text-sm text-gray-600 mb-4">
                {template.questions} questions • {template.time}
              </p>
              <Button variant="secondary" className="w-full">
                Use Template
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
