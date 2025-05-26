// src/services/api.js

// This is a mock API service for development purposes
// In a real application, this would make actual API calls to a backend service

/**
 * Base API configuration
 */
const API_DELAY = 500; // Simulated API response delay in milliseconds

/**
 * Simulate an API call with the specified delay
 * @param {function} callback - Function that returns the response data
 * @returns {Promise} Promise that resolves with the response data
 */
const mockApiCall = async (callback) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  
  // Randomly fail some requests (uncomment for testing error handling)
  // if (Math.random() < 0.1) {
  //   throw new Error('API request failed');
  // }
  
  return callback();
};

/**
 * API methods for patients
 */
export const patientApi = {
  /**
   * Get all patients
   * @returns {Promise<Array>} List of patient objects
   */
  getAll: async () => {
    return mockApiCall(() => {
      const patients = localStorage.getItem('careRemindPatients');
      return patients ? JSON.parse(patients) : [];
    });
  },
  
  /**
   * Get a patient by ID
   * @param {string} id - Patient ID
   * @returns {Promise<Object>} Patient object
   */
  getById: async (id) => {
    return mockApiCall(() => {
      const patients = JSON.parse(localStorage.getItem('careRemindPatients') || '[]');
      const patient = patients.find(p => p.id === id);
      if (!patient) throw new Error(`Patient with ID ${id} not found`);
      return patient;
    });
  },
  
  /**
   * Create a new patient
   * @param {Object} patientData - Patient data
   * @returns {Promise<Object>} Created patient object
   */
  create: async (patientData) => {
    return mockApiCall(() => {
      const patients = JSON.parse(localStorage.getItem('careRemindPatients') || '[]');
      
      // Generate a unique ID
      const newId = `pat-${Date.now()}`;
      
      // Create new patient with defaults
      const newPatient = {
        id: newId,
        status: 'active',
        missedAppointments: 0,
        lastVisit: null,
        nextVisit: null,
        ...patientData
      };
      
      // Add to stored patients
      const updatedPatients = [...patients, newPatient];
      localStorage.setItem('careRemindPatients', JSON.stringify(updatedPatients));
      
      return newPatient;
    });
  },
  
  /**
   * Update an existing patient
   * @param {string} id - Patient ID
   * @param {Object} patientData - Updated patient data
   * @returns {Promise<Object>} Updated patient object
   */
  update: async (id, patientData) => {
    return mockApiCall(() => {
      const patients = JSON.parse(localStorage.getItem('careRemindPatients') || '[]');
      
      // Find patient index
      const patientIndex = patients.findIndex(p => p.id === id);
      if (patientIndex === -1) throw new Error(`Patient with ID ${id} not found`);
      
      // Update patient data
      const updatedPatient = { ...patients[patientIndex], ...patientData };
      patients[patientIndex] = updatedPatient;
      
      // Save updated list
      localStorage.setItem('careRemindPatients', JSON.stringify(patients));
      
      return updatedPatient;
    });
  },
  
  /**
   * Delete a patient
   * @param {string} id - Patient ID
   * @returns {Promise<Object>} Result of the operation
   */
  delete: async (id) => {
    return mockApiCall(() => {
      const patients = JSON.parse(localStorage.getItem('careRemindPatients') || '[]');
      
      // Filter out the patient with the given ID
      const updatedPatients = patients.filter(p => p.id !== id);
      
      if (patients.length === updatedPatients.length) {
        throw new Error(`Patient with ID ${id} not found`);
      }
      
      // Save updated list
      localStorage.setItem('careRemindPatients', JSON.stringify(updatedPatients));
      
      return { success: true, message: 'Patient deleted successfully' };
    });
  }
};

/**
 * API methods for appointments
 */
