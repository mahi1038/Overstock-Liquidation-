import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,Legend, } from 'recharts';

import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ScatterPlot} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Package, Calendar, Activity, Filter, Search, Download, RefreshCw } from 'lucide-react';

// Enhanced PredictionTable component with charts
const PredictionDashboard = ({ data }) => {
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filter, setFilter] = useState('');
  const [activeView, setActiveView] = useState('overview');

  const stats = useMemo(() => {
    if (!data || data.length === 0) return null;
    
    const predictions = data.map(d => d.predicted_sales || 0);
    const prices = data.map(d => d.sell_price || 0);
    const priceChanges = data.map(d => d.price_pct_change || 0);
    
    return {
      totalItems: data.length,
      avgPredictedSales: predictions.reduce((a, b) => a + b, 0) / predictions.length,
      maxPredictedSales: Math.max(...predictions),
      minPredictedSales: Math.min(...predictions),
      avgPrice: prices.reduce((a, b) => a + b, 0) / prices.length,
      highRiskItems: predictions.filter(p => p > 100).length,
      positiveChanges: priceChanges.filter(p => p > 0).length,
      negativeChanges: priceChanges.filter(p => p < 0).length,
      uniqueStores: new Set(data.map(d => d.store_id)).size,
      uniqueItems: new Set(data.map(d => d.item_id)).size
    };
  }, [data]);

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { timeline: [], distribution: [], stores: [], priceVsPrediction: [] };
    
    // Timeline data (last 30 days)
    const timelineMap = new Map();
    data.forEach(item => {
      const date = new Date(item.date).toLocaleDateString();
      if (!timelineMap.has(date)) {
        timelineMap.set(date, { date, avgSales: 0, count: 0, totalSales: 0 });
      }
      const entry = timelineMap.get(date);
      entry.totalSales += item.predicted_sales || 0;
      entry.count += 1;
      entry.avgSales = entry.totalSales / entry.count;
    });
    
    const timeline = Array.from(timelineMap.values())
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-30);
    
    // Distribution data
    const distributionBuckets = [
      { range: '0-25', count: 0, min: 0, max: 25 },
      { range: '25-50', count: 0, min: 25, max: 50 },
      { range: '50-75', count: 0, min: 50, max: 75 },
      { range: '75-100', count: 0, min: 75, max: 100 },
      { range: '100+', count: 0, min: 100, max: Infinity }
    ];
    
    data.forEach(item => {
      const sales = item.predicted_sales || 0;
      distributionBuckets.forEach(bucket => {
        if (sales >= bucket.min && sales < bucket.max) {
          bucket.count += 1;
        }
      });
    });
    
    // Store performance
    const storeMap = new Map();
    data.forEach(item => {
      const store = item.store_id;
      if (!storeMap.has(store)) {
        storeMap.set(store, { store, totalSales: 0, count: 0, avgSales: 0 });
      }
      const entry = storeMap.get(store);
      entry.totalSales += item.predicted_sales || 0;
      entry.count += 1;
      entry.avgSales = entry.totalSales / entry.count;
    });
    
    const stores = Array.from(storeMap.values()).slice(0, 10);
    
    // Price vs Prediction scatter
   const priceVsPrediction = data.slice(0, 100).map(item => ({
  itemId: item.item_id || 'Unknown',
  sales28: item.sales_28_sum || 0,
  prediction: item.predicted_sales || 0
}));

    
    return { timeline, distribution: distributionBuckets, stores, priceVsPrediction };
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-20">
            <div className="bg-white rounded-3xl shadow-xl p-12 mx-auto max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Data Available</h3>
              <p className="text-gray-600 mb-4">Run predictions to see your dashboard come alive</p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Activity className="w-4 h-4" />
                <span>Waiting for prediction data...</span>
              </div>
            </div>
          </div>
        </div>
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

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
    <div className={`bg-white rounded-2xl shadow-lg p-6 border-l-4 border-${color}-500 hover:shadow-xl transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
          {trend && (
            <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(trend).toFixed(1)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 bg-${color}-100 rounded-full`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
            Sales Prediction Dashboard
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Real-time insights and analytics for your prediction data
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Items"
            value={stats.totalItems.toLocaleString()}
            icon={Package}
            color="blue"
          />
          <StatCard
            title="Avg Predicted Sales"
            value={stats.avgPredictedSales.toFixed(1)}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="High Risk Items"
            value={stats.highRiskItems.toLocaleString()}
            icon={Activity}
            color="red"
          />
          <StatCard
            title="Unique Stores"
            value={stats.uniqueStores.toLocaleString()}
            icon={DollarSign}
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sales Timeline */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Sales Timeline (Last 30 Days)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="avgSales" 
                  stroke="#3B82F6" 
                  strokeWidth={3}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#1D4ED8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Price vs Prediction Scatter */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
  <TrendingUp className="w-5 h-5 text-orange-600" />
  28-Day Sales vs Predicted Sales
</h3>

            <ResponsiveContainer width="100%" height={300}>
<LineChart
  width={500}
  height={300}
  data={chartData.priceVsPrediction}
  margin={{ top: 20, right: 30, left: 20, bottom: 50 }} // more bottom space
>
  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

 <XAxis
  dataKey="itemId"
/>



  <YAxis
    stroke="#666"
    fontSize={12}
    tick={{ fill: '#666', fontSize: 12 }}
    label={{
      value: 'Sales',
      angle: -90,
      position: 'insideLeft',
      offset: 10,
      style: { fill: '#666', fontSize: 12 }
    }}
  />

  <Tooltip />

  <Legend verticalAlign="top" />

  <Line
    type="monotone"
    dataKey="sales28"
    stroke="#3B82F6"
    strokeWidth={2}
    dot={false}
    name="28-Day Sales"
  />
  <Line
    type="monotone"
    dataKey="prediction"
    stroke="#F59E0B"
    strokeWidth={2}
    dot={false}
    name="Predicted Sales"
  />
</LineChart>

</ResponsiveContainer>

          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="text-white">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Model Predictions Analysis
                </h3>
                <p className="text-gray-300">
                  {filteredData.length} of {data.length} predictions • Focus on predicted_sales accuracy
                </p>
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search predictions..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setFilter('')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto max-h-96">
            <table className="w-full">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th
                      key={key}
                      onClick={() => handleSort(key)}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        {key === 'predicted_sales' ? '🎯 Predicted Sales' : key.replace(/_/g, ' ')}
                        {sortField === key && (
                          <span className="text-blue-600 ml-2">
                            {sortDirection === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedData.slice(0, 100).map((row, i) => (
                  <tr 
                    key={i} 
                    className={`hover:bg-gray-50 transition-colors ${
                      row.predicted_sales > 100 ? 'bg-red-50 border-l-4 border-red-400' : 
                      row.predicted_sales > 50 ? 'bg-yellow-50 border-l-4 border-yellow-400' : 'bg-green-50 border-l-4 border-green-400'
                    }`}
                  >
                    {Object.entries(row).map(([key, val], j) => (
                      <td
                        key={j}
                        className="px-6 py-4 whitespace-nowrap text-sm"
                      >
                        {val === null || val === undefined ? (
                          <span className="text-gray-400 italic">N/A</span>
                        ) : key === 'predicted_sales' ? (
                          <div className="flex items-center gap-2">
                            <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                              val > 100 ? 'bg-red-100 text-red-800' : 
                              val > 50 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {Number(val).toFixed(2)}
                            </span>
                            {val > 100 && <span className="text-red-600 text-xs">🔴 High Risk</span>}
                            {val > 50 && val <= 100 && <span className="text-yellow-600 text-xs">🟡 Medium</span>}
                            {val <= 50 && <span className="text-green-600 text-xs">🟢 Low Risk</span>}
                          </div>
                        ) : key === 'date' ? (
                          <span className="text-gray-600 font-medium">
                            {new Date(val).toLocaleDateString()}
                          </span>
                        ) : key === 'sell_price' ? (
                          <span className="font-semibold text-blue-600">
                            ${Number(val).toFixed(2)}
                          </span>
                        ) : key === 'price_pct_change' ? (
                          <span className={`font-semibold ${
                            val > 0 ? 'text-green-600' : val < 0 ? 'text-red-600' : 'text-gray-600'
                          }`}>
                            {val > 0 ? '+' : ''}{Number(val).toFixed(2)}%
                          </span>
                        ) : key === 'sales_28_sum' ? (
                          <span className="font-medium text-purple-600">
                            {Number(val).toFixed(0)}
                          </span>
                        ) : (
                          <span className="text-gray-800 font-medium">{String(val)}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Enhanced Table Footer with Model Performance Metrics */}
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Package className="w-4 h-4 text-blue-600" />
                <span className="text-gray-600">Total Predictions: <strong className="text-gray-800">{stats.totalItems.toLocaleString()}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-gray-600">Model Avg: <strong className="text-gray-800">{stats.avgPredictedSales.toFixed(2)}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Activity className="w-4 h-4 text-red-600" />
                <span className="text-gray-600">High Risk: <strong className="text-red-600">{stats.highRiskItems}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-purple-600" />
                <span className="text-gray-600">Avg Price: <strong className="text-gray-800">${stats.avgPrice.toFixed(2)}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced RunPredictionSection component
const RunPredictionSection = ({ setPredictionData, appendPredictionData }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunTime, setLastRunTime] = useState(null);
  const [skip, setSkip] = useState(0);

  const handleRunPrediction = async () => {
    setIsRunning(true);
    try {
      const response = await fetch('http://localhost:5050/run-prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();

      if (data.status === 'success') {
        alert(`✅ Prediction process started successfully.`);
        setLastRunTime(new Date().toLocaleString());
      } else {
        alert('❌ Prediction failed: ' + data.error);
      }
    } catch (error) {
      alert('💥 Network error: ' + error.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleFetchResults = async (reset = false) => {
    try {
      const currentSkip = reset ? 0 : skip;
      const res = await fetch(`http://localhost:5050/fetch-results?skip=${currentSkip}`);
      const json = await res.json();

      if (json.status === 'success') {
        if (reset) {
          setPredictionData(json.data);
        } else {
          appendPredictionData(json.data);
        }
        setSkip(currentSkip + 1000);
        if (json.data.length === 0 && !reset) {
          alert("📭 No more data to fetch.");
        }
      } else {
        alert('⚠️ Failed to fetch results: ' + json.error);
      }
    } catch (err) {
      alert('💥 Error fetching results: ' + err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Prediction Control Center
          </h3>
          <p className="text-gray-600 text-sm mt-1">Generate and manage bulk predictions</p>
          {lastRunTime && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Last run: {lastRunTime}
            </p>
          )}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={handleRunPrediction}
            disabled={isRunning}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
              isRunning
                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Activity className="w-4 h-4" />
                Run Prediction
              </>
            )}
          </button>

          <button
            onClick={() => handleFetchResults(true)}
            className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Fetch Results
          </button>

          <button
            onClick={() => handleFetchResults(false)}
            className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            Load More
          </button>
        </div>
      </div>
    </div>
  );
};

export default function RunBulkPrediction() {
  const [predictionData, setPredictionData] = useState([]);

  const appendPredictionData = (newData) => {
    setPredictionData((prev) => [...prev, ...newData]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <RunPredictionSection
            setPredictionData={setPredictionData}
            appendPredictionData={appendPredictionData}
          />
          <PredictionDashboard data={predictionData} />
        </div>
      </div>
    </div>
  );
}