import React, { useState } from 'react';

const Settings = () => {
  const [profile, setProfile] = useState({
    name: 'Dr. John Doe',
    email: 'john.doe@demo.carereminder.com',
    phone: '+254 700 000 000',
    notifications: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save settings logic here
    alert('Settings saved!');
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded shadow">
      <h2 className="text-2xl font-bold mb-6">Settings</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="name">
            Name
          </label>
          <input
            className="w-full border rounded px-3 py-2"
            type="text"
            id="name"
            name="name"
            value={profile.name}
            onChange={handleChange}
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email
          </label>
          <input
            className="w-full border rounded px-3 py-2"
            type="email"
            id="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            autoComplete="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">
            Phone
          </label>
          <input
            className="w-full border rounded px-3 py-2"
            type="tel"
            id="phone"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            autoComplete="tel"
          />
        </div>
        <div className="flex items-center">
          <input
            className="mr-2"
            type="checkbox"
            id="notifications"
            name="notifications"
            checked={profile.notifications}
            onChange={handleChange}
          />
          <label htmlFor="notifications" className="text-sm">
            Enable notifications
          </label>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default Settings;