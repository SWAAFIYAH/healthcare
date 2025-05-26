// src/components/PatientForm.jsx
import React, { useState, useEffect } from 'react';

const PatientForm = ({ patient, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    medicalHistory: '',
    allergies: '',
    medications: '',
    preferredReminderChannel: 'SMS',
    preferredLanguage: 'English',
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    notes: ''
  });
  
  // Form validation state
  const [errors, setErrors] = useState({});
  
  // Gender options
  const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say'];
  
  // Communication channel options
  const channelOptions = ['SMS', 'WhatsApp', 'Email', 'Phone Call'];
  
  // Language options
  const languageOptions = ['English', 'Spanish', 'French', 'Swahili', 'Arabic', 'Other'];
  
  // Populate form if editing a patient
  useEffect(() => {
    if (patient) {
      setFormData({
        ...formData,
        ...patient,
        emergencyContact: {
          ...formData.emergencyContact,
          ...(patient.emergencyContact || {})
        }
      });
    }
  }, [patient]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested emergency contact fields
    if (name.startsWith('emergency_')) {
      const field = name.replace('emergency_', '');
      setFormData({
        ...formData,
        emergencyContact: {
          ...formData.emergencyContact,
          [field]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
    
    // Clear error when field is changed
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Valid email is required';
      }
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else {
      const phoneRegex = /^\+?[0-9\s\-()]{10,15}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Valid phone number is required';
      }
    }
    
    if (!formData.preferredReminderChannel) {
      newErrors.preferredReminderChannel = 'Preferred reminder channel is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const mappedData = {
        ...formData,
        emergencyContactName: formData.emergencyContact.name,
        emergencyContactRelationship: formData.emergencyContact.relationship,
        emergencyContactPhone: formData.emergencyContact.phone,
        medicalHistory: Array.isArray(formData.medicalHistory)
        ? formData.medicalHistory
        : formData.medicalHistory
            .split(',')
            .map(item => item.trim())
            .filter(Boolean),
      };
      
      delete mappedData.emergencyContact;
      onSubmit(mappedData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">
        {patient ? 'Edit Patient Information' : 'Add New Patient'}
      </h2>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-medium mb-3">Basic Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-700">
              Full Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter full name"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          
          <div>
            <label htmlFor="dateOfBirth" className="block mb-1 text-sm font-medium text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          
          <div>
            <label htmlFor="gender" className="block mb-1 text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Select Gender</option>
              {genderOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-medium mb-3">Contact Information</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter email address"
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
          </div>
          
          <div>
            <label htmlFor="phone" className="block mb-1 text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter phone number"
            />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
          </div>
          
          <div className="sm:col-span-2">
            <label htmlFor="address" className="block mb-1 text-sm font-medium text-gray-700">
              Address
            </label>
            <textarea
              id="address"
              name="address"
              rows="2"
              value={formData.address}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter address"
            ></textarea>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-medium mb-3">Medical Information</h3>
        <div className="grid gap-4">
          <div>
            <label htmlFor="medicalHistory" className="block mb-1 text-sm font-medium text-gray-700">
              Medical History
            </label>
            <textarea
              id="medicalHistory"
              name="medicalHistory"
              rows="3"
              value={formData.medicalHistory}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter relevant medical history"
            ></textarea>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="allergies" className="block mb-1 text-sm font-medium text-gray-700">
                Allergies
              </label>
              <textarea
                id="allergies"
                name="allergies"
                rows="2"
                value={formData.allergies}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="List any allergies"
              ></textarea>
            </div>
            
            <div>
              <label htmlFor="medications" className="block mb-1 text-sm font-medium text-gray-700">
                Current Medications
              </label>
              <textarea
                id="medications"
                name="medications"
                rows="2"
                value={formData.medications}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                placeholder="List current medications"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-medium mb-3">Communication Preferences</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="preferredReminderChannel" className="block mb-1 text-sm font-medium text-gray-700">
              Preferred Reminder Method *
            </label>
            <select
              id="preferredReminderChannel"
              name="preferredReminderChannel"
              value={formData.preferredReminderChannel}
              onChange={handleChange}
              className={`w-full p-2 border rounded-md ${
                errors.preferredReminderChannel ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              {channelOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.preferredReminderChannel && (
              <p className="mt-1 text-xs text-red-500">{errors.preferredReminderChannel}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="preferredLanguage" className="block mb-1 text-sm font-medium text-gray-700">
              Preferred Language
            </label>
            <select
              id="preferredLanguage"
              name="preferredLanguage"
              value={formData.preferredLanguage}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              {languageOptions.map(option => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="font-medium mb-3">Emergency Contact</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="emergency_name" className="block mb-1 text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="emergency_name"
              name="emergency_name"
              value={formData.emergencyContact.name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Emergency contact name"
            />
          </div>
          
          <div>
            <label htmlFor="emergency_relationship" className="block mb-1 text-sm font-medium text-gray-700">
              Relationship
            </label>
            <input
              type="text"
              id="emergency_relationship"
              name="emergency_relationship"
              value={formData.emergencyContact.relationship}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Relationship to patient"
            />
          </div>
          
          <div>
            <label htmlFor="emergency_phone" className="block mb-1 text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="emergency_phone"
              name="emergency_phone"
              value={formData.emergencyContact.phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Emergency contact phone"
            />
          </div>
        </div>
      </div>
      
      <div>
        <label htmlFor="notes" className="block mb-1 text-sm font-medium text-gray-700">
          Additional Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          rows="3"
          value={formData.notes}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded-md"
          placeholder="Add any additional notes about the patient"
        ></textarea>
      </div>
      
      <div className="flex space-x-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          {patient ? 'Update Patient' : 'Add Patient'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

export default PatientForm;