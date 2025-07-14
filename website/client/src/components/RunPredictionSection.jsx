import React, { useState } from 'react';
import { Column, Table, AutoSizer } from 'react-virtualized';
import 'react-virtualized/styles.css';

const RunBulkPrediction = ({ data }) => {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('ASC');
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

  // Filter and sort
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(filter.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortField) return 0;
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'ASC' ? aVal - bVal : bVal - aVal;
    }

    return sortDirection === 'ASC'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const headerRenderer = ({ dataKey, label }) => (
    <div
      className="cursor-pointer"
      onClick={() => {
        if (sortField === dataKey) {
          setSortDirection(sortDirection === 'ASC' ? 'DESC' : 'ASC');
        } else {
          setSortField(dataKey);
          setSortDirection('ASC');
        }
      }}
    >
      {label}
      {sortField === dataKey && (sortDirection === 'ASC' ? ' ↑' : ' ↓')}
    </div>
  );

  return (
    <div className="w-full h-[600px] bg-white rounded-xl shadow-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Prediction Results</h3>
          <p className="text-sm text-gray-500">
            {filteredData.length} of {data.length} predictions
          </p>
        </div>
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Search..."
          className="px-3 py-1 rounded-md text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <AutoSizer>
        {({ height, width }) => (
          <Table
            width={width}
            height={height - 100}
            headerHeight={40}
            rowHeight={40}
            rowCount={sortedData.length}
            rowGetter={({ index }) => sortedData[index]}
            rowClassName={({ index }) =>
              index !== -1 && sortedData[index].predicted_sales > 100
                ? 'bg-yellow-50'
                : ''
            }
          >
            {Object.keys(data[0]).map((key) => (
              <Column
                key={key}
                label={key}
                dataKey={key}
                width={150}
                flexGrow={1}
                headerRenderer={headerRenderer}
                cellRenderer={({ cellData, dataKey }) => {
                  if (cellData === null || cellData === undefined) {
                    return <span className="text-gray-500 italic">N/A</span>;
                  }

                  if (dataKey === 'predicted_sales') {
                    const val = Number(cellData);
                    const color =
                      val > 100
                        ? 'text-orange-600'
                        : val > 50
                        ? 'text-yellow-600'
                        : 'text-green-600';

                    return <span className={`font-semibold ${color}`}>{val.toFixed(2)}</span>;
                  }

                  return String(cellData);
                }}
              />
            ))}
          </Table>
        )}
      </AutoSizer>
    </div>
  );
};

export default RunBulkPrediction;
