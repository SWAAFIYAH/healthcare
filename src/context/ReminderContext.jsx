import React, { createContext, useContext, useState, useCallback } from 'react';
import supabase, { TABLES, handleSupabaseError } from '../services/supabaseClient';
import { sendEmailReminder } from '../services/reminderService';

const ReminderContext = createContext();

// Provider component
export const ReminderProvider = ({ children }) => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Example: fetch scheduled reminders for the current user/clinic
  const fetchReminders = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const data = await getScheduledReminders(filters);
      setReminders(data);
    } catch (error) {
      // Optionally handle error here
    } finally {
      setLoading(false);
    }
  }, []);

  // All API functions below are included in the context value
  const value = {
    reminders,
    setReminders,
    loading,
    fetchReminders,
    signIn,
    signUp,
    signOut,
    getCurrentUser,
    resetPassword,
    updatePassword,
    getPatients,
    getPatientById,
    addPatient,
    updatePatient,
    deletePatient,
    getAppointments,
    getAppointmentById,
    getAppointmentsByPatient,
    addAppointment,
    updateAppointment,
    deleteAppointment,
    getReminderTemplates,
    addReminderTemplate,
    updateReminderTemplate,
    deleteReminderTemplate,
    getScheduledReminders,
    getSentReminders,
    sendEmailReminder,
    scheduleAppointmentReminders,
    // sendImmediateReminder,
    // scheduleManualReminder,
    // cancelReminder,
    // resendReminder,
  };

  return (
    <ReminderContext.Provider value={value}>
      {children}
    </ReminderContext.Provider>
  );
};

// Hook to use the context
export const useReminder = () => useContext(ReminderContext);


/************************
 * User Authentication
 ************************/

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} - User object or error
 */
export const signIn = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    return {
      user: data.user,
      session: data.session
    };
  } catch (error) {
    handleSupabaseError(error, 'Error signing in');
    throw error;
  }
};

/**
 * Sign up with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {Object} userData - Additional user data
 * @returns {Promise<Object>} - User object or error
 */
export const signUp = async (email, password, userData = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          ...userData,
          role: userData.role || 'staff',
        }
      }
    });

    if (error) {
      throw error;
    }

    return {
      user: data.user,
      session: data.session
    };
  } catch (error) {
    handleSupabaseError(error, 'Error signing up');
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>} - Void or error
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      throw error;
    }
  } catch (error) {
    handleSupabaseError(error, 'Error signing out');
    throw error;
  }
};

/**
 * Get current user
 * @returns {Promise<Object>} - Current user object or null
 */
export const getCurrentUser = async () => {
  try {
    const { data, error } = await supabase.auth.getUser();
    
    if (error) {
      throw error;
    }

    return data.user;
  } catch (error) {
    handleSupabaseError(error, 'Error getting current user');
    throw error;
  }
};

/**
 * Reset password for a user
 * @param {string} email - User email
 * @returns {Promise<Object>} - Success message or error
 */
export const resetPassword = async (email) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw error;
    }

    return { message: 'Password reset email sent successfully' };
  } catch (error) {
    handleSupabaseError(error, 'Error resetting password');
    throw error;
  }
};

/**
 * Update password for a user
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} - Success message or error
 */
export const updatePassword = async (newPassword) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      throw error;
    }

    return { message: 'Password updated successfully' };
  } catch (error) {
    handleSupabaseError(error, 'Error updating password');
    throw error;
  }
};

/************************
 * Patient Management
 ************************/

/**
 * Get all patients for the current user's organization
 * @returns {Promise<Array>} - Array of patient objects
 */
export const getPatients = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PATIENTS)
      .select('*')
      .order('name');
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Error fetching patients');
    throw error;
  }
};

/**
 * Get patient by id
 * @param {string} id - Patient id
 * @returns {Promise<Object>} - Patient object
 */
export const getPatientById = async (id) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PATIENTS)
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, `Error fetching patient with id ${id}`);
    throw error;
  }
};

/**
 * Add a new patient
 * @param {Object} patientData - Patient data
 * @returns {Promise<Object>} - Added patient object
 */
export const addPatient = async (patientData) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PATIENTS)
      .insert([patientData])
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Error adding patient');
    throw error;
  }
};

/**
 * Update an existing patient
 * @param {string} id - Patient id
 * @param {Object} patientData - Updated patient data
 * @returns {Promise<Object>} - Updated patient object
 */
