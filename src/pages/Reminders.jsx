// src/pages/Reminders.jsx
import React, { useState, useEffect } from 'react';
import ReminderTemplate from '../components/ReminderTemplate';
import supabase from '../services/supabaseClient';

const Reminders = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('reminder_templates')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching templates:', error);
        setTemplates([]);
      } else {
        setTemplates(data);
      }
      setLoading(false);
    };
    fetchTemplates();
  }, []);
  
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    type: 'custom',
    message: '',
    active: false
  });
  
  const [settings, setSettings] = useState({
    sendAppointmentReminders: true,
    reminderHours: 24,
    sendFollowUps: true,
    followUpDays: 7,
    sendMissedAppointments: true
  });
  
  // Function to handle editing a template
  // const handleEditTemplate = (templateId) => {
  //   const template = templates.find(t => t.id === templateId);
  //   if (template) {
  //     setEditingTemplate({ ...template });
  //   }
  // };

  const handleEditTemplate = async () => {
  if (!editingTemplate) return;
    const { data, error } = await supabase
      .from('reminder_templates')
      .update({
        name: editingTemplate.name,
        type: editingTemplate.type,
        message: editingTemplate.message,
        active: editingTemplate.active
      })
      .eq('id', editingTemplate.id)
      .select()
      .single();
    if (!error) {
      setTemplates(prev =>
        prev.map(template =>
          template.id === editingTemplate.id ? data : template
        )
      );
      setEditingTemplate(null);
    } else {
      alert('Failed to update template');
      console.error('Error updating template:', error);
    }
  };
  
  // Function to update a template
  const handleUpdateTemplate = async () => {
    if (!editingTemplate) return;
    const { data, error } = await supabase
      .from('reminder_templates')
      .update(editingTemplate)
      .eq('id', editingTemplate.id)
      .select()
      .single();
    if (!error) {
      setTemplates(prev =>
        prev.map(template =>
          template.id === editingTemplate.id ? data : template
        )
      );
      setEditingTemplate(null);
    }
  };

  const handleDeleteTemplate = async (templateId) => {
    const { error } = await supabase
      .from('reminder_templates')
      .delete()
      .eq('id', templateId);
    if (!error) {
      setTemplates(prev => prev.filter(t => t.id !== templateId));
    }
  };
  
  // Function to handle template activation toggle
  const toggleTemplateActive = (templateId) => {
    setTemplates(prevTemplates => 
      prevTemplates.map(template => 
        template.id === templateId ? { ...template, active: !template.active } : template
      )
    );
  };
  
  // Function to handle adding a new template
  const handleAddTemplate = async () => {
    const { data, error } = await supabase
      .from('reminder_templates')
      .insert([newTemplate])
      .select()
      .single();
    if (!error) {
      setTemplates(prev => [data, ...prev]);
      setShowAddForm(false);
      setNewTemplate({ name: '', type: 'custom', message: '', active: false });
    }
  };

  const handleToggleTemplateActive = async (templateId, newActive) => {
    const { data, error } = await supabase
      .from('reminder_templates')
      .update({ active: newActive })
      .eq('id', templateId)
      .select()
      .single();
    if (!error) {
      setTemplates(prev =>
        prev.map(template =>
          template.id === templateId ? data : template
        )
      );
    } else {
      alert('Failed to update template status');
      console.error('Error updating template status:', error);
    }
  };
  
  // Function to handle updating settings
  const handleUpdateSettings = () => {
    // In a real app, this would save to a database
    console.log('Settings updated:', settings);
    alert('Reminder settings updated successfully');
  };
  
  return (
    <div className="pb-6 pt-16 md:pt-4">
      {/* Page header */}
      <div className="mb-6 flex flex-wrap justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Reminders</h1>
          <p className="text-sm text-gray-600">Manage reminder templates and settings</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition flex items-center"
        >
          <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
          </svg>
          New Template
        </button>
      </div>
      
      {/* Templates section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-800">Reminder Templates</h2>
        </div>
        
        <div className="p-4">
          {templates.length > 0 ? (
            <div className="space-y-4">
              {templates.map(template => (
                <ReminderTemplate
                  key={template.id}
                  template={template}
                  onEdit={(tpl) => setEditingTemplate(tpl)}
                  onToggleActive={handleToggleTemplateActive}
                  onDelete={handleDeleteTemplate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No reminder templates found.</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Reminder Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-medium text-gray-800">Reminder Settings</h2>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Appointment Reminders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">Appointment Reminders</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.sendAppointmentReminders} 
                  onChange={() => setSettings(prev => ({ ...prev, sendAppointmentReminders: !prev.sendAppointmentReminders }))} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-600">
                  {settings.sendAppointmentReminders ? 'On' : 'Off'}
                </span>
              </label>
            </div>
            
            {settings.sendAppointmentReminders && (
              <div className="ml-6 flex items-center">
                <span className="text-gray-700 mr-4">Send reminders</span>
                <select
                  value={settings.reminderHours}
                  onChange={(e) => setSettings(prev => ({ ...prev, reminderHours: Number(e.target.value) }))}
                  className="block w-28 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value={24}>24 hours</option>
                  <option value={48}>48 hours</option>
                  <option value={72}>72 hours</option>
                </select>
                <span className="text-gray-700 ml-4">before the appointment</span>
              </div>
            )}
          </div>
          
          {/* Follow-Up Reminders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">Follow-Up Reminders</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.sendFollowUps} 
                  onChange={() => setSettings(prev => ({ ...prev, sendFollowUps: !prev.sendFollowUps }))} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-600">
                  {settings.sendFollowUps ? 'On' : 'Off'}
                </span>
              </label>
            </div>
            
            {settings.sendFollowUps && (
              <div className="ml-6 flex items-center">
                <span className="text-gray-700 mr-4">Send follow-ups after</span>
                <select
                  value={settings.followUpDays}
                  onChange={(e) => setSettings(prev => ({ ...prev, followUpDays: Number(e.target.value) }))}
                  className="block w-28 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value={7}>7 days</option>
                  <option value={14}>14 days</option>
                  <option value={30}>30 days</option>
                </select>
                <span className="text-gray-700 ml-4">without activity</span>
              </div>
            )}
          </div>
          
          {/* Missed Appointment Reminders */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">Missed Appointment Reminders</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.sendMissedAppointments} 
                  onChange={() => setSettings(prev => ({ ...prev, sendMissedAppointments: !prev.sendMissedAppointments }))} 
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                <span className="ml-3 text-sm font-medium text-gray-600">
                  {settings.sendMissedAppointments ? 'On' : 'Off'}
                </span>
              </label>
            </div>
          </div>
          
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleUpdateSettings}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
      
      {/* Edit Template Modal */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Edit Template</h2>
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input 
                    type="text" 
                    id="name" 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                  <select
                    id="type"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={editingTemplate.type}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="appointment_confirmation">Appointment Confirmation</option>
                    <option value="appointment_reminder">Appointment Reminder</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="medication">Medication</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message Template</label>
                  <textarea
                    id="message"
                    rows={6}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={editingTemplate.message}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, message: e.target.value }))}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Use variables like <code>{'{patientName}'}</code>, <code>{'{date}'}</code>, <code>{'{time}'}</code>, etc.
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="active"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={editingTemplate.active}
                    onChange={(e) => setEditingTemplate(prev => ({ ...prev, active: e.target.checked }))}
                  />
                  <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setEditingTemplate(null)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={handleUpdateTemplate}
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Template Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-auto bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Add New Template</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="newName" className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
                  <input 
                    type="text" 
                    id="newName" 
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" 
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <label htmlFor="newType" className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
                  <select
                    id="newType"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value }))}
                  >
                    <option value="appointment_confirmation">Appointment Confirmation</option>
                    <option value="appointment_reminder">Appointment Reminder</option>
                    <option value="follow_up">Follow-up</option>
                    <option value="medication">Medication</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="newMessage" className="block text-sm font-medium text-gray-700 mb-1">Message Template</label>
                  <textarea
                    id="newMessage"
                    rows={6}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    value={newTemplate.message}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, message: e.target.value }))}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    Use variables like <code>{'{patientName}'}</code>, <code>{'{date}'}</code>, <code>{'{time}'}</code>, etc.
                  </p>
                </div>
                
                <div className="flex items-center">
                  <input
                    id="newActive"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={newTemplate.active}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, active: e.target.checked }))}
                  />
                  <label htmlFor="newActive" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddTemplate}
                >
                  Add Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;