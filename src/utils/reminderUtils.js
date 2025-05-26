// src/utils/reminderUtils.js
import { formatDate, formatTime } from './dateUtils';

/**
 * Generate a personalized message from a template by replacing placeholders
 * @param {string} template - The message template with {{placeholders}}
 * @param {Object} data - Object containing values for the placeholders
 * @returns {string} The personalized message
 */
export const generateMessage = (template, data = {}) => {
  if (!template) return '';
  
  let message = template;
  
  // Replace all placeholders with their values
  Object.entries(data).forEach(([key, value]) => {
    const placeholder = new RegExp(`\{\{${key}\}\}`, 'g');
    message = message.replace(placeholder, value || `[${key}]`);
  });
  
  return message;
};

/**
 * Get default reminder data for an appointment
 * @param {Object} appointment - The appointment object
 * @param {Object} patient - The patient object
 * @returns {Object} Object with formatted data for reminder templates
 */
export const getAppointmentReminderData = (appointment, patient = {}) => {
  if (!appointment) return {};
  
  return {
    patientName: patient.name || appointment.patientName || '',
    date: formatDate(appointment.date),
    time: formatTime(appointment.time),
    appointmentType: appointment.type || '',
    doctorName: appointment.doctorName || '',
    clinicName: 'CareRemind Medical Center',
    clinicPhone: '(555) 123-4567',
    clinicAddress: '123 Healthcare Ave, Medical City, MC 12345'
  };
};

/**
 * Get default reminder data for a medication
 * @param {Object} medication - The medication details
 * @param {Object} patient - The patient object
 * @returns {Object} Object with formatted data for reminder templates
 */
export const getMedicationReminderData = (medication, patient = {}) => {
  if (!medication) return {};
  
  return {
    patientName: patient.name || '',
    medication: medication.name || '',
    dosage: medication.dosage || '',
    frequency: medication.frequency || '',
    instructions: medication.instructions || '',
    clinicPhone: '(555) 123-4567'
  };
};

/**
 * Get default reminder data for follow-ups
 * @param {Object} treatment - The previous treatment details
 * @param {Object} patient - The patient object
 * @returns {Object} Object with formatted data for reminder templates
 */
export const getFollowUpReminderData = (treatment, patient = {}) => {
  if (!treatment) return {};
  
  return {
    patientName: patient.name || '',
    treatmentType: treatment.type || '',
    treatmentDate: formatDate(treatment.date),
    doctorName: treatment.doctorName || '',
    clinicPhone: '(555) 123-4567',
    clinicName: 'CareRemind Medical Center'
  };
};

/**
 * Schedule a reminder (this is a mock function)
 * In a real app, this would interact with a backend service
 * @param {string} templateType - Type of reminder template to use
 * @param {Object} data - Data to populate the template
 * @param {Date} sendDate - When to send the reminder
 * @param {string} channel - Communication channel (sms, email, etc.)
 * @returns {Object} Information about the scheduled reminder
 */
export const scheduleReminder = (templateType, data, sendDate, channel = 'sms') => {
  // This is a mock function that would be implemented in a real app
  console.log(`Mock: Scheduled ${templateType} reminder via ${channel} for ${sendDate}`);
  console.log('Data:', data);
  
  // Return a mock scheduled reminder object
  return {
    id: `reminder-${Date.now()}`,
    templateType,
    data,
    scheduledFor: sendDate,
    channel,
    status: 'scheduled'
  };
};

/**
 * Cancel a scheduled reminder (this is a mock function)
 * @param {string} reminderId - ID of the reminder to cancel
 * @returns {boolean} True if cancellation was successful
 */
export const cancelReminder = (reminderId) => {
  // This is a mock function that would be implemented in a real app
  console.log(`Mock: Cancelled reminder ${reminderId}`);
  return true;
};

/**
 * Send an immediate reminder (this is a mock function)
 * @param {string} templateType - Type of reminder template to use
 * @param {Object} data - Data to populate the template
 * @param {string} channel - Communication channel (sms, email, etc.)
 * @returns {Object} Information about the sent reminder
 */
export const sendImmediateReminder = (templateType, data, channel = 'sms') => {
  // This is a mock function that would be implemented in a real app
  console.log(`Mock: Sent immediate ${templateType} reminder via ${channel}`);
  console.log('Data:', data);
  
  // Return a mock sent reminder object
  return {
    id: `reminder-${Date.now()}`,
    templateType,
    data,
    sentAt: new Date(),
    channel,
    status: 'sent'
  };
};