export const updatePatient = async (id, patientData) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.PATIENTS)
      .update(patientData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, `Error updating patient with id ${id}`);
    throw error;
  }
};

/**
 * Delete a patient
 * @param {string} id - Patient id
 * @returns {Promise<Object>} - Success message
 */
export const deletePatient = async (id) => {
  try {
    // First check if there are any appointments for this patient
    const { data: appointments } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select('id')
      .eq('patientId', id);

    if (appointments && appointments.length > 0) {
      // Delete all appointments for this patient
      const { error: appError } = await supabase
        .from(TABLES.APPOINTMENTS)
        .delete()
        .eq('patientId', id);
      
      if (appError) throw appError;
    }

    // Now delete the patient
    const { error } = await supabase
      .from(TABLES.PATIENTS)
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }

    return { success: true, message: 'Patient deleted successfully' };
  } catch (error) {
    handleSupabaseError(error, `Error deleting patient with id ${id}`);
    throw error;
  }
};

/************************
 * Appointment Management
 ************************/

/**
 * Get all appointments
 * @returns {Promise<Array>} - Array of appointment objects
 */
export const getAppointments = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select('*, patient:patientId(name)')
      .order('date', { ascending: false });
    
    if (error) {
      throw error;
    }

    // Format data to match the structure expected by the app
    return data.map(app => ({
      ...app,
      patientName: app.patient?.name || 'Unknown Patient'
    }));
  } catch (error) {
    handleSupabaseError(error, 'Error fetching appointments');
    throw error;
  }
};

/**
 * Get appointment by id
 * @param {string} id - Appointment id
 * @returns {Promise<Object>} - Appointment object
 */
export const getAppointmentById = async (id) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select('*, patient:patientId(name)')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }

    return {
      ...data,
      patientName: data.patient?.name || 'Unknown Patient'
    };
  } catch (error) {
    handleSupabaseError(error, `Error fetching appointment with id ${id}`);
    throw error;
  }
};

/**
 * Get appointments for a specific patient
 * @param {string} patientId - Patient id
 * @returns {Promise<Array>} - Array of appointment objects
 */
export const getAppointmentsByPatient = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .select('*, patient:patientId(name)')
      .eq('patientId', patientId)
      .order('date', { ascending: false });
    
    if (error) {
      throw error;
    }

    return data.map(app => ({
      ...app,
      patientName: app.patient?.name || 'Unknown Patient'
    }));
  } catch (error) {
    handleSupabaseError(error, `Error fetching appointments for patient ${patientId}`);
    throw error;
  }
};

/**
 * Add a new appointment
 * @param {Object} appointmentData - Appointment data
 * @returns {Promise<Object>} - Added appointment object
 */
export const addAppointment = async (appointmentData) => {
  try {
    console.log('addAppointment called with:', appointmentData);

    // Get patient name for completeness if not provided
    let patientName = appointmentData.patientName;
    if (!patientName && appointmentData.patientId) {
      const patient = await getPatientById(appointmentData.patientId);
      patientName = patient?.name || 'Unknown Patient';
    }

    // Prepare appointment data to save
    const appointmentToSave = {
      ...appointmentData,
      patientName
    };

    const { data, error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .insert([appointmentToSave])
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    // Schedule automatic reminders if configured
    if (appointmentData.sendEmailReminder) {
      console.log('Calling scheduleAppointmentReminders...');
      await scheduleAppointmentReminders(data);
    }

    return data;
  } catch (error) {
    console.error('Error in addAppointment:', error);
    handleSupabaseError(error, 'Error adding appointment');
    throw error;
  }
};

/**
 * Update an existing appointment
 * @param {string} id - Appointment id
 * @param {Object} appointmentData - Updated appointment data
 * @returns {Promise<Object>} - Updated appointment object
 */
export const updateAppointment = async (id, appointmentData) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .update(appointmentData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    // If date or time changed, update scheduled reminders
    if (appointmentData.date || appointmentData.time) {
      // Cancel existing reminders
      await sendEmailReminder.cancelRemindersByAppointmentId(id);
      
      // Reschedule reminders if configured
      if (appointmentData.sendEmailReminder || data.sendEmailReminder) {
        await scheduleAppointmentReminders(data);
      }
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, `Error updating appointment with id ${id}`);
    throw error;
  }
};

/**
 * Delete an appointment
 * @param {string} id - Appointment id
 * @returns {Promise<Object>} - Success message
 */
export const deleteAppointment = async (id) => {
  try {
    // First, cancel any scheduled reminders for this appointment
    await sendEmailReminder.cancelRemindersByAppointmentId(id);
    
    // Then delete the appointment
    const { error } = await supabase
      .from(TABLES.APPOINTMENTS)
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }

    return { success: true, message: 'Appointment deleted successfully' };
  } catch (error) {
    handleSupabaseError(error, `Error deleting appointment with id ${id}`);
    throw error;
  }
};

/************************
 * Reminder Management
 ************************/

/**
 * Get reminder templates
 * @returns {Promise<Array>} - Array of reminder template objects
 */
export const getReminderTemplates = async () => {
  try {
    const { data, error } = await supabase
      .from(TABLES.REMINDER_TEMPLATES)
      .select('*')
      .order('name');
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Error fetching reminder templates');
    throw error;
  }
};

/**
 * Add a new reminder template
 * @param {Object} templateData - Template data
 * @returns {Promise<Object>} - Added template object
 */
export const addReminderTemplate = async (templateData) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.REMINDER_TEMPLATES)
      .insert([templateData])
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Error adding reminder template');
    throw error;
  }
};

/**
 * Update a reminder template
 * @param {string} id - Template id
 * @param {Object} templateData - Updated template data
 * @returns {Promise<Object>} - Updated template object
 */
export const updateReminderTemplate = async (id, templateData) => {
  try {
    const { data, error } = await supabase
      .from(TABLES.REMINDER_TEMPLATES)
      .update(templateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, `Error updating reminder template with id ${id}`);
    throw error;
  }
};

/**
 * Delete a reminder template
 * @param {string} id - Template id
 * @returns {Promise<Object>} - Success message
 */
export const deleteReminderTemplate = async (id) => {
  try {
    const { error } = await supabase
      .from(TABLES.REMINDER_TEMPLATES)
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }

    return { success: true, message: 'Reminder template deleted successfully' };
  } catch (error) {
    handleSupabaseError(error, `Error deleting reminder template with id ${id}`);
    throw error;
  }
};

/**
 * Get scheduled reminders
 * @param {Object} filters - Optional filters (patientId, appointmentId, etc.)
 * @returns {Promise<Array>} - Array of scheduled reminder objects
 */
export const getScheduledReminders = async (filters = {}) => {
  try {
    let query = supabase
      .from(TABLES.SCHEDULED_REMINDERS)
      .select('*, appointment:appointmentId(date, time, type, patientId, patientName)');
    
    // Apply filters if provided
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query.order('scheduledFor', { ascending: true });
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Error fetching scheduled reminders');
    throw error;
  }
};

/**
 * Get sent reminders
 * @param {Object} filters - Optional filters (patientId, appointmentId, etc.)
 * @returns {Promise<Array>} - Array of sent reminder objects
 */
export const getSentReminders = async (filters = {}) => {
  try {
    let query = supabase
      .from(TABLES.SENT_REMINDERS)
      .select('*, appointment:appointmentId(date, time, type, patientId, patientName)');
    
    // Apply filters if provided
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        query = query.eq(key, value);
      }
    });
    
    const { data, error } = await query.order('sentAt', { ascending: false });
    
    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    handleSupabaseError(error, 'Error fetching sent reminders');
    throw error;
  }
};

/**
 * Schedule appointment reminders
 * Creates automated reminders based on the clinic's configuration
 * @param {Object} appointment - Appointment data
 * @returns {Promise<Array>} - Array of scheduled reminder objects
 */
export const scheduleAppointmentReminders = async (appointment) => {
  try {
    // Get patient details for personalization
    const patient = await getPatientById(appointment.patientId);

    // Send email reminder using sendEmailReminder
    const subject = 'Appointment Reminder';
    const message = `Hi ${patient.name}, this is a reminder for your appointment on ${appointment.date} at ${appointment.time}.`;

    console.log('Sending email to:', patient.email, 'Subject:', subject, 'Message:', message);
    const emailResult = await sendEmailReminder(patient.email, subject, message);
    console.log('EmailJS response:', emailResult);

    // Optionally, return a status or saved reminder object
    return { success: true, emailResult };
  } catch (error) {
    handleSupabaseError(error, 'Error scheduling appointment reminders');
    throw error;
  }
};