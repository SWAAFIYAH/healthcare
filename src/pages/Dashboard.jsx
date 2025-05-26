// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppointmentCard from '../components/AppointmentCard';
import { useAuth } from '../context/AuthContext';
import { useAppointment } from '../context/AppointmentContext';
import { usePatient } from '../context/PatientContext';
import { sendEmailReminder } from '../services/reminderService';
import { getReminderTemplateById } from '../services/reminderService'; 
import { getHospital, getAvailableDoctor } from '../services/hospitalService';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { appointments, getAppointments, updateAppointment } = useAppointment();
  const { patients, getPatients } = usePatient();
  
  const [stats, setStats] = useState({
    todayAppointments: 0,
    upcomingAppointments: 0,
    missedAppointments: 0,
    totalPatients: 0,
    remindersSent: 0
  });
  
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [recentPatients, setRecentPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch all appointments and patients data
        await getAppointments();
        await getPatients();
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [getAppointments, getPatients]);
  
  useEffect(() => {
    if (appointments.length > 0 && patients.length > 0) {
      // Calculate today's date (without time)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Filter appointments for today
      const appointmentsToday = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate.getTime() === today.getTime();
      });
      
      // Filter upcoming appointments (exclude today)
      const appointmentsUpcoming = appointments.filter(appointment => {
        const appointmentDate = new Date(appointment.date);
        appointmentDate.setHours(0, 0, 0, 0);
        return appointmentDate > today && appointment.status !== 'cancelled';
      });
      
      // Count missed appointments
      const appointmentsMissed = appointments.filter(
        appointment => appointment.status === 'no-show'
      ).length;
      
      // Enrich today's appointments with patient data
      const enrichedTodayAppointments = appointmentsToday.map(appointment => {
        const patient = patients.find(p => p.id === appointment.patientId);
        return {
          ...appointment,
          patientName: patient ? patient.name : 'Unknown Patient'
        };
      });
      
      // Sort today's appointments by time
      enrichedTodayAppointments.sort((a, b) => {
        return new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`);
      });
      
      // Get recent patients (patients with recent appointments)
      const recentAppointments = [...appointments]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 20); // Last 20 appointments
      
      const recentPatientIds = [...new Set(recentAppointments.map(a => a.patientId))];
      const recentPatientsList = patients
        .filter(patient => recentPatientIds.includes(patient.id))
        .slice(0, 5); // Top 5 recent patients
      
      // Update stats
      setStats({
        todayAppointments: appointmentsToday.length,
        upcomingAppointments: appointmentsUpcoming.length,
        missedAppointments: appointmentsMissed,
        totalPatients: patients.length,
        remindersSent: Math.floor(Math.random() * 50) + 10 // Mocked data for reminders sent
      });
      
      setTodayAppointments(enrichedTodayAppointments);
      setRecentPatients(recentPatientsList);
    }
  }, [appointments, patients]);
  
  const handleReschedule = (appointmentId) => {
    // For demo: Navigate to edit appointment page
    console.log('Reschedule appointment:', appointmentId);
    // Implementation will connect to appointment context/service
  };
  
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="pb-6 pt-16 md:pt-4">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 mb-1">Welcome back, {currentUser?.displayName || 'Doctor'}</h1>
        <p className="text-sm text-gray-600">Here's what's happening today</p>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-500">Today's Appointments</div>
            <div className="p-1.5 rounded-full bg-blue-50">
              <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-500">Upcoming</div>
            <div className="p-1.5 rounded-full bg-green-50">
              <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.upcomingAppointments}</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-500">Missed</div>
            <div className="p-1.5 rounded-full bg-red-50">
              <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.missedAppointments}</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-500">Total Patients</div>
            <div className="p-1.5 rounded-full bg-purple-50">
              <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z"></path>
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.totalPatients}</div>
        </div>
        
        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-500">Reminders Sent</div>
            <div className="p-1.5 rounded-full bg-yellow-50">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
              </svg>
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats.remindersSent}</div>
        </div>
      </div>
      
      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Appointments */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Today's Appointments</h2>
            <Link 
              to="/appointments" 
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              View All
            </Link>
          </div>
          
          {todayAppointments.length > 0 ? (
            <div className="space-y-4">
              {todayAppointments.map(appointment => (
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
              <h3 className="text-lg font-medium text-gray-800 mb-1">No appointments today</h3>
              <p className="text-gray-500 mb-3">You have no scheduled appointments for today.</p>
              <Link
                to="/appointments"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
              >
                Schedule Appointment
              </Link>
            </div>
          )}
        </div>
        
        {/* Quick Actions and Recent Patients */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h2>
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm divide-y divide-gray-200">
              <Link
                to="/appointments"
                className="flex items-center p-4 hover:bg-gray-50"
              >
                <div className="flex-shrink-0 mr-3 p-2 rounded-full bg-blue-50 text-blue-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800">New Appointment</div>
                  <div className="text-sm text-gray-500">Schedule an appointment</div>
                </div>
              </Link>
              
              <Link
                to="/patients"
                className="flex items-center p-4 hover:bg-gray-50"
              >
                <div className="flex-shrink-0 mr-3 p-2 rounded-full bg-green-50 text-green-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Add Patient</div>
                  <div className="text-sm text-gray-500">Register a new patient</div>
                </div>
              </Link>
              
              <Link
                to="/reminders"
                className="flex items-center p-4 hover:bg-gray-50"
              >
                <div className="flex-shrink-0 mr-3 p-2 rounded-full bg-yellow-50 text-yellow-700">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path>
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-gray-800">Manage Reminders</div>
                  <div className="text-sm text-gray-500">Create and send reminders</div>
                </div>
              </Link>
            </div>
          </div>
          
          {/* Recent Patients */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Patients</h2>
            {recentPatients.length > 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                <ul className="divide-y divide-gray-200">
                  {recentPatients.map(patient => (
                    <li key={patient.id}>
                      <Link
                        to={`/patients/${patient.id}`}
                        className="block hover:bg-gray-50 p-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-9 w-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                              {patient.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-800">{patient.name}</p>
                              <p className="text-xs text-gray-500">{patient.phone}</p>
                            </div>
                          </div>
                          <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                          </svg>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="bg-gray-50 px-4 py-3 text-center">
                  <Link
                    to="/patients"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View All Patients
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-6 border border-gray-200 text-center">
                <p>No recent patients.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;