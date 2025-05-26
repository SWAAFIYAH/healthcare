import React, { useState, useEffect } from 'react';
import { useReminders } from '../context/ReminderContext';
import { formatDate, addDaysToDate, getTodayISO } from '../utils/dateUtils';

const FollowUpReminder = ({ patient, appointment, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [reminderDate, setReminderDate] = useState(getTodayISO());
  const [channel, setChannel] = useState('sms');
  const [previewContent, setPreviewContent] = useState('');
  const [showModal, setShowModal] = useState(false);

  // Get reminder context functions
  const { 
    templates, 
    getTemplates, 
    sendReminder, 
    scheduleReminder, 
    previewReminder 
  } = useReminders();

  // Filter templates for follow-ups
  const followUpTemplates = templates.filter(template => template.type === 'followup');
  
  useEffect(() => {
    // Load templates if not already loaded
    if (templates.length === 0) {
      getTemplates();
    }
    
    // Set default template if available
    if (followUpTemplates.length > 0 && !selectedTemplate) {
      const defaultTemplate = followUpTemplates.find(t => t.isDefault) || followUpTemplates[0];
      setSelectedTemplate(defaultTemplate);
      updatePreview(defaultTemplate);
    }
  }, [templates, getTemplates]);

  // Generate template data
  const getTemplateData = () => {
    return {
      patientName: patient?.name || 'Patient',
      treatmentType: appointment?.type || 'appointment',
      treatmentDate: appointment ? formatDate(appointment.date) : 'your last visit',
      doctorName: appointment?.doctorName || 'your doctor',
      clinicPhone: '(555) 123-4567',
      clinicName: 'CareRemind Medical Center'
    };
  };

  // Update preview content
  const updatePreview = (template) => {
    if (!template) return;
    
    const templateData = getTemplateData();
    const content = previewReminder(template.content, templateData);
    setPreviewContent(content);
  };

  // Handle template change
  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    const template = templates.find(t => t.id === templateId);
    setSelectedTemplate(template);
    updatePreview(template);
  };

  // Handle channel change
  const handleChannelChange = (e) => {
    setChannel(e.target.value);
  };

  // Handle date change
  const handleDateChange = (e) => {
    setReminderDate(e.target.value);
  };

  // Schedule reminder for later
  const handleScheduleReminder = async () => {
    if (!selectedTemplate || !patient) {
      setError('Please select a template and patient');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const templateData = getTemplateData();
      
      const reminderData = {
        templateId: selectedTemplate.id,
        type: 'followup',
        patientId: patient.id,
        patientName: patient.name,
        recipientPhone: patient.phone,
        recipientEmail: patient.email,
        appointmentId: appointment?.id,
        scheduledFor: new Date(reminderDate).toISOString(),
        channel,
        templateData
      };
      
      await scheduleReminder(reminderData);
      setSuccess(true);
      
      // Reset after success
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to schedule reminder');
    } finally {
      setLoading(false);
    }
  };

  // Send immediate reminder
  const handleSendNow = async () => {
    if (!selectedTemplate || !patient) {
      setError('Please select a template and patient');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const templateData = getTemplateData();
      const data = {
        patient,
        appointment,
        ...templateData
      };
      
      await sendReminder('followup', data, selectedTemplate.id, channel);
      setSuccess(true);
      
      // Reset after success
      setTimeout(() => {
        setSuccess(false);
        if (onSuccess) onSuccess();
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to send reminder');
    } finally {
      setLoading(false);
    }
  };

  // Set reminder date shortcuts
  const setDateToTomorrow = () => {
    setReminderDate(addDaysToDate(getTodayISO(), 1));
  };

  const setDateToNextWeek = () => {
    setReminderDate(addDaysToDate(getTodayISO(), 7));
  };

  const setDateToNextMonth = () => {
    setReminderDate(addDaysToDate(getTodayISO(), 30));
  };

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        Send Follow-Up Reminder
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Send Follow-Up Reminder</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Patient
              </label>
              <div className="p-2 border border-gray-300 rounded-md bg-gray-50">
                {patient ? (
                  <>
                    <p className="font-medium">{patient.name}</p>
                    <p className="text-sm text-gray-500">Phone: {patient.phone}</p>
                    {appointment && (
                      <p className="text-sm text-gray-500">
                        Last visit: {formatDate(appointment.date)} ({appointment.type})
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No patient selected</p>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
                Template
              </label>
              <select
                id="template"
                value={selectedTemplate?.id || ''}
                onChange={handleTemplateChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select a template</option>
                {followUpTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="channel" className="block text-sm font-medium text-gray-700 mb-1">
                Channel
              </label>
              <select
                id="channel"
                value={channel}
                onChange={handleChannelChange}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="sms">SMS</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="email">Email</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Preview
              </label>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md text-sm">
                {previewContent || 'Select a template to see preview'}
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                Schedule Date
              </label>
              <input
                type="date"
                id="date"
                value={reminderDate}
                onChange={handleDateChange}
                min={getTodayISO()}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <div className="flex space-x-2 mt-2">
                <button
                  type="button"
                  onClick={setDateToTomorrow}
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={setDateToNextWeek}
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next Week
                </button>
                <button
                  type="button"
                  onClick={setDateToNextMonth}
                  className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next Month
                </button>
              </div>
            </div>
            
            {error && (
              <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
                {error}
              </div>
            )}
            
            {success && (
              <div className="mb-4 p-2 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
                Reminder successfully {reminderDate === getTodayISO() ? 'sent!' : 'scheduled!'}
              </div>
            )}
            
            <div className="flex space-x-3 mt-6">
              <button
                type="button"
                onClick={handleSendNow}
                disabled={loading}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Now'}
              </button>
              
              <button
                type="button"
                onClick={handleScheduleReminder}
                disabled={loading || reminderDate === getTodayISO()}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Scheduling...' : 'Schedule for Later'}
              </button>
              
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="inline-flex justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FollowUpReminder;