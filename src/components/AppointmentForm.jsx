// src/components/AppointmentForm.jsx
import React, { useState, useEffect } from 'react';

const AppointmentForm = ({ appointment, patients, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    patientId: '',
    date: '',
    time: '',
    duration: 30,
    type: 'Checkup',
    notes: '',
    sendReminder: true,
    reminderTime: 24
  });

  // Form validation state
  const [errors, setErrors] = useState({});

  // Appointment types options
  const appointmentTypes = [
    'Checkup',
    'Follow-up',
    'Consultation',
    'Procedure',
    'Vaccination',
    'Lab Work',
    'Emergency'
  ];

  // Today's date and time for disabling past selections
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const pad = (n) => n.toString().padStart(2, '0');
  const currentTimeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // Populate form if editing an appointment
  useEffect(() => {
    if (appointment) {
      setFormData({
        ...appointment,
        sendReminder: true,
        reminderTime: 24,
        ...appointment
      });
    }
  }, [appointment]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });

    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.patientId) newErrors.patientId = 'Patient is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.type) newErrors.type = 'Appointment type is required';

    // Prevent selecting a past date
    if (formData.date && formData.date < todayStr) {
      newErrors.date = 'Cannot select a past date';
    }
    // Prevent selecting a past time if date is today
    if (
      formData.date === todayStr &&
      // formData.time &&
      formData.time < currentTimeStr
    ) {
      newErrors.time = 'Cannot select a past time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800">
        {appointment ? 'Edit Appointment' : 'Schedule New Appointment'}
      </h2>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="patientId" className="block mb-1 text-sm font-medium text-gray-700">
            Patient
          </label>
          <select
            id="patientId"
            name="patientId"
            value={formData.patientId}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.patientId ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Patient</option>
            {patients.map(patient => (
              <option key={patient.id} value={patient.id}>
                {patient.name}
              </option>
            ))}
          </select>
          {errors.patientId && <p className="mt-1 text-xs text-red-500">{errors.patientId}</p>}
        </div>

        <div>
          <label htmlFor="type" className="block mb-1 text-sm font-medium text-gray-700">
            Appointment Type
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.type ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select Type</option>
            {appointmentTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          {errors.type && <p className="mt-1 text-xs text-red-500">{errors.type}</p>}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="date" className="block mb-1 text-sm font-medium text-gray-700">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.date ? 'border-red-500' : 'border-gray-300'
            }`}
            min={todayStr}
          />
          {errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}
        </div>

        <div>
          <label htmlFor="time" className="block mb-1 text-sm font-medium text-gray-700">
            Time
          </label>
          <input
            type="time"
            id="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className={`w-full p-2 border rounded-md ${
              errors.time ? 'border-red-500' : 'border-gray-300'
            }`}
            min={formData.date === todayStr ? currentTimeStr : undefined}
          />
          {errors.time && <p className="mt-1 text-xs text-red-500">{errors.time}</p>}
        </div>

        <div>
          <label htmlFor="duration" className="block mb-1 text-sm font-medium text-gray-700">
            Duration (minutes)
          </label>
          <input
            type="number"
            id="duration"
            name="duration"
            min="5"
            max="240"
            step="5"
            value={formData.duration}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div>
        <label htmlFor="notes" className="block mb-1 text-sm font-medium text-gray-700">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows="3"
          value={formData.notes}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Add appointment notes (optional)"
        ></textarea>
      </div>

      <div className="bg-gray-50 p-3 rounded-md">
        <div className="flex items-center mb-3">
          <input
            type="checkbox"
            id="sendReminder"
            name="sendReminder"
            checked={formData.sendReminder}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
          />
          <label htmlFor="sendReminder" className="ml-2 text-sm font-medium text-gray-700">
            Send appointment reminder
          </label>
        </div>

        {formData.sendReminder && (
          <div className="ml-6">
            <label htmlFor="reminderTime" className="block mb-1 text-sm font-medium text-gray-700">
              Send reminder before appointment
            </label>
            <select
              id="reminderTime"
              name="reminderTime"
              value={formData.reminderTime}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="1">1 hour before</option>
              <option value="2">2 hours before</option>
              <option value="4">4 hours before</option>
              <option value="24">24 hours before</option>
              <option value="48">2 days before</option>
              <option value="168">1 week before</option>
            </select>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {appointment ? 'Update Appointment' : 'Schedule Appointment'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default AppointmentForm;