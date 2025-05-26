import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PatientCard from '../components/PatientCard';
import PatientForm from '../components/PatientForm';
import { usePatient } from '../context/PatientContext';
import { useAppointment } from '../context/AppointmentContext';
import { sendEmailReminder } from '../services/reminderService';
import { computeVisitsForPatient } from '../utils/visitUtils';

const Patients = () => {
  const { patients, getPatients, addPatient, updatePatient, deletePatient } = usePatient();
  const { appointments, getAppointments } = useAppointment();

  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');

  // Fetch all patients and appointments on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await getPatients();
        await getAppointments();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getPatients, getAppointments]);

  // Compute visits for each patient
  const patientsWithVisits = patients.map(patient => {
    const visits = computeVisitsForPatient(appointments, patient.id);
    return {
      ...patient,
      lastvisit: visits.lastvisit,
      nextvisit: visits.nextvisit,
      nextvisitTime: visits.nextvisitTime,
    };
  });

  // Handle adding a new patient
  const handleAddPatient = async (patientData) => {
    try {
      await addPatient(patientData);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding patient:', error);
    }
  };

  // Handle updating a patient
  const handleUpdatePatient = async (patientData) => {
    try {
      await updatePatient(patientData.id, patientData);
      setEditingPatient(null);
    } catch (error) {
      console.error('Error updating patient:', error);
    }
  };

  // Handle view patient details
  const handleViewPatient = (patientId) => {
    const patient = patientsWithVisits.find(p => p.id === patientId);
    setEditingPatient(patient);
  };

  // Handle scheduling an appointment for a patient
  const handleScheduleAppointment = (patientId) => {
    // Navigate to appointments page with the selected patient
    // This would be implemented with react-router
    console.log('Schedule appointment for patient:', patientId);
  };

  // Handle sending a reminder to a patient
  const handleSendReminder = async (patientId) => {
    const patient = patientsWithVisits.find(p => p.id === patientId);
    if (!patient) {
      alert('Patient not found');
      return;
    }

    if (patient.nextvisit) {
      try {
        const subject = 'Upcoming Appointment Reminder';
        const message = `Hi ${patient.name}, this is a reminder for your upcoming appointment scheduled on ${patient.nextvisit}${patient.nextvisitTime ? ' at ' + patient.nextvisitTime : ''}.`;
        await sendEmailReminder(patient.email, subject, message);
        alert('Message sent successfully');
      } catch (error) {
        alert('Failed to send message');
      }
    } else {
      alert('The patient has no upcoming visits');
    }
  };

  // Filter patients based on search term and risk filter
  const filteredPatients = patientsWithVisits.filter(patient => {
    // Search filter
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (patient.phone && patient.phone.includes(searchTerm)) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase()));

    // Risk filter
    if (riskFilter === 'all') {
      return matchesSearch;
    }

    const missedAppointments = patient.missedAppointments || 0;

    if (riskFilter === 'high' && missedAppointments >= 3) {
      return matchesSearch;
    }

    if (riskFilter === 'medium' && missedAppointments >= 1 && missedAppointments < 3) {
      return matchesSearch;
    }

    if (riskFilter === 'low' && missedAppointments < 1) {
      return matchesSearch;
    }

    return false;
  });

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="pb-6 pt-16 md:pt-4">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Patients</h1>
          <p className="text-sm text-gray-600">{patients.length} total patients</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
          </svg>
          Add Patient
        </button>
      </div>

      {/* Search and filter controls */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-4">
        <div className="flex-1 min-w-[240px]">
          <label htmlFor="search" className="sr-only">Search</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
              </svg>
            </div>
            <input
              id="search"
              name="search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search patients by name, email or phone..."
            />
          </div>
        </div>

        <div className="min-w-[200px]">
          <label htmlFor="riskFilter" className="block text-sm font-medium text-gray-700 mb-1">Risk Level</label>
          <select
            id="riskFilter"
            name="riskFilter"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="all">All Patients</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Patient list */}
      {filteredPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map(patient => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onView={handleViewPatient}
              onSchedule={handleScheduleAppointment}
              onSendReminder={handleSendReminder}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No patients found</h3>
          <p className="text-gray-500 mb-3">
            {searchTerm || riskFilter !== 'all' ?
              'Try adjusting your search or filters.' :
              'Add your first patient to get started.'}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Add Patient
          </button>
        </div>
      )}

      {/* Add patient modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Add New Patient</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <PatientForm
                onSubmit={handleAddPatient}
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit patient modal */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Edit Patient</h2>
                <button
                  onClick={() => setEditingPatient(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <PatientForm
                patient={editingPatient}
                onSubmit={handleUpdatePatient}
                onCancel={() => setEditingPatient(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;