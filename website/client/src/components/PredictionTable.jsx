
import React from 'react';

const PredictionTable = ({ data }) => {
  if (!data || data.length === 0) return <p className="text-gray-400">No predictions found.</p>;

  return (
    <div className="w-full max-w-4xl rounded-xl shadow-lg bg-white border border-gray-200 overflow-hidden">
      <div className="overflow-auto max-h-96">
        <table className="w-full text-sm">
          <thead className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 sticky top-0 z-10">
            <tr>
              {Object.keys(data[0]).map((key) => (
                <th
                  key={key}
                  className="px-3 py-3 border-b border-gray-600 text-sm font-semibold text-white text-left min-w-20 whitespace-nowrap uppercase tracking-tight"
                >
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row, i) => (
              <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                {Object.values(row).map((val, j) => (
                  <td
                    key={j}
                    className="px-3 py-2 text-gray-800 min-w-20 max-w-32 truncate text-sm font-medium"
                    title={val !== null && val !== undefined ? String(val) : ''}
                  >
                    {val === null || val === undefined ? (
                      <span className="text-gray-500 italic">N/A</span>
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
    </div>
  );
};
export default PredictionTable;