export const appointmentApi = {
  /**
   * Get all appointments
   * @returns {Promise<Array>} List of appointment objects
   */
  getAll: async () => {
    return mockApiCall(() => {
      const appointments = localStorage.getItem('careRemindAppointments');
      return appointments ? JSON.parse(appointments) : [];
    });
  },
  
  /**
   * Get appointments for a specific patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array>} List of appointment objects
   */
  getByPatientId: async (patientId) => {
    return mockApiCall(() => {
      const appointments = JSON.parse(localStorage.getItem('careRemindAppointments') || '[]');
      return appointments.filter(a => a.patientId === patientId);
    });
  },
  
  /**
   * Get an appointment by ID
   * @param {string} id - Appointment ID
   * @returns {Promise<Object>} Appointment object
   */
  getById: async (id) => {
    return mockApiCall(() => {
      const appointments = JSON.parse(localStorage.getItem('careRemindAppointments') || '[]');
      const appointment = appointments.find(a => a.id === id);
      if (!appointment) throw new Error(`Appointment with ID ${id} not found`);
      return appointment;
    });
  },
  
  /**
   * Create a new appointment
   * @param {Object} appointmentData - Appointment data
   * @returns {Promise<Object>} Created appointment object
   */
  create: async (appointmentData) => {
    return mockApiCall(() => {
      const appointments = JSON.parse(localStorage.getItem('careRemindAppointments') || '[]');
      
      // Generate a unique ID
      const newId = `apt-${Date.now()}`;
      
      // Create new appointment with defaults
      const newAppointment = {
        id: newId,
        status: 'upcoming',
        ...appointmentData
      };
      
      // Add to stored appointments
      const updatedAppointments = [...appointments, newAppointment];
      localStorage.setItem('careRemindAppointments', JSON.stringify(updatedAppointments));
      
      return newAppointment;
    });
  },
  
  /**
   * Update an existing appointment
   * @param {string} id - Appointment ID
   * @param {Object} appointmentData - Updated appointment data
   * @returns {Promise<Object>} Updated appointment object
   */
  update: async (id, appointmentData) => {
    return mockApiCall(() => {
      const appointments = JSON.parse(localStorage.getItem('careRemindAppointments') || '[]');
      
      // Find appointment index
      const appointmentIndex = appointments.findIndex(a => a.id === id);
      if (appointmentIndex === -1) throw new Error(`Appointment with ID ${id} not found`);
      
      // Update appointment data
      const updatedAppointment = { ...appointments[appointmentIndex], ...appointmentData };
      appointments[appointmentIndex] = updatedAppointment;
      
      // Save updated list
      localStorage.setItem('careRemindAppointments', JSON.stringify(appointments));
      
      return updatedAppointment;
    });
  },
  
  /**
   * Delete an appointment
   * @param {string} id - Appointment ID
   * @returns {Promise<Object>} Result of the operation
   */
  delete: async (id) => {
    return mockApiCall(() => {
      const appointments = JSON.parse(localStorage.getItem('careRemindAppointments') || '[]');
      
      // Filter out the appointment with the given ID
      const updatedAppointments = appointments.filter(a => a.id !== id);
      
      if (appointments.length === updatedAppointments.length) {
        throw new Error(`Appointment with ID ${id} not found`);
      }
      
      // Save updated list
      localStorage.setItem('careRemindAppointments', JSON.stringify(updatedAppointments));
      
      return { success: true, message: 'Appointment deleted successfully' };
    });
  }
};

/**
 * API methods for reminders
 */
export const reminderApi = {
  /**
   * Get all reminder templates
   * @returns {Promise<Array>} List of reminder template objects
   */
  getTemplates: async () => {
    return mockApiCall(() => {
      const templates = localStorage.getItem('careRemindTemplates');
      return templates ? JSON.parse(templates) : [];
    });
  },
  
  /**
   * Create a new reminder template
   * @param {Object} templateData - Template data
   * @returns {Promise<Object>} Created template object
   */
  createTemplate: async (templateData) => {
    return mockApiCall(() => {
      const templates = JSON.parse(localStorage.getItem('careRemindTemplates') || '[]');
      
      // Generate a unique ID
      const newId = `tmpl-${Date.now()}`;
      
      // Create new template
      const newTemplate = {
        id: newId,
        ...templateData
      };
      
      // Add to stored templates
      const updatedTemplates = [...templates, newTemplate];
      localStorage.setItem('careRemindTemplates', JSON.stringify(updatedTemplates));
      
      return newTemplate;
    });
  },
  
  /**
   * Update a reminder template
   * @param {string} id - Template ID
   * @param {Object} templateData - Updated template data
   * @returns {Promise<Object>} Updated template object
   */
  updateTemplate: async (id, templateData) => {
    return mockApiCall(() => {
      const templates = JSON.parse(localStorage.getItem('careRemindTemplates') || '[]');
      
      // Find template index
      const templateIndex = templates.findIndex(t => t.id === id);
      if (templateIndex === -1) throw new Error(`Template with ID ${id} not found`);
      
      // Update template data
      const updatedTemplate = { ...templates[templateIndex], ...templateData };
      templates[templateIndex] = updatedTemplate;
      
      // Save updated list
      localStorage.setItem('careRemindTemplates', JSON.stringify(templates));
      
      return updatedTemplate;
    });
  },
  
  /**
   * Delete a reminder template
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Result of the operation
   */
  deleteTemplate: async (id) => {
    return mockApiCall(() => {
      const templates = JSON.parse(localStorage.getItem('careRemindTemplates') || '[]');
      
      // Filter out the template with the given ID
      const updatedTemplates = templates.filter(t => t.id !== id);
      
      if (templates.length === updatedTemplates.length) {
        throw new Error(`Template with ID ${id} not found`);
      }
      
      // Save updated list
      localStorage.setItem('careRemindTemplates', JSON.stringify(updatedTemplates));
      
      return { success: true, message: 'Template deleted successfully' };
    });
  },
  
  /**
   * Schedule a reminder (mock implementation)
   * @param {Object} reminderData - Reminder data
   * @returns {Promise<Object>} Scheduled reminder object
   */
  scheduleReminder: async (reminderData) => {
    return mockApiCall(() => {
      const reminders = JSON.parse(localStorage.getItem('careRemindScheduledReminders') || '[]');
      
      // Generate a unique ID
      const newId = `rem-${Date.now()}`;
      
      // Create new reminder
      const newReminder = {
        id: newId,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
        ...reminderData
      };
      
      // Add to stored reminders
      const updatedReminders = [...reminders, newReminder];
      localStorage.setItem('careRemindScheduledReminders', JSON.stringify(updatedReminders));
      
      return newReminder;
    });
  },
  
  /**
   * Cancel a scheduled reminder
   * @param {string} id - Reminder ID
   * @returns {Promise<Object>} Result of the operation
   */
  cancelReminder: async (id) => {
    return mockApiCall(() => {
      const reminders = JSON.parse(localStorage.getItem('careRemindScheduledReminders') || '[]');
      
      // Find reminder index
      const reminderIndex = reminders.findIndex(r => r.id === id);
      if (reminderIndex === -1) throw new Error(`Reminder with ID ${id} not found`);
      
      // Update reminder status
      reminders[reminderIndex] = { ...reminders[reminderIndex], status: 'cancelled' };
      
      // Save updated list
      localStorage.setItem('careRemindScheduledReminders', JSON.stringify(reminders));
      
      return { success: true, message: 'Reminder cancelled successfully' };
    });
  },
  
  /**
   * Send an immediate reminder (mock implementation)
   * @param {Object} reminderData - Reminder data
   * @returns {Promise<Object>} Sent reminder object
   */
  sendImmediate: async (reminderData) => {
    return mockApiCall(() => {
      const sentReminders = JSON.parse(localStorage.getItem('careRemindSentReminders') || '[]');
      
      // Generate a unique ID
      const newId = `rem-${Date.now()}`;
      
      // Create new sent reminder
      const newReminder = {
        id: newId,
        status: 'sent',
        sentAt: new Date().toISOString(),
        ...reminderData
      };
      
      // Add to sent reminders
      const updatedSentReminders = [...sentReminders, newReminder];
      localStorage.setItem('careRemindSentReminders', JSON.stringify(updatedSentReminders));
      
      return newReminder;
    });
  }
};

/**
 * API methods for authentication
 */
export const authApi = {
  /**
   * Login a user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User object
   */
  login: async (email, password) => {
    return mockApiCall(() => {
      // For demo purposes only - in a real app, this would validate credentials on the server
      if (email === 'demo@careremind.com' && password === 'demo123') {
        const user = {
          id: 'user-demo',
          name: 'Demo User',
          email: 'demo@careremind.com',
          role: 'admin'
        };
        return user;
      }
      
      // Example user for testing
      if (email === 'user@example.com' && password === 'password123') {
        const user = {
          id: 'user-123',
          name: 'Test User',
          email: 'user@example.com',
          role: 'user'
        };
        return user;
      }
      
      throw new Error('Invalid email or password');
    });
  },
  
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Created user object
   */
  register: async (userData) => {
    return mockApiCall(() => {
      // For demo purposes, just return a new user object
      // In a real app, this would create a user in the database
      const { email, name, password } = userData;
      
      return {
        id: `user-${Date.now()}`,
        name,
        email,
        role: 'user'
      };
    });
  },
  
  /**
   * Update user profile
   * @param {string} userId - User ID
   * @param {Object} userData - Updated user data
   * @returns {Promise<Object>} Updated user object
   */
  updateProfile: async (userId, userData) => {
    return mockApiCall(() => {
      // Mock implementation
      return {
        id: userId,
        ...userData
      };
    });
  },
  
  /**
   * Change user password
   * @param {string} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Result of the operation
   */
  changePassword: async (userId, currentPassword, newPassword) => {
    return mockApiCall(() => {
      // Mock password validation
      if (currentPassword !== 'password123' && currentPassword !== 'demo123') {
        throw new Error('Current password is incorrect');
      }
      
      return { success: true, message: 'Password changed successfully' };
    });
  },
  
  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>} Result of the operation
   */
  requestPasswordReset: async (email) => {
    return mockApiCall(() => {
      // Mock implementation
      return { success: true, message: 'Password reset instructions sent to your email' };
    });
  }
};