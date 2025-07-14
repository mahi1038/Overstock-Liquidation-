import React, { useState } from 'react';
import PredictionTable from './PredictionTable';
import { Loader2 } from 'lucide-react'; // Optional loading spinner if using lucide

const PredictionDashboard = () => {
  const [predictionData, setPredictionData] = useState([]);
  const [error, setError] = useState("");
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchTableData = async (reset = false) => {
    setLoading(true);
    setError("");

    const currentSkip = reset ? 0 : skip;

    try {
      const res = await fetch(`http://localhost:5050/fetch-table-data?skip=${currentSkip}`);
      const json = await res.json();

      if (json.status === 'success') {
        const newData = reset ? json.data : [...predictionData, ...json.data];
        setPredictionData(newData);
        setSkip(currentSkip + 50);
      } else {
        setError(json.error || "Unknown error");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Server not reachable");
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent">
          📦 Database Viewer
        </h1>
        <p className="text-gray-600 mt-2">
          View and paginate through stored SKUs data from the backend
        </p>
      </div>

      {/* Control Section */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-6 flex flex-col sm:flex-row justify-between gap-4 sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Load SKUs Data</h2>
          <p className="text-sm text-gray-600">Click refresh to load from scratch, or load more records.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchTableData(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            🔄 Refresh
          </button>
          <button
            onClick={() => fetchTableData(false)}
            className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 ${
              loading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="animate-spin w-4 h-4" /> Loading...
              </span>
            ) : (
              '⬇️ Load More'
            )}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
          ❌ {error}
        </div>
      )}

      {/* Table */}
      {predictionData.length > 0 ? (
        <PredictionTable data={predictionData} />
      ) : (
        !loading && (
          <div className="text-center text-gray-500 text-sm py-6">
            No data loaded yet. Use the buttons above to fetch predictions.
          </div>
        )
      )}
    </div>
  );
};

export default PredictionDashboard;
