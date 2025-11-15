import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';

export default function StudentNavbar() {
  const location = useLocation();
  const [user] = useState({
    name: 'Juan',
    email: 'juandelacruz@example.com',
    avatar: null
  });

  // Mock unread notifications count
  const unreadNotificationsCount = 6;

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="text-2xl font-bold text-indigo-600">
            <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 12C8 10.8954 8.89543 10 10 10H15C16.1046 10 17 10.8954 17 12V15C17 16.1046 16.1046 17 15 17H10C8.89543 17 8 16.1046 8 15V12Z" fill="currentColor"/>
              <path d="M23 12C23 10.8954 23.8954 10 25 10H30C31.1046 10 32 10.8954 32 12V15C32 16.1046 31.1046 17 30 17H25C23.8954 17 23 16.1046 23 15V12Z" fill="currentColor"/>
              <path d="M10 23C8.89543 23 8 23.8954 8 25V28C8 29.1046 8.89543 30 10 30H15C16.1046 30 17 29.1046 17 28V25C17 23.8954 16.1046 23 15 23H10Z" fill="currentColor"/>
              <path d="M23 25C23 23.8954 23.8954 23 25 23H30C31.1046 23 32 23.8954 32 25V28C32 29.1046 31.1046 30 30 30H25C23.8954 30 23 29.1046 23 28V25Z" fill="currentColor"/>
            </svg>
          </div>
          <span className="text-sm font-bold text-indigo-600">sixsayvensurvey.io</span>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Menu</div>
        <div className="space-y-1">
          <Link 
            to="/student/home" 
            className={`flex items-center px-3 py-2.5 rounded-lg ${
              isActive('/student/home')
                ? 'bg-gradient-to-r from-indigo-50 to-white text-indigo-600 border-l-4 border-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"/>
            </svg>
            <span className="font-medium text-sm">Home</span>
          </Link>
          <Link 
            to="/student/notifications" 
            className={`flex items-center px-3 py-2.5 rounded-lg ${
              isActive('/student/notifications')
                ? 'bg-gradient-to-r from-indigo-50 to-white text-indigo-600 border-l-4 border-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
            </svg>
            <span className="font-medium text-sm">Notifications</span>
            {unreadNotificationsCount > 0 && (
              <span className="ml-auto bg-indigo-100 text-indigo-600 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </Link>
          <Link 
            to="/student/courses" 
            className={`flex items-center px-3 py-2.5 rounded-lg ${
              isActive('/student/courses')
                ? 'bg-gradient-to-r from-indigo-50 to-white text-indigo-600 border-l-4 border-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
            <span className="font-medium text-sm">Enrolled Courses</span>
          </Link>
          <Link 
            to="/student/survey-board" 
            className={`flex items-center px-3 py-2.5 rounded-lg ${
              isActive('/student/survey-board')
                ? 'bg-gradient-to-r from-indigo-50 to-white text-indigo-600 border-l-4 border-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd"/>
            </svg>
            <span className="font-medium text-sm">Survey Board</span>
          </Link>
        </div>
      </nav>

      {/* Account Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Account</div>
        <div className="space-y-1">
          <Link 
            to="/student/settings" 
            className={`flex items-center px-3 py-2.5 rounded-lg ${
              isActive('/student/settings')
                ? 'bg-gradient-to-r from-indigo-50 to-white text-indigo-600 border-l-4 border-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"/>
            </svg>
            <span className="font-medium text-sm">Account Settings</span>
          </Link>
          <Link 
            to="/student/help" 
            className={`flex items-center px-3 py-2.5 rounded-lg ${
              isActive('/student/help')
                ? 'bg-gradient-to-r from-indigo-50 to-white text-indigo-600 border-l-4 border-indigo-600'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
            </svg>
            <span className="font-medium text-sm">Help</span>
          </Link>
        </div>

        {/* User Profile */}
        <div className="mt-4 flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-semibold">
            {user.name[0]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-gray-900 truncate">{user.name}</div>
            <div className="text-xs text-gray-500 truncate">{user.email}</div>
          </div>
          <Button variant="ghost" size="icon" className="text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </Button>
        </div>
      </div>
    </aside>
  );
}
