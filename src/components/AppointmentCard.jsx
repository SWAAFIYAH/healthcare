// src/components/AppointmentCard.jsx
import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { usePatient } from '../context/PatientContext';

const AppointmentCard = ({ appointment, onReschedule, onCancel, onSendReminder, onChangeStatus }) => {
  const { patients } = usePatient();
  const { id, patientId, date, time, duration, status, type, notes } = appointment;
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Find the patient name using the patientId foreign key
  const patientName = useMemo(() => {
    const patient = patients.find(p => p.id === patientId);
    return patient ? patient.name : 'Unknown Patient';
  }, [patients, patientId]);

  // Format date to readable string
  const formattedDate = format(new Date(date), 'MMM dd, yyyy');
  const formattedTime = format(new Date(`${date}T${time}`), 'h:mm a');

  // Status color mapping
  const statusColors = {
    upcoming: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    rescheduled: 'bg-yellow-100 text-yellow-800',
    'no-show': 'bg-gray-100 text-gray-800',
  };

  // Handle status change
  const handleStatusChange = (newStatus) => {
    setShowStatusDropdown(false);
    if (onChangeStatus) {
      onChangeStatus(id, newStatus);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{patientName}</h3>
          <p className="text-sm text-gray-500">{type} Appointment</p>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status?.toLowerCase()]}`}>
          {status}
        </span>
      </div>
      
      <div className="flex items-center mb-3">
        <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
        </svg>
        <span className="text-gray-700">{formattedDate} at {formattedTime}</span>
      </div>
      
      <div className="mb-4 flex items-center">
        <svg className="w-5 h-5 text-gray-500 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
        </svg>
        <span className="text-gray-700">{duration} minutes</span>
      </div>
      
      {notes && (
        <div className="mb-4 p-2 bg-gray-50 rounded border border-gray-200">
          <p className="text-sm text-gray-700">{notes}</p>
        </div>
      )}
      
      <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200">
        <button 
          onClick={() => onSendReminder(id)}
          className="text-sm px-3 py-1.5 bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100 transition"
        >
          Send Reminder
        </button>
        
        <button 
          onClick={() => onReschedule(id)}
          className="text-sm px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition"
        >
          Reschedule
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowStatusDropdown((prev) => !prev)}
            className="text-sm px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition"
          >
            Action
          </button>
          {showStatusDropdown && (
            <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded shadow-lg z-10">
              <button
                onClick={() => handleStatusChange('completed')}
                className="block w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50"
              >
                Mark as Completed
              </button>
              <button
                onClick={() => handleStatusChange('cancelled')}
                className="block w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                Mark as Cancelled
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentCard;