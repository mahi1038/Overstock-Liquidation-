import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, TrendingUp, Package, DollarSign, BarChart3, RefreshCw, Download, Eye, EyeOff, Loader2 } from 'lucide-react';

const InteractiveSalesDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skip, setSkip] = useState(0);
  
  // Filter and search states
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    dept: "",
    state_id: "",
    event_type_1: "",
    snap_active: "",
    weekday: ""
  });
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(new Set());

  const fetchTableData = async (reset = false) => {
    setLoading(true);
    setError("");
    
    const currentSkip = reset ? 0 : skip;
    
    try {
      const res = await fetch(`http://localhost:5050/fetch-table-data?skip=${currentSkip}`);
      const json = await res.json();
      
      if (json.status === 'success') {
        const newData = reset ? json.data : [...data, ...json.data];
        setData(newData);
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

  useEffect(() => {
    fetchTableData(true);
  }, []);

  // Calculate summary statistics
  const stats = useMemo(() => {
    if (!data.length) return { totalSales: 0, avgPrice: 0, totalItems: 0, avgLag: 0 };
    
    const totalSales = data.reduce((sum, item) => sum + (item.sales || 0), 0);
    const avgPrice = data.reduce((sum, item) => sum + (item.sell_price || 0), 0) / data.length;
    const totalItems = data.length;
    const avgLag = data.reduce((sum, item) => sum + (item.lag_7 || 0), 0) / data.length;
    
    return { totalSales, avgPrice, totalItems, avgLag };
  }, [data]);

  // Filter and search logic
  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(item => String(item[key]) === value);
      }
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aVal = a[sortConfig.key];
        let bVal = b[sortConfig.key];
        
        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [data, searchTerm, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      dept: "",
      state_id: "",
      event_type_1: "",
      snap_active: "",
      weekday: ""
    });
    setSearchTerm("");
  };

  const getUniqueValues = (key) => {
    return [...new Set(data.map(item => item[key]).filter(Boolean))];
  };

  const formatValue = (value) => {
    if (value === null || value === undefined || value === "N/A") return "N/A";
    if (typeof value === 'number') {
      if (value % 1 === 0) return value.toString();
      return value.toFixed(2);
    }
    return String(value);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "N/A") return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const toggleColumn = (column) => {
    setSelectedColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(column)) {
        newSet.delete(column);
      } else {
        newSet.add(column);
      }
      return newSet;
    });
  };

  const visibleColumns = data.length > 0 ? Object.keys(data[0]).filter(col => 
    selectedColumns.size === 0 || selectedColumns.has(col)
  ) : [];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 bg-clip-text text-transparent mb-2">
            📊 Sales Analytics Dashboard
          </h1>
          <p className="text-gray-600">
            Interactive exploration of sales data with advanced filtering and insights
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSales.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Price</p>
                <p className="text-2xl font-bold text-gray-900">${stats.avgPrice.toFixed(2)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalItems}</p>
              </div>
              <Package className="w-8 h-8 text-gray-600" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg 7-Day Lag</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgLag.toFixed(1)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-gray-600" />
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search across all fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Clear All
              </button>
              
              <button
                onClick={() => fetchTableData(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <button
                onClick={() => fetchTableData(false)}
                className={`flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ${
                  loading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    Loading...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Load More
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <select
                    value={filters.dept}
                    onChange={(e) => handleFilterChange('dept', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">All Departments</option>
                    {getUniqueValues('dept').map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <select
                    value={filters.state_id}
                    onChange={(e) => handleFilterChange('state_id', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">All States</option>
                    {getUniqueValues('state_id').map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                  <select
                    value={filters.event_type_1}
                    onChange={(e) => handleFilterChange('event_type_1', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">All Events</option>
                    {getUniqueValues('event_type_1').map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SNAP Active</label>
                  <select
                    value={filters.snap_active}
                    onChange={(e) => handleFilterChange('snap_active', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">All</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weekday</label>
                  <select
                    value={filters.weekday}
                    onChange={(e) => handleFilterChange('weekday', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500"
                  >
                    <option value="">All Days</option>
                    {getUniqueValues('weekday').map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-md">
            ❌ {error}
          </div>
        )}

        {/* Column Selector */}
        {data.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Visible Columns:</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(data[0]).map(column => (
                <button
                  key={column}
                  onClick={() => toggleColumn(column)}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-sm transition-colors ${
                    selectedColumns.size === 0 || selectedColumns.has(column)
                      ? 'bg-gray-100 text-gray-700 border border-gray-300'
                      : 'bg-gray-50 text-gray-500 border border-gray-200'
                  }`}
                >
                  {selectedColumns.size === 0 || selectedColumns.has(column) ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                  {column}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Sales Data ({filteredData.length} records)
            </h3>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900 sticky top-0 z-10">
                <tr>
                  {visibleColumns.map(column => (
                    <th
                      key={column}
                      className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-600 transition-colors"
                      onClick={() => handleSort(column)}
                    >
                      <div className="flex items-center gap-1">
                        {column.replace(/_/g, ' ')}
                        {sortConfig.key === column && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="w-3 h-3" /> : 
                            <ChevronDown className="w-3 h-3" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredData.map((row, idx) => (
                  <tr key={row._id || idx} className="hover:bg-gray-50 transition-colors">
                    {visibleColumns.map(column => (
                      <td key={column} className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        {column === 'dated' ? formatDate(row[column]) : 
                         column === 'sell_price' ? `$${formatValue(row[column])}` :
                         column === 'price_pct_change' ? `${(row[column] * 100).toFixed(1)}%` :
                         formatValue(row[column])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredData.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              {data.length === 0 ? "No data loaded yet. Click refresh to fetch data." : "No data matches your current filters"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveSalesDashboard;