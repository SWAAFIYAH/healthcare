// src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ toggleSidebar, sidebarExpanded }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
    if (notificationsOpen) setNotificationsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    if (dropdownOpen) setDropdownOpen(false);
  };

  return (
    <nav className={`bg-white border-b border-gray-200 px-4 py-2.5 fixed top-0 z-50 transition-all duration-300 ${sidebarExpanded ? 'md:left-64' : 'left-0'} right-0`}>
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center justify-start">
          <button
            onClick={toggleSidebar}
            type="button"
            className="inline-flex items-center p-2 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
          >
            <span className="sr-only">Open sidebar</span>
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center md:hidden">
              <span className="self-center text-xl font-semibold whitespace-nowrap text-blue-700">
                CareRemind
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div className="relative mr-3" ref={notificationsRef}>
            <button
              type="button"
              onClick={toggleNotifications}
              className="p-2 text-gray-500 rounded-lg hover:text-gray-900 hover:bg-gray-100"
            >
              <span className="sr-only">View notifications</span>
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
              </svg>
              <div className="absolute inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full top-0 right-0">
                3
              </div>
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 bg-white divide-y divide-gray-100 rounded-lg shadow-lg">
                <div className="block px-4 py-2 font-medium text-gray-700 bg-gray-50">
                  Notifications
                </div>
                <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-100">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="w-full pl-3">
                      <div className="text-sm font-normal text-gray-800">
                        <span className="font-semibold">Sarah Johnson</span> missed her appointment today
                      </div>
                      <div className="text-xs font-medium text-blue-600">
                        5 minutes ago
                      </div>
                    </div>
                  </a>
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-100">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="w-full pl-3">
                      <div className="text-sm font-normal text-gray-800">
                        <span className="font-semibold">Follow-up reminder:</span> 5 patients need scheduling
                      </div>
                      <div className="text-xs font-medium text-blue-600">
                        1 hour ago
                      </div>
                    </div>
                  </a>
                  <a href="#" className="flex px-4 py-3 hover:bg-gray-100">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                        </svg>
                      </div>
                    </div>
                    <div className="w-full pl-3">
                      <div className="text-sm font-normal text-gray-800">
                        <span className="font-semibold">Automatic reminders</span> were sent to 12 patients
                      </div>
                      <div className="text-xs font-medium text-blue-600">
                        2 hours ago
                      </div>
                    </div>
                  </a>
                </div>
                <a href="#" className="block py-2 text-sm font-medium text-center text-gray-900 bg-gray-50 hover:bg-gray-100">
                  View all notifications
                </a>
              </div>
            )}
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={toggleDropdown}
              className="flex items-center text-sm bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300"
            >
              <span className="sr-only">Open user menu</span>
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                {currentUser?.email?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 z-50 mt-2 w-48 bg-white divide-y divide-gray-100 rounded-lg shadow-lg overflow-hidden">
                <div className="px-4 py-3">
                  <p className="text-sm text-gray-900 font-medium truncate">
                    {currentUser?.email || 'User'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {currentUser?.role || 'Doctor'}
                  </p>
                </div>
                <ul>
                  <li>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => navigate('/settings')}
                    >
                      Settings
                    </a>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;