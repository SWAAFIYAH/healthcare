// src/context/AppointmentContext.jsx
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import supabase from '../services/supabaseClient';
import { getPatientById } from '../context/ReminderContext';
import { sendEmailReminder } from '../services/reminderService';

export const AppointmentContext = createContext();

export const AppointmentProvider = ({ children }) => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all appointments from Supabase
  const getAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: false });
      if (error) throw error;
      setAppointments(data);
      return data;
    } catch (error) {
      setError('Failed to fetch appointments');
      console.error('Error fetching appointments:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get appointments for a specific patient
  const getAppointmentsByPatient = useCallback((patientId) => {
    return appointments.filter(appointment => appointment.patientId === patientId);
  }, [appointments]);

  // Get a single appointment by ID
  const getAppointmentById = useCallback((appointmentId) => {
    return appointments.find(appointment => appointment.id === appointmentId);
  }, [appointments]);

  // Add a new appointment to Supabase
  const addAppointment = useCallback(async (appointmentData) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert([appointmentData])
        .select()
        .single();
      if (error) throw error;
      setAppointments(prevAppointments => [...prevAppointments, data]);

      console.log('Appointment added:', data);
      console.log('Appointment data:', appointmentData);
      console.log('Patient email:', data.patientEmail);

      // --- Reminder logic here ---
      if (appointmentData.sendReminder && data?.patientId) {
        try {
          const patient = await getPatientById(data.patientId);
          const patientEmail = patient?.email;
          console.log('Fetched patient:', patient);
          console.log('Patient email found:', patientEmail);
          if (patientEmail) {
            const subject = 'Appointment Reminder';
            const message = `Hi, this is a reminder for your appointment on ${data.date} at ${data.time}.`;
            await sendEmailReminder(patientEmail, subject, message);
            console.log('Email reminder sent to', patientEmail);
          } else {
            console.error('No patient email found for patientId:', data.patientId);
          }
        } catch (reminderError) {
          console.error('Failed to send email reminder:', reminderError);
        }
      } else {
        console.error('Failed to send email reminder: sendEmailReminder is false or patientId is missing');
        console.log('Patient email:', data?.patientEmail);
      }
      // --- End reminder logic ---

      return data;
    } catch (error) {
      setError('Failed to add appointment');
      console.error('Error adding appointment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing appointment in Supabase
  const updateAppointment = useCallback(async (appointmentId, appointmentData) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .update(appointmentData)
        .eq('id', appointmentId)
        .select()
        .single();
      if (error) throw error;
      setAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentId ? data : appointment
        )
      );

      if (appointmentData.sendReminder && data?.patientId) {
        try {
          const patient = await getPatientById(data.patientId);
          const patientEmail = patient?.email;
          console.log('Fetched patient:', patient);
          console.log('Patient email found:', patientEmail);
          if (patientEmail) {
            const subject = 'Appointment Reminder';
            const message = `Hi, this is a reminder for your appointment on ${data.date} at ${data.time}.`;
            await sendEmailReminder(patientEmail, subject, message);
            console.log('Email reminder sent to', patientEmail);
          } else {
            console.error('No patient email found for patientId:', data.patientId);
          }
        } catch (reminderError) {
          console.error('Failed to send email reminder:', reminderError);
        }
      } else {
        console.error('Failed to send email reminder: sendEmailReminder is false or patientId is missing');
        console.log('Patient email:', data?.patientEmail);
      }
      
      return data;
    } catch (error) {
      setError('Failed to update appointment');
      console.error('Error updating appointment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete an appointment from Supabase
  const deleteAppointment = useCallback(async (appointmentId) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId);
      if (error) throw error;
      setAppointments(prevAppointments =>
        prevAppointments.filter(appointment => appointment.id !== appointmentId)
      );
      return { success: true };
    } catch (error) {
      setError('Failed to delete appointment');
      console.error('Error deleting appointment:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load appointments on initial mount
  useEffect(() => {
    getAppointments();
  }, [getAppointments]);

  // Context value
  const value = {
    appointments,
    loading,
    error,
    getAppointments,
    getAppointmentsByPatient,
    getAppointmentById,
    addAppointment,
    updateAppointment,
    deleteAppointment
  };

  return (
    <AppointmentContext.Provider value={value}>
      {children}
    </AppointmentContext.Provider>
  );
};

// Custom hook to use the appointment context
export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (context === undefined) {
    throw new Error('useAppointment must be used within an AppointmentProvider');
  }
  return context;
};