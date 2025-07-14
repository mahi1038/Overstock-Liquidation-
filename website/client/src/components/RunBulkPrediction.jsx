
import React, { useState } from 'react';

// Enhanced PredictionTable component
const PredictionTable = ({ data }) => {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filter, setFilter] = useState('');

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📊</div>
        <p>No predictions found.</p>
        <p className="text-sm">Run the prediction first to see results.</p>
      </div>
    );
  }

  // Filter and sort data
  const filteredData = data.filter(row => 
    Object.values(row).some(val => 
      String(val).toLowerCase().includes(filter.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    
    const aVal = a[sortField];
    const bVal = b[sortField];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    return sortDirection === 'asc' 
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header with stats and filter */}
        <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-white">
              <h3 className="text-lg font-semibold">Prediction Results</h3>
              <p className="text-gray-300 text-sm">
                {filteredData.length} of {data.length} predictions
              </p>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search predictions..."
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => setFilter('')}
                className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto max-h-96">
          <table className="w-full text-sm">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                {Object.keys(data[0]).map((key) => (
                  <th
                    key={key}
                    onClick={() => handleSort(key)}
                    className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-tight cursor-pointer hover:bg-gray-200 min-w-24 whitespace-nowrap"
                  >
                    <div className="flex items-center justify-between">
                      {key}
                      {sortField === key && (
                        <span className="text-blue-600">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.map((row, i) => (
                <tr 
                  key={i} 
                  className={`hover:bg-gray-50 transition-colors duration-150 ${
                    row.predicted_sales > 100 ? 'bg-yellow-50' : ''
                  }`}
                >
                  {Object.entries(row).map(([key, val], j) => (
                    <td
                      key={j}
                      className="px-3 py-2 text-gray-800 min-w-24 max-w-32 truncate text-sm font-medium"
                      title={val !== null && val !== undefined ? String(val) : ''}
                    >
                      {val === null || val === undefined ? (
                        <span className="text-gray-500 italic">N/A</span>
                      ) : key === 'predicted_sales' ? (
                        <span className={`font-semibold ${
                          val > 100 ? 'text-orange-600' : 
                          val > 50 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {Number(val).toFixed(2)}
                        </span>
                      ) : (
                        String(val)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer with summary stats */}
        <div className="bg-gray-50 px-4 py-3 border-t">
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>Total Items: <strong>{data.length}</strong></span>
            {data.length > 0 && data[0].predicted_sales && (
              <>
                <span>
                  Avg Predicted Sales: <strong>
                    {(data.reduce((sum, row) => sum + (row.predicted_sales || 0), 0) / data.length).toFixed(2)}
                  </strong>
                </span>
                <span>
                  High Risk Items: <strong>
                    {data.filter(row => row.predicted_sales > 100).length}
                  </strong>
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced RunPredictionSection component
const RunPredictionSection = ({ setPredictionData }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState(null);

  const handleRunPrediction = async () => {
    setIsRunning(true);
    
    try {
      console.log('🚀 Starting prediction...');
      
      const response = await fetch('http://localhost:5050/run-prediction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      console.log('📊 Prediction response:', data);

      if (data.status === 'success') {
        console.log('✅ Predictions received:', data.data.length, 'records');
        setPredictionData(data.data);
        setLastRunTime(new Date().toLocaleString());
        alert(`✅ Prediction completed! Generated ${data.data.length} predictions.`);
      } else {
        console.error('❌ Prediction error:', data.error);
        alert('❌ Prediction failed: ' + data.error);
      }
    } catch (error) {
      console.error('💥 Network error:', error);
      alert('💥 Network error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="w-full mb-8">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Run Bulk Prediction</h3>
            <p className="text-gray-600 text-sm">
              Generate predictions for all items in the database
            </p>
            {lastRunTime && (
              <p className="text-xs text-gray-500 mt-1">
                Last run: {lastRunTime}
              </p>
            )}
          </div>
          
          <button
            onClick={handleRunPrediction}
            disabled={isRunning}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              isRunning
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Running...
              </span>
            ) : (
              '🚀 Run Prediction'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Demo component showing the full implementation
export default function RunBulkPrediction() {
  const [predictionData, setPredictionData] = useState([]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
          Bulk Prediction Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Run predictions on all items and view results in an interactive table
        </p>
      </div>

      <RunPredictionSection setPredictionData={setPredictionData} />
      <PredictionTable data={predictionData} />
    </div>
  );
}
