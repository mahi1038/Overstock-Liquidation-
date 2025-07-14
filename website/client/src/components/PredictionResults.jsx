import React from 'react';

const PredictionResults = ({ prediction, handleRunPrediction, handleTrainModel }) => {
  return (
    <div className="w-full mb-10 font-inter">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-center gap-4 mb-6">
        <button
          onClick={handleTrainModel}
          className="px-6 py-3 bg-[#1f2937] text-gray-200 rounded-lg shadow hover:bg-purple-700 text-lg font-medium transition"
        >
          Train Model
        </button>
      </div>

      {/* 4-Grid Summary Cards
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${prediction ? 'text-red-600' : 'text-gray-400'}`}>
            {prediction ? prediction.atRisk : '--'}
          </span>
          <span className="text-gray-500 text-sm mt-1">SKUs at Risk</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${prediction ? 'text-yellow-600' : 'text-gray-400'}`}>
            {prediction ? prediction.riskLevel : '--'}
          </span>
          <span className="text-gray-500 text-sm mt-1">Risk Level</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <span className="text-2xl">📈</span>
          <span className="text-gray-500 text-sm mt-1">Prediction Accuracy</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center justify-center">
          <span className="text-2xl">📊</span>
          <span className="text-gray-500 text-sm mt-1">Inventory Health</span>
        </div>
      </div> */}
    </div>
  );
};

export default PredictionResults;
