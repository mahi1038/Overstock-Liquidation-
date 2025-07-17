import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, TrendingUp, Package, DollarSign, BarChart3, RefreshCw, Download, Eye, EyeOff, Loader2, Moon, Sun } from 'lucide-react';

const InteractiveSalesDashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [skip, setSkip] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  
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

  const themeClasses = {
    bg: darkMode ? 'bg-gray-900' : 'bg-gray-50',
    cardBg: darkMode ? 'bg-gray-800' : 'bg-white',
    text: darkMode ? 'text-white' : 'text-gray-900',
    textSecondary: darkMode ? 'text-gray-300' : 'text-gray-600',
    border: darkMode ? 'border-gray-700' : 'border-gray-200',
    input: darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900',
    button: darkMode ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700' : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800',
    tableHeader: darkMode ? 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900' : 'bg-gradient-to-r from-gray-800 via-gray-700 to-gray-900',
    tableRow: darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50',
    tableBorder: darkMode ? 'divide-gray-700' : 'divide-gray-200'
  };

  return (
    <div className={`min-h-screen ${themeClasses.bg} p-6 transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className={`text-4xl font-bold ${themeClasses.text} mb-2`}>
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                📊 Sales Analytics
              </span>
            </h1>
            <p className={`${themeClasses.textSecondary} text-lg`}>
              Interactive exploration of sales data with advanced filtering and insights
            </p>
          </div>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-3 rounded-full ${themeClasses.cardBg} ${themeClasses.border} border shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
          >
            {darkMode ? (
              <Sun className="w-6 h-6 text-yellow-400" />
            ) : (
              <Moon className="w-6 h-6 text-gray-600" />
            )}
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className={`${themeClasses.cardBg} rounded-2xl shadow-lg p-6 border ${themeClasses.border} hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Total Sales</p>
                <p className={`text-3xl font-bold ${themeClasses.text} bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent`}>
                  {stats.totalSales.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className={`${themeClasses.cardBg} rounded-2xl shadow-lg p-6 border ${themeClasses.border} hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Avg Price</p>
                <p className={`text-3xl font-bold ${themeClasses.text} bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent`}>
                  ${stats.avgPrice.toFixed(2)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className={`${themeClasses.cardBg} rounded-2xl shadow-lg p-6 border ${themeClasses.border} hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Total Items</p>
                <p className={`text-3xl font-bold ${themeClasses.text} bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent`}>
                  {stats.totalItems}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full">
                <Package className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className={`${themeClasses.cardBg} rounded-2xl shadow-lg p-6 border ${themeClasses.border} hover:shadow-xl transition-all duration-300 transform hover:scale-105`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${themeClasses.textSecondary}`}>Avg 7-Day Lag</p>
                <p className={`text-3xl font-bold ${themeClasses.text} bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent`}>
                  {stats.avgLag.toFixed(1)}
                </p>
              </div>
              <div className="p-3 bg-gradient-to-r from-orange-500 to-red-600 rounded-full">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className={`${themeClasses.cardBg} rounded-2xl shadow-lg p-6 mb-6 border ${themeClasses.border}`}>
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search across all fields..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 ${themeClasses.input} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300`}
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-5 py-3 ${themeClasses.button} text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                <Filter className="w-4 h-4" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              <button
                onClick={clearFilters}
                className={`px-5 py-3 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                Clear All
              </button>
              
              <button
                onClick={() => fetchTableData(true)}
                className={`flex items-center gap-2 px-5 py-3 ${themeClasses.button} text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105`}
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <button
                onClick={() => fetchTableData(false)}
                className={`flex items-center gap-2 px-5 py-3 ${themeClasses.button} text-white rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105 ${
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
            <div className={`mt-6 pt-6 border-t ${themeClasses.border} animate-in slide-in-from-top-2 duration-300`}>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Department</label>
                  <select
                    value={filters.dept}
                    onChange={(e) => handleFilterChange('dept', e.target.value)}
                    className={`w-full p-3 ${themeClasses.input} rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                  >
                    <option value="">All Departments</option>
                    {getUniqueValues('dept').map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>State</label>
                  <select
                    value={filters.state_id}
                    onChange={(e) => handleFilterChange('state_id', e.target.value)}
                    className={`w-full p-3 ${themeClasses.input} rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                  >
                    <option value="">All States</option>
                    {getUniqueValues('state_id').map(state => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Event Type</label>
                  <select
                    value={filters.event_type_1}
                    onChange={(e) => handleFilterChange('event_type_1', e.target.value)}
                    className={`w-full p-3 ${themeClasses.input} rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                  >
                    <option value="">All Events</option>
                    {getUniqueValues('event_type_1').map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>SNAP Active</label>
                  <select
                    value={filters.snap_active}
                    onChange={(e) => handleFilterChange('snap_active', e.target.value)}
                    className={`w-full p-3 ${themeClasses.input} rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                  >
                    <option value="">All</option>
                    <option value="1">Yes</option>
                    <option value="0">No</option>
                  </select>
                </div>
                
                <div>
                  <label className={`block text-sm font-medium ${themeClasses.textSecondary} mb-2`}>Weekday</label>
                  <select
                    value={filters.weekday}
                    onChange={(e) => handleFilterChange('weekday', e.target.value)}
                    className={`w-full p-3 ${themeClasses.input} rounded-xl focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
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
          <div className={`mb-4 text-sm text-red-400 bg-red-900/20 border border-red-500/20 p-4 rounded-xl backdrop-blur-sm animate-in slide-in-from-top-2 duration-300`}>
            ❌ {error}
          </div>
        )}

        {/* Column Selector */}
        {data.length > 0 && (
          <div className={`${themeClasses.cardBg} rounded-2xl shadow-lg p-6 mb-6 border ${themeClasses.border}`}>
            <h3 className={`text-sm font-medium ${themeClasses.textSecondary} mb-4`}>Visible Columns:</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(data[0]).map(column => (
                <button
                  key={column}
                  onClick={() => toggleColumn(column)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all duration-300 transform hover:scale-105 ${
                    selectedColumns.size === 0 || selectedColumns.has(column)
                      ? `${themeClasses.button} text-white shadow-lg`
                      : `${themeClasses.cardBg} ${themeClasses.textSecondary} border ${themeClasses.border}`
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
        <div className={`${themeClasses.cardBg} rounded-2xl shadow-lg overflow-hidden border ${themeClasses.border}`}>
          <div className={`p-6 border-b ${themeClasses.border}`}>
            <h3 className={`text-xl font-semibold ${themeClasses.text}`}>
              Sales Data ({filteredData.length} records)
            </h3>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="w-full">
              <thead className={`${themeClasses.tableHeader} sticky top-0 z-10`}>
                <tr>
                  {visibleColumns.map(column => (
                    <th
                      key={column}
                      className="px-6 py-4 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-600/50 transition-colors"
                      onClick={() => handleSort(column)}
                    >
                      <div className="flex items-center gap-2">
                        {column.replace(/_/g, ' ')}
                        {sortConfig.key === column && (
                          <span className="text-blue-400">
                            {sortConfig.direction === 'asc' ? 
                              <ChevronUp className="w-4 h-4" /> : 
                              <ChevronDown className="w-4 h-4" />
                            }
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className={`${themeClasses.cardBg} divide-y ${themeClasses.tableBorder}`}>
                {filteredData.map((row, idx) => (
                  <tr key={row._id || idx} className={`${themeClasses.tableRow} transition-colors`}>
                    {visibleColumns.map(column => (
                      <td key={column} className={`px-6 py-4 whitespace-nowrap text-sm ${themeClasses.text}`}>
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
            <div className={`text-center py-12 ${themeClasses.textSecondary}`}>
              {data.length === 0 ? "No data loaded yet. Click refresh to fetch data." : "No data matches your current filters"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveSalesDashboard;