// import supabase, { TABLES, handleSupabaseError } from './supabaseClient';
// import { formatDate, formatTime } from '../utils/dateUtils';
// import { generateMessage } from '../utils/reminderUtils';
// import { parseISO, addDays, addHours } from 'date-fns';

// // Twilio configuration (would normally be in environment variables)
// const TWILIO_ACCOUNT_SID = 'your-twilio-account-sid';
// const TWILIO_AUTH_TOKEN = 'your-twilio-auth-token';
// const TWILIO_PHONE_NUMBER = '+1234567890';
// const TWILIO_WHATSAPP_NUMBER = 'whatsapp:+1234567890';

// // Helper to format phone numbers for Twilio
// const formatPhoneForTwilio = (phone) => {
//   // Remove any non-digit characters and ensure it starts with a +
//   if (!phone) return null;
//   const cleaned = phone.replace(/\D/g, '');
//   return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
// };

// /**
//  * Get the appropriate Twilio client based on the environment
//  * In development, we'll just mock the client
//  */
// const getTwilioClient = () => {
//   // In a production environment, we would use the actual Twilio client
//   if (process.env.NODE_ENV === 'production') {
//     // This would require installing the Twilio package: npm install twilio
//     const twilio = require('twilio');
//     return twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
//   }
  
//   // In development, return a mock client that logs instead of sending
//   return {
//     messages: {
//       create: async (options) => {
//         console.log('MOCK TWILIO: Would send message:', options);
//         return {
//           sid: `mock-${Date.now()}`,
//           status: 'sent',
//           ...options
//         };
//       }
//     }
//   };
// };

// /**
//  * Send a message via Twilio
//  * @param {string} to - Recipient phone number
//  * @param {string} body - Message content
//  * @param {string} channel - 'sms' or 'whatsapp'
//  * @returns {Promise<Object>} - Twilio response
//  */
// const sendTwilioMessage = async (to, body, channel = 'sms') => {
//   try {
//     const formattedPhone = formatPhoneForTwilio(to);
//     if (!formattedPhone) {
//       throw new Error('Invalid phone number');
//     }

//     const twilioClient = getTwilioClient();
    
//     // Prepare the message options
//     const messageOptions = {
//       body,
//       to: channel === 'whatsapp' ? `whatsapp:${formattedPhone}` : formattedPhone,
//       from: channel === 'whatsapp' ? TWILIO_WHATSAPP_NUMBER : TWILIO_PHONE_NUMBER
//     };
    
//     // Send the message via Twilio
//     const message = await twilioClient.messages.create(messageOptions);
    
//     return {
//       externalId: message.sid,
//       status: message.status
//     };
//   } catch (error) {
//     console.error('Error sending Twilio message:', error);
//     throw error;
//   }
// };

// /**
//  * Get a reminder template by ID
//  * @param {string} templateId - Template ID
//  * @returns {Promise<Object>} - Template object
//  */
// const getReminderTemplateById = async (templateId) => {
//   try {
//     const { data, error } = await supabase
//       .from(TABLES.REMINDER_TEMPLATES)
//       .select('*')
//       .eq('id', templateId)
//       .single();
    
//     if (error) {
//       throw error;
//     }

//     return data;
//   } catch (error) {
//     handleSupabaseError(error, `Error fetching reminder template with id ${templateId}`);
//     throw error;
//   }
// };

// /**
//  * Save a reminder to the sent reminders table
//  * @param {Object} reminderData - Reminder data
//  * @returns {Promise<Object>} - Saved reminder object
//  */
// const saveSentReminder = async (reminderData) => {
//   try {
//     const { data, error } = await supabase
//       .from(TABLES.SENT_REMINDERS)
//       .insert([reminderData])
//       .select()
//       .single();
    
//     if (error) {
//       throw error;
//     }

//     return data;
//   } catch (error) {
//     handleSupabaseError(error, 'Error saving sent reminder');
//     throw error;
//   }
// };

// /**
//  * Save a scheduled reminder to the database
//  * @param {Object} reminderData - Reminder data
//  * @returns {Promise<Object>} - Saved reminder object
//  */
// const saveScheduledReminder = async (reminderData) => {
//   try {
//     const { data, error } = await supabase
//       .from(TABLES.SCHEDULED_REMINDERS)
//       .insert([reminderData])
//       .select()
//       .single();
    
//     if (error) {
//       throw error;
//     }

//     return data;
//   } catch (error) {
//     handleSupabaseError(error, 'Error saving scheduled reminder');
//     throw error;
//   }
// };

// /**
//  * Get all default reminder templates for a specific type
//  * @param {string} type - Template type
//  * @returns {Promise<Array>} - Array of template objects
//  */
// const getDefaultTemplatesByType = async (type) => {
//   try {
//     const { data, error } = await supabase
//       .from(TABLES.REMINDER_TEMPLATES)
//       .select('*')
//       .eq('type', type)
//       .eq('isDefault', true);
    
//     if (error) {
//       throw error;
//     }

//     return data;
//   } catch (error) {
//     handleSupabaseError(error, `Error fetching default templates for type ${type}`);
//     throw error;
//   }
// };

// /**
//  * Get a specific scheduled reminder by ID
//  * @param {string} id - Reminder ID
//  * @returns {Promise<Object>} - Scheduled reminder object
//  */
// const getScheduledReminderById = async (id) => {
//   try {
//     const { data, error } = await supabase
//       .from(TABLES.SCHEDULED_REMINDERS)
//       .select('*, appointment:appointmentId(*)')
//       .eq('id', id)
//       .single();
    
//     if (error) {
//       throw error;
//     }

//     return data;
//   } catch (error) {
//     handleSupabaseError(error, `Error fetching scheduled reminder with id ${id}`);
//     throw error;
//   }
// };

// /**
//  * Get a specific sent reminder by ID
//  * @param {string} id - Reminder ID
//  * @returns {Promise<Object>} - Sent reminder object
//  */
// const getSentReminderById = async (id) => {
//   try {
//     const { data, error } = await supabase
//       .from(TABLES.SENT_REMINDERS)
//       .select('*, appointment:appointmentId(*)')
//       .eq('id', id)
//       .single();
    
//     if (error) {
//       throw error;
//     }

//     return data;
//   } catch (error) {
//     handleSupabaseError(error, `Error fetching sent reminder with id ${id}`);
//     throw error;
//   }
// };

// /**
//  * Get reminder data for a specific appointment
//  * @param {Object} appointment - Appointment object
//  * @param {Object} patient - Patient object
//  * @returns {Object} - Reminder data
//  */
// const getAppointmentReminderData = (appointment, patient = {}) => {
//   return {
//     patientName: patient.name || appointment.patientName || 'Patient',
//     appointmentDate: formatDate(appointment.date),
//     appointmentTime: formatTime(appointment.time),
//     appointmentType: appointment.type || 'Appointment',
//     doctorName: appointment.doctorName || 'Your Doctor',
//     clinicName: 'CareRemind Medical Center',
//     clinicPhone: '(555) 123-4567',
//     clinicAddress: '123 Healthcare Ave, Medical City, MC 12345'
//   };
// };

// // ReminderService implementation
// export const reminderService = {
//   /**
//    * Schedule reminders for a newly created or updated appointment
//    * @param {Object} appointment - Appointment object
//    * @param {Object} patient - Patient object
//    * @returns {Promise<Array>} - Array of scheduled reminder objects
//    */
//   scheduleAppointmentReminders: async (appointment, patient = {}) => {
//     try {
//       // Get default templates for appointment reminders
//       const defaultTemplates = await getDefaultTemplatesByType('appointment');
      
//       if (!defaultTemplates || defaultTemplates.length === 0) {
//         console.warn('No default appointment reminder templates found');
//         return [];
//       }
      
//       const appointmentDate = parseISO(appointment.date);
//       const reminderData = getAppointmentReminderData(appointment, patient);
//       const scheduledReminders = [];
      
//       // Default reminder schedule: 1 day before, 1 hour before, and 1 week before (if applicable)
//       const reminderSchedule = [
//         { days: -1, name: '1 Day Before' },
//         { hours: -1, name: '1 Hour Before' },
//         { days: -7, name: '1 Week Before' }
//       ];
      
//       // Get patient's preferred contact method
//       const contactMethod = patient.preferredContact || 'sms';
      
//       for (const schedule of reminderSchedule) {
//         // Calculate when this reminder should be sent
//         let scheduledFor = new Date(appointmentDate);
        
//         if (schedule.days) {
//           scheduledFor = addDays(scheduledFor, schedule.days);
//         }
        
//         if (schedule.hours) {
//           scheduledFor = addHours(scheduledFor, schedule.hours);
//         }
        
//         // Skip this reminder if it's in the past
//         if (scheduledFor < new Date()) {
//           continue;
//         }
        
//         // Find a template for this reminder type
//         const template = defaultTemplates.find(t => t.name.includes(schedule.name)) || defaultTemplates[0];
        
//         // Generate the message content
//         const messageContent = generateMessage(template.content, reminderData);
        
//         // Create the reminder object
//         const reminder = {
//           patientId: appointment.patientId,
//           appointmentId: appointment.id,
//           templateId: template.id,
//           content: messageContent,
//           scheduledFor: scheduledFor.toISOString(),
//           channel: contactMethod,
//           status: 'scheduled',
//           recipientPhone: patient.phone || '',
//           recipientEmail: patient.email || '',
//           metadata: {
//             reminderType: 'appointment',
//             scheduleName: schedule.name
//           }
//         };
        
//         // Save this scheduled reminder
//         const savedReminder = await saveScheduledReminder(reminder);
//         scheduledReminders.push(savedReminder);
//       }
      
//       return scheduledReminders;
//     } catch (error) {
//       console.error('Error scheduling appointment reminders:', error);
//       throw error;
//     }
//   },
  
//   /**
//    * Send an immediate reminder
//    * @param {string} type - Reminder type (appointment, followup, etc.)
//    * @param {Object} data - Data for personalization
//    * @param {string} templateId - ID of the template to use
//    * @param {string} channel - Channel to use (sms, whatsapp, etc.)
//    * @returns {Promise<Object>} - Sent reminder object
//    */
//   sendImmediateReminder: async (type, data, templateId, channel = 'sms') => {
//     try {
//       // Get the template
//       const template = await getReminderTemplateById(templateId);
//       if (!template) {
//         throw new Error(`Reminder template with ID ${templateId} not found`);
//       }
      
//       // Generate the message content
//       const messageContent = generateMessage(template.content, data);
      
//       // Determine the recipient phone number
//       const recipientPhone = data.patient?.phone || data.recipientPhone;
//       if (!recipientPhone) {
//         throw new Error('No recipient phone number specified');
//       }
      
//       // Send the message via Twilio
//       const twilioResponse = await sendTwilioMessage(recipientPhone, messageContent, channel);
      
//       // Create sent reminder data
//       const sentReminder = {
//         patientId: data.patient?.id || data.patientId,
//         appointmentId: data.appointment?.id || data.appointmentId,
//         templateId: template.id,
//         content: messageContent,
//         sentAt: new Date().toISOString(),
//         channel,
//         status: twilioResponse.status,
//         recipientPhone,
//         recipientEmail: data.patient?.email || data.recipientEmail || '',
//         externalId: twilioResponse.externalId,
//         metadata: {
//           reminderType: type,
//           immediate: true
//         }
//       };
      
//       // Save to sent reminders table
//       return await saveSentReminder(sentReminder);
//     } catch (error) {
//       console.error('Error sending immediate reminder:', error);
//       throw error;
//     }
//   },
  
//   /**
//    * Schedule a manual reminder
//    * @param {Object} reminderData - Reminder data
//    * @returns {Promise<Object>} - Scheduled reminder object
//    */
//   scheduleManualReminder: async (reminderData) => {
//     try {
//       // Get the template
//       const template = await getReminderTemplateById(reminderData.templateId);
//       if (!template) {
//         throw new Error(`Reminder template with ID ${reminderData.templateId} not found`);
//       }
      
//       // Ensure we have the appointment data if an appointmentId is provided
//       let appointmentData = reminderData.appointmentData || {};
//       if (reminderData.appointmentId && !appointmentData.date) {
//         // Get the appointment data
//         const { data, error } = await supabase
//           .from(TABLES.APPOINTMENTS)
//           .select('*')
//           .eq('id', reminderData.appointmentId)
//           .single();
          
//         if (!error) {
//           appointmentData = data;
//         }
//       }
      
//       // Generate reminder data based on type and available information
//       let templateData = {};
//       if (reminderData.type === 'appointment' && appointmentData) {
//         // For appointment reminders, get appointment-specific data
//         templateData = getAppointmentReminderData(appointmentData, { 
//           name: reminderData.patientName,
//           phone: reminderData.recipientPhone,
//           email: reminderData.recipientEmail
//         });
//       } else {
//         // For other reminders, use whatever data is provided
//         templateData = {
//           patientName: reminderData.patientName || 'Patient',
//           ...reminderData.templateData
//         };
//       }
      
//       // Generate the message content
//       const messageContent = generateMessage(template.content, templateData);
      
//       // Create the scheduled reminder object
//       const scheduledReminder = {
//         patientId: reminderData.patientId,
//         appointmentId: reminderData.appointmentId,
//         templateId: reminderData.templateId,
//         content: messageContent,
//         scheduledFor: reminderData.scheduledFor, 
//         channel: reminderData.channel || 'sms',
//         status: 'scheduled',
//         recipientPhone: reminderData.recipientPhone || '',
//         recipientEmail: reminderData.recipientEmail || '',
//         metadata: {
//           reminderType: reminderData.type || 'manual',
//           isManual: true
//         }
//       };
      
//       // Save to scheduled reminders table
//       return await saveScheduledReminder(scheduledReminder);
//     } catch (error) {
//       console.error('Error scheduling manual reminder:', error);
//       throw error;
//     }
//   },
  
//   /**
//    * Cancel a scheduled reminder
//    * @param {string} reminderId - Reminder ID
//    * @returns {Promise<Object>} - Success message
//    */
//   cancelReminder: async (reminderId) => {
//     try {
//       const { error } = await supabase
//         .from(TABLES.SCHEDULED_REMINDERS)
//         .update({ status: 'cancelled' })
//         .eq('id', reminderId);
      
//       if (error) {
//         throw error;
//       }
      
//       return { success: true, message: 'Reminder cancelled successfully' };
//     } catch (error) {
//       console.error('Error cancelling reminder:', error);
//       throw error;
//     }
//   },
  
//   /**
//    * Cancel all scheduled reminders for an appointment
//    * @param {string} appointmentId - Appointment ID
//    * @returns {Promise<Object>} - Success message
//    */
//   cancelRemindersByAppointmentId: async (appointmentId) => {
//     try {
//       const { error } = await supabase
//         .from(TABLES.SCHEDULED_REMINDERS)
//         .update({ status: 'cancelled' })
//         .eq('appointmentId', appointmentId)
//         .eq('status', 'scheduled');
      
//       if (error) {
//         throw error;
//       }
      
//       return { success: true, message: 'Appointment reminders cancelled successfully' };
//     } catch (error) {
//       console.error('Error cancelling appointment reminders:', error);
//       throw error;
//     }
//   },
  
//   /**
//    * Resend a reminder that was previously sent
//    * @param {string} reminderId - ID of a previously sent reminder
//    * @returns {Promise<Object>} - Newly sent reminder object
//    */
//   resendReminder: async (reminderId) => {
//     try {
//       // Get the original reminder
//       const originalReminder = await getSentReminderById(reminderId);
//       if (!originalReminder) {
//         throw new Error(`Reminder with ID ${reminderId} not found`);
//       }
      
//       // Send the message via Twilio
//       const twilioResponse = await sendTwilioMessage(
//         originalReminder.recipientPhone, 
//         originalReminder.content, 
//         originalReminder.channel
//       );
      
//       // Create a new sent reminder record
//       const resent = {
//         ...originalReminder,
//         id: undefined, // Let Supabase generate a new ID
//         sentAt: new Date().toISOString(),
//         status: twilioResponse.status,
//         externalId: twilioResponse.externalId,
//         metadata: {
//           ...originalReminder.metadata,
//           resend: true,
//           originalReminderId: originalReminder.id
//         }
//       };
      
//       // Save to sent reminders table
//       return await saveSentReminder(resent);
//     } catch (error) {
//       console.error('Error resending reminder:', error);
//       throw error;
//     }
//   },
  
//   /**
//    * Execute scheduled reminders that are due to be sent
//    * This would typically be called by a cron job or scheduled task
//    * @returns {Promise<Array>} - Array of sent reminder objects
//    */
//   processScheduledReminders: async () => {
//     try {
//       // Get all scheduled reminders that are due
//       const now = new Date().toISOString();
//       const { data: dueReminders, error } = await supabase
//         .from(TABLES.SCHEDULED_REMINDERS)
//         .select('*')
//         .eq('status', 'scheduled')
//         .lte('scheduledFor', now)
//         .limit(50); // Process in batches to avoid overloading
      
//       if (error) {
//         throw error;
//       }
      
//       if (!dueReminders || dueReminders.length === 0) {
//         return [];
//       }
      
//       const sentReminders = [];
      
//       // Process each due reminder
//       for (const reminder of dueReminders) {
//         try {
//           // Send the message via Twilio
//           const twilioResponse = await sendTwilioMessage(
//             reminder.recipientPhone, 
//             reminder.content, 
//             reminder.channel
//           );
          
//           // Update the scheduled reminder status
//           await supabase
//             .from(TABLES.SCHEDULED_REMINDERS)
//             .update({ status: 'sent' })
//             .eq('id', reminder.id);
          
//           // Create a record in sent reminders
//           const sentReminder = {
//             patientId: reminder.patientId,
//             appointmentId: reminder.appointmentId,
//             templateId: reminder.templateId,
//             content: reminder.content,
//             sentAt: new Date().toISOString(),
//             channel: reminder.channel,
//             status: twilioResponse.status,
//             recipientPhone: reminder.recipientPhone,
//             recipientEmail: reminder.recipientEmail,
//             externalId: twilioResponse.externalId,
//             metadata: {
//               ...reminder.metadata,
//               scheduledReminderId: reminder.id
//             }
//           };
          
//           // Save to sent reminders table
//           const saved = await saveSentReminder(sentReminder);
//           sentReminders.push(saved);
//         } catch (error) {
//           // Update the scheduled reminder status to failed
//           await supabase
//             .from(TABLES.SCHEDULED_REMINDERS)
//             .update({ 
//               status: 'failed',
//               metadata: {
//                 ...reminder.metadata,
//                 error: error.message
//               }
//             })
//             .eq('id', reminder.id);
          
//           console.error(`Error processing reminder ${reminder.id}:`, error);
//         }
//       }
      
//       return sentReminders;
//     } catch (error) {
//       console.error('Error processing scheduled reminders:', error);
//       throw error;
//     }
//   }
// };

// export default reminderService;

import emailjs from '@emailjs/browser';
import supabase from '../services/supabaseClient';

const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

export const sendEmailReminder = async (patientEmail, subject, message) => {
  const templateParams = {
    to_email: patientEmail,
    subject: subject,
    message: message,
  };

  return emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    EMAILJS_PUBLIC_KEY
  );
};

export const getReminderTemplateById = async (templateId) => {
  const { data, error } = await supabase
    .from('reminder_templates')
    .select('*')
    .eq('id', templateId)
    .single();
  if (error) {
    console.error('Failed to fetch reminder template:', error);
    return null;
  }
  return data;
};