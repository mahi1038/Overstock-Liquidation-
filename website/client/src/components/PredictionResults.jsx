import React from 'react';

const PredictionResults = ({ prediction, handleRunPrediction }) => (
  <div className="mb-6">
    {/* Run Prediction Button - top left, prominent */}
    <div className="flex mb-4">
      <button
        onClick={handleRunPrediction}
        className="px-6 py-2 bg-purple-600 text-white rounded-lg shadow hover:bg-purple-700 text-lg font-semibold"
      >
        Run Prediction
      </button>
    </div>
    {/* At Risk, Risk Level, Chart */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
        <span className={`text-2xl font-bold ${prediction ? 'text-red-600' : 'text-gray-400'}`}>{prediction ? prediction.atRisk : '--'}</span>
        <span className="text-gray-500">SKUs at Risk</span>
      </div>
      <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
        <span className={`text-2xl font-bold ${prediction ? 'text-yellow-600' : 'text-gray-400'}`}>{prediction ? prediction.riskLevel : '--'}</span>
        <span className="text-gray-500">Risk Level</span>
      </div>
      <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
        <span className="text-2xl">📈</span>
        <span className="text-gray-500">Overstock Prediction Chart (placeholder)</span>
      </div>
    </div>
    {/* Overstock Table */}
    <div className="bg-white p-6 rounded-lg shadow mb-6 overflow-x-auto">
      <div className="text-lg font-semibold text-gray-700 mb-4">Overstock Table</div>
      <table className="w-full text-left">
        <thead>
          <tr>
            <th className="py-2 text-gray-500 font-medium">SKU</th>
            <th className="py-2 text-gray-500 font-medium">Store</th>
            <th className="py-2 text-gray-500 font-medium">Current Stock</th>
            <th className="py-2 text-gray-500 font-medium">Predicted Demand</th>
            <th className="py-2 text-gray-500 font-medium">Confidence</th>
          </tr>
        </thead>
        <tbody>
          {prediction && prediction.overstockData.length > 0 ? (
            prediction.overstockData.map((item, idx) => (
              <tr key={idx} className="border-t">
                <td className="py-2">{item.sku}</td>
                <td className="py-2">{item.store}</td>
                <td className="py-2">{item.stock}</td>
                <td className="py-2">{item.predicted}</td>
                <td className="py-2">{item.confidence}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="py-2 text-gray-400" colSpan={5}>No overstock data yet. Run prediction to see results.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
    {/* Smart Bin Cluster Table & Chart */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <div className="text-lg font-semibold text-gray-700 mb-4">Smart Bin Cluster Table</div>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="py-2 text-gray-500 font-medium">Cluster</th>
              <th className="py-2 text-gray-500 font-medium">SKUs in Bin</th>
              <th className="py-2 text-gray-500 font-medium">Overstock %</th>
            </tr>
          </thead>
          <tbody>
            {prediction && prediction.clusterData.length > 0 ? (
              prediction.clusterData.map((item, idx) => (
                <tr key={idx} className="border-t">
                  <td className="py-2">{item.cluster}</td>
                  <td className="py-2">{item.skus}</td>
                  <td className="py-2">{item.overstock}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-2 text-gray-400" colSpan={3}>No cluster data yet. Run prediction to see results.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center">
        <span className="text-4xl mb-2">🗂️</span>
        <span className="text-gray-500">Smart Bin Cluster Chart (placeholder)</span>
      </div>
    </div>
  </div>
);

export default PredictionResults; 