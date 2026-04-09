import { Search, Bell, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  userName?: string;
}

export function Navbar({ userName = 'Alex Johnson' }: NavbarProps) {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-30 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Search Bar - Hidden on mobile, visible on tablet+ */}
        <div className="hidden md:flex flex-1 max-w-xl">
          <div className="relative w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search quizzes, topics..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Mobile Search Icon */}
        <button className="md:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <Search size={20} className="text-gray-600" />
        </button>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 lg:gap-4 ml-auto">
          {/* Notifications */}
          <button className="relative p-2 lg:p-3 hover:bg-gray-100 rounded-xl transition-colors">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 lg:gap-3 p-2 lg:px-4 lg:py-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-medium">
                {userName.charAt(0)}
              </div>
              <span className="hidden lg:block font-medium text-gray-700">{userName}</span>
              <ChevronDown size={16} className="hidden lg:block text-gray-600" />
            </button>

            {showProfile && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowProfile(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors">
                    Settings
                  </button>
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors">
                    Help & Support
                  </button>
                  <hr className="my-2" />
                  <button className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-red-600">
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Bar - Below navbar on small screens */}
      <div className="md:hidden mt-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search quizzes, topics..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-indigo-600 focus:outline-none transition-colors"
          />
        </div>
      </div>
    </nav>
  );
}
