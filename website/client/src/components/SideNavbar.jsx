// SideNavbar.jsx
import React from 'react';

const SideNavbar = () => (
  <div className="h-screen w-64 bg-white shadow-md flex flex-col p-4 fixed top-0 left-0">
    <h2 className="text-2xl font-bold text-gray-800 mb-8">MyApp</h2>
    <nav className="flex flex-col gap-4">
      <a href="#" className="text-gray-700 hover:text-blue-500 font-medium">Home</a>
      <a href="#" className="text-gray-700 hover:text-blue-500 font-medium">Profile</a>
      <a href="#" className="text-gray-700 hover:text-blue-500 font-medium">Settings</a>
    </nav>
  </div>
);

export default SideNavbar;