import React from 'react';

const PatientCard = ({ patient, onView, onSchedule, onSendReminder }) => {
  const { id, name, email, phone, lastvisit, nextvisit, nextvisitTime, missedAppointments } = patient;

  // Format dates
  const formatDate = (dateString, timeString) => {
    if (!dateString) return 'None';
    const date = new Date(timeString ? `${dateString}T${timeString}` : dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      (timeString ? ` at ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : '');
  };

  // Calculate risk level based on missed appointments
  const getRiskLevel = (missed) => {
    if (missed >= 3) return { level: 'High', color: 'bg-red-100 text-red-800' };
    if (missed >= 1) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { level: 'Low', color: 'bg-green-100 text-green-800' };
  };

  const risk = getRiskLevel(missedAppointments);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition">
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${risk.color}`}>
            {risk.level} Risk
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <span className="text-sm text-gray-600">{email}</span>
          </div>

          <div className="flex items-center">
            <svg className="w-4 h-4 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span className="text-sm text-gray-600">{phone}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">Last Visit</p>
            <p className="text-sm font-medium">{formatDate(lastvisit)}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-xs text-gray-500">Next Appointment</p>
            <p className="text-sm font-medium">{formatDate(nextvisit)}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
          <button
            onClick={() => onView(id)}
            className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition"
          >
            View Details
          </button>

          <button
            onClick={() => onSchedule(id)}
            className="text-sm px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition"
          >
            Schedule
          </button>

          <button
            onClick={() => onSendReminder(id)}
            className="text-sm px-3 py-1.5 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition"
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientCard;