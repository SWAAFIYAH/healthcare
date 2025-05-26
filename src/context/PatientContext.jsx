// src/context/PatientContext.jsx
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';

import supabase from '../services/supabaseClient';

// Create the patient context
export const PatientContext = createContext();

export const PatientProvider = ({ children }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all patients from Supabase
  const getPatients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('name');
      if (error) throw error;
      setPatients(data);
      return data;
    } catch (error) {
      setError('Failed to fetch patients');
      console.error('Error fetching patients:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get a single patient by ID
  const getPatientById = useCallback((patientId) => {
    return patients.find(patient => patient.id === patientId);
  }, [patients]);

  // Add a new patient to Supabase
  const addPatient = useCallback(async (patientData) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('patients')
        .insert([patientData])
        .select()
        .single();
      if (error) throw error;
      setPatients(prevPatients => [...prevPatients, data]);
      return data;
    } catch (error) {
      setError('Failed to add patient');
      console.error('Error adding patient:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Update an existing patient in Supabase
  const updatePatient = useCallback(async (patientId, patientData) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('patients')
        .update(patientData)
        .eq('id', patientId)
        .select()
        .single();
      if (error) throw error;
      setPatients(prevPatients =>
        prevPatients.map(patient =>
          patient.id === patientId ? data : patient
        )
      );
      return data;
    } catch (error) {
      setError('Failed to update patient');
      console.error('Error updating patient:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete a patient from Supabase
  const deletePatient = useCallback(async (patientId) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('patients')
        .delete()
        .eq('id', patientId);
      if (error) throw error;
      setPatients(prevPatients =>
        prevPatients.filter(patient => patient.id !== patientId)
      );
      return { success: true };
    } catch (error) {
      setError('Failed to delete patient');
      console.error('Error deleting patient:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  // Load patients on initial mount
  useEffect(() => {
    getPatients();
  }, [getPatients]);

  // Context value
  const value = {
    patients,
    loading,
    error,
    getPatients,
    getPatientById,
    addPatient,
    updatePatient,
    deletePatient
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

// Custom hook to use the patient context
export const usePatient = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
};