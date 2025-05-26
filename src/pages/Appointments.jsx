// src/pages/Appointments.jsx
import React, { useState, useEffect } from 'react';
import AppointmentCard from '../components/AppointmentCard';
import AppointmentForm from '../components/AppointmentForm';
import { useAppointment } from '../context/AppointmentContext';
import { usePatient } from '../context/PatientContext';
import { format, parseISO, isToday, isFuture, isPast, addDays } from 'date-fns';
import { sendEmailReminder } from '../services/reminderService';
import { getReminderTemplateById } from '../services/reminderService'; 
import { getHospital, getAvailableDoctor } from '../services/hospitalService';
import supabase from '../services/supabaseClient';

const Appointments = () => {
  const { appointments, getAppointments, addAppointment, updateAppointment, deleteAppointment } = useAppointment();
  const { patients, getPatients } = usePatient();
  
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [viewMode, setViewMode] = useState('upcoming');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [selectedDate, setSelectedDate] = useState('');
  
  // Fetch appointments and patients on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await getAppointments();
        await getPatients();
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [getAppointments, getPatients]);
  
  // Handle adding a new appointment
  const handleAddAppointment = async (appointmentData) => {
    try {
      // Only save patientId and not patientName
      const enrichedData = {
        ...appointmentData,
        status: 'upcoming'
      };
      await addAppointment(enrichedData);
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding appointment:', error);
    }
  };
  
  // Handle updating an appointment
  const handleUpdateAppointment = async (appointmentData) => {
    try {
      await updateAppointment(appointmentData.id, appointmentData);
      setEditingAppointment(null);
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  };
  
  // Handle rescheduling an appointment
  const handleReschedule = (appointmentId) => {
    const appointment = appointments.find(a => a.id === appointmentId);
    setEditingAppointment(appointment);
  };
  
  // // Handle canceling an appointment
  // const handleCancel = async (appointmentId) => {
  //   try {
  //     await updateAppointment(appointmentId, { status: 'cancelled' });
  //     alert('Appointment cancelled successfully');
  //   } catch (error) {
  //     console.error('Error cancelling appointment:', error);
  //     alert('Failed to cancel appointment');
  //   }
  // };

  const handleChangeStatus = async (appointmentId, newStatus) => {
    // Update in database (optional)
    await updateAppointment(appointmentId, { status: newStatus });
  };
  
  // Handle sending a reminder
  const handleSendReminder = async (appointmentId) => {
    try {
      const appointment = appointments.find(a => a.id === appointmentId);
      if (!appointment) {
        alert('Appointment not found');
        return;
      }
      const patient = patients.find(p => p.id === appointment.patientId);
      if (!patient || !patient.email) {
        alert('Patient email not found.');
        return;
      }

      const hospital = await getHospital();

      // Fetch available doctor for this appointment time
      const doctor = await getAvailableDoctor(appointment.date, appointment.time);

      // Fetch the reminder template by ID
      const templateId = '22105d37-75bb-4081-bf81-3cc3d328dd38';
      const template = await getReminderTemplateById(templateId);
      if (!template || !template.message) {
        alert('Reminder template not found.');
        return;
      }

      // Replace variables in the template message
      const message = template.message
        .replace(/{{\s*doctorName\s*}}/gi, doctor.doctorname)
        .replace(/{{\s*appointment_date\s*}}/gi, appointment.date)
        .replace(/{{\s*time\s*}}/gi, appointment.time)
        .replace(/{{\s*clinicPhone\s*}}/gi, hospital.phone);

      const subject = template.subject || 'Appointment Reminder';
      // const message = `Hi ${patient.name}, this is a reminder for your appointment on ${appointment.date} at ${appointment.time}.`;
      await sendEmailReminder(patient.email, subject, message);
      alert('Reminder sent successfully');
      console.log('Send reminder for appointment:', appointmentId, 'Email sent to:', patient.email);
    } catch (error) {
      alert('Failed to send reminder');
      console.error('Failed to send reminder:', error);
    }
  };
  
  // Filter appointments based on view mode, search term, and date filter
  const getFilteredAppointments = () => {
    // Start with all appointments
    let filtered = [...appointments];
    
    // Enrich with patient data for display only (do not save patientName in DB)
    filtered = filtered.map(appointment => {
      const patient = patients.find(p => p.id === appointment.patientId);
      return {
        ...appointment,
        patientName: patient ? patient.name : 'Unknown Patient'
      };
    });
    
    // Apply view mode filter
    if (viewMode === 'upcoming') {
      filtered = filtered.filter(appointment => 
        (appointment.status === 'upcoming' || appointment.status === 'rescheduled') &&
        isFuture(new Date(`${appointment.date}T${appointment.time}`))
      );
    } else if (viewMode === 'today') {
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() === today.getTime();
      });
    } else if (viewMode === 'past') {
      filtered = filtered.filter(appointment => 
        isPast(new Date(`${appointment.date}T${appointment.time}`)) && 
        appointment.status !== 'upcoming'
      );
    } else if (viewMode === 'cancelled') {
      filtered = filtered.filter(appointment => appointment.status === 'cancelled');
    }
    
    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(appointment => 
        appointment.patientName.toLowerCase().includes(term) ||
        appointment.type.toLowerCase().includes(term)
      );
    }
    
    // Apply date filter
    if (dateFilter === 'today') {
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() === today.getTime();
      });
    } else if (dateFilter === 'tomorrow') {
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        const tomorrow = addDays(new Date(), 1);
        tomorrow.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() === tomorrow.getTime();
      });
    } else if (dateFilter === 'this-week') {
      const today = new Date();
      const nextWeek = addDays(today, 7);
      filtered = filtered.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        return appointmentDate >= today && appointmentDate < nextWeek;
      });
    } else if (dateFilter === 'specific' && selectedDate) {
      filtered = filtered.filter(appointment => {
        return appointment.date === selectedDate;
      });
    }
    
    // Sort by date and time
    return filtered.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA - dateB;
    });
  };
  
  const filteredAppointments = getFilteredAppointments();
  
  // Count upcoming appointments
  const upcomingAppointmentsCount = appointments.filter(appointment => 
    (appointment.status === 'upcoming' || appointment.status === 'rescheduled') &&
    isFuture(new Date(`${appointment.date}T${appointment.time}`))
  ).length;
  
  // Count today's appointments
  const todayAppointmentsCount = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    appointmentDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return appointmentDate.getTime() === today.getTime();
  }).length;
  
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
          <h1 className="text-2xl font-semibold text-gray-800">Appointments</h1>
          <p className="text-sm text-gray-600">
            {upcomingAppointmentsCount} upcoming • {todayAppointmentsCount} today
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
          </svg>
          Schedule Appointment
        </button>
      </div>
      
      {/* Filters and tabs */}
      <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap">
            <button
              onClick={() => setViewMode('upcoming')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                viewMode === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setViewMode('today')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                viewMode === 'today'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setViewMode('past')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                viewMode === 'past'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Past
            </button>
            <button
              onClick={() => setViewMode('cancelled')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                viewMode === 'cancelled'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cancelled
            </button>
          </nav>
        </div>
        
        {/* Search and filter controls */}
        <div className="p-4 flex flex-wrap gap-4">
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
                placeholder="Search by patient name or appointment type..."
              />
            </div>
          </div>
          
          <div className="min-w-[200px]">
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <select
              id="dateFilter"
              name="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="tomorrow">Tomorrow</option>
              <option value="this-week">This Week</option>
              <option value="specific">Specific Date</option>
            </select>
          </div>
          
          {dateFilter === 'specific' && (
            <div className="min-w-[200px]">
              <label htmlFor="selectedDate" className="block text-sm font-medium text-gray-700 mb-1">Select Date</label>
              <input
                id="selectedDate"
                name="selectedDate"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          )}
        </div>
      </div>
      
      {/* Appointment list */}
      {filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map(appointment => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              onReschedule={handleReschedule}
              onChangeStatus={handleChangeStatus}
              onSendReminder={handleSendReminder}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
          <h3 className="text-lg font-medium text-gray-800 mb-1">No appointments found</h3>
          <p className="text-gray-500 mb-3">
            {searchTerm || dateFilter !== 'all' ? 
              'Try adjusting your search or filters.' : 
              'Schedule your first appointment to get started.'}
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Schedule Appointment
          </button>
        </div>
      )}
      
      {/* Add appointment modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Schedule New Appointment</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <AppointmentForm 
                patients={patients}
                onSubmit={handleAddAppointment} 
                onCancel={() => setShowAddForm(false)}
              />
            </div>
          </div>
        </div>
      )}
      
      {/* Edit appointment modal */}
      {editingAppointment && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Reschedule Appointment</h2>
                <button
                  onClick={() => setEditingAppointment(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              <AppointmentForm 
                appointment={editingAppointment}
                patients={patients}
                onSubmit={handleUpdateAppointment} 
                onCancel={() => setEditingAppointment(null)}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;