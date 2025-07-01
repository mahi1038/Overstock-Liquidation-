import React from 'react';

const AiOverstockCard = () => (
  <div className="bg-[#7B89C7] rounded-xl shadow p-6 mb-6">
    <div className="text-white text-xl font-bold mb-4">Ai Overstock Liquidation</div>
    <div className="flex gap-4">
      <input
        type="text"
        placeholder="Enter Data Field"
        className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
      />
      <input
        type="text"
        placeholder="Enter Data"
        className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
      />
    </div>
  </div>
);

export default AiOverstockCard; 