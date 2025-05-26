// src/components/ReminderTemplate.jsx
import React, { useState } from 'react';

const ReminderTemplate = ({ template, onEdit, onToggleActive, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Available variables for templates
  const variables = [
    { name: '{{patient_name}}', description: 'Patient full name' },
    { name: '{{appointment_date}}', description: 'Formatted appointment date' },
    { name: '{{appointment_time}}', description: 'Formatted appointment time' },
    { name: '{{doctor_name}}', description: 'Doctor full name' },
    { name: '{{clinic_name}}', description: 'Clinic name' },
    { name: '{{clinic_address}}', description: 'Clinic address' },
    { name: '{{clinic_phone}}', description: 'Clinic phone number' }
  ];

  // Highlight template variables in preview
  const highlightVariables = (text) => {
    let highlighted = text;
    variables.forEach(variable => {
      highlighted = highlighted.replace(
        new RegExp(variable.name, 'g'),
        `<span class="bg-blue-100 text-blue-800 px-1 rounded">${variable.name}</span>`
      );
    });
    return highlighted;
  };

  // Determine button and template styles based on active status
  const isActive = template.active;
  const activateBtnClass = isActive
    ? "text-sm px-3 py-1.5 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition"
    : "text-sm px-3 py-1.5 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition";
  const activateBtnText = isActive ? "Deactivate" : "Activate";
  const templateContainerClass = "bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden";

  return (
    <div className={templateContainerClass}>
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div>
          <h3 className="font-medium text-gray-900">{template.name}</h3>
          <p className="text-sm text-gray-500">{template.type} {template.channel ? `- ${template.channel}` : ''}</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className={`mb-4 p-3 rounded text-sm ${isActive ? "bg-gray-50" : "bg-gray-100 opacity-60"}`}>
            <p className="text-xs text-gray-500 mb-1">Template Preview:</p>
            <div 
              className={`text-gray-700 ${!isActive ? "text-gray-400" : ""}`}
              dangerouslySetInnerHTML={{ __html: highlightVariables(template.message || '') }}
            />
          </div>
          
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-1">Available Variables:</p>
            <div className="flex flex-wrap gap-1">
              {variables.map(variable => (
                <span 
                  key={variable.name} 
                  className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded"
                  title={variable.description}
                >
                  {variable.name}
                </span>
              ))}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(template);
              }}
              className="text-sm px-3 py-1.5 bg-gray-50 text-gray-700 rounded-md hover:bg-gray-100 transition"
              disabled={!isActive}
            >
              Edit
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onToggleActive(template.id, !isActive);
              }}
              className={activateBtnClass}
            >
              {activateBtnText}
            </button>
            
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(template.id);
              }}
              className="text-sm px-3 py-1.5 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition"
              disabled={!isActive}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReminderTemplate;