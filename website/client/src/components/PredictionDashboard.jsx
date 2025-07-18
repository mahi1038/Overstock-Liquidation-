import React, { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, TrendingUp, Package, DollarSign, BarChart3, RefreshCw, Download, Loader2, Moon, Sun } from 'lucide-react';

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
  const [visibleColumns, setVisibleColumns] = useState(['store_id', 'item_id', 'sales', 'sell_price', ]);

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
    setVisibleColumns(prev => {
      if (prev.includes(column)) {
        return prev.filter(col => col !== column);
      } else {
        return [...prev, column];
      }
    });
  };

  const allColumns = data.length > 0 ? Object.keys(data[0]) : [];


  const themeClasses = {
     bg: darkMode ? 'custom-dark-bg' : 'bg-gray-50',
    cardBg: darkMode ? 'bg-gray-800 bg-opacity-50 backdrop-blur-md' : 'bg-white',
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
    <div
  className={`min-h-screen transition-colors duration-300 ${themeClasses.bg}`}
  style={
    darkMode
      ? {
          backgroundImage: `
            radial-gradient(ellipse at bottom left, rgba(40,0,60,0.1), transparent 70%),
            radial-gradient(circle at top right, rgba(80,0,100,0.08), transparent 70%)`,
          backgroundColor: '#0a0010',
        }
      : undefined
  }
>

      <div className="p-4">
        <div className="max-w-7xl mx-auto">
          {/* Compact Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className={`text-2xl font-bold ${themeClasses.text} mb-1`}>
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Sales Analytics
                </span>
              </h1>
              <p className={`${themeClasses.textSecondary} text-sm`}>
                Interactive exploration of sales data
              </p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg ${themeClasses.cardBg} ${themeClasses.border} border shadow hover:shadow-lg transition-all duration-300`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>

          {/* Compact Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <div className={`${themeClasses.cardBg}  rounded-lg shadow p-4 border ${themeClasses.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Total Sales</p>
                  <p className={`text-lg font-bold ${themeClasses.text}`}>
                    {stats.totalSales.toLocaleString()}
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            
            <div className={`${themeClasses.cardBg} rounded-lg shadow p-4 border ${themeClasses.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Avg Price</p>
                  <p className={`text-lg font-bold ${themeClasses.text}`}>
                    ${stats.avgPrice.toFixed(2)}
                  </p>
                </div>
                <DollarSign className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            
            <div className={`${themeClasses.cardBg} rounded-lg shadow p-4 border ${themeClasses.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Total Items</p>
                  <p className={`text-lg font-bold ${themeClasses.text}`}>
                    {stats.totalItems}
                  </p>
                </div>
                <Package className="w-5 h-5 text-purple-500" />
              </div>
            </div>
            
            <div className={`${themeClasses.cardBg} rounded-lg shadow p-4 border ${themeClasses.border}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs font-medium ${themeClasses.textSecondary}`}>Avg Lag</p>
                  <p className={`text-lg font-bold ${themeClasses.text}`}>
                    {stats.avgLag.toFixed(1)}
                  </p>
                </div>
                <BarChart3 className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>

          {/* Compact Controls */}
          <div className={`${themeClasses.cardBg} rounded-lg shadow p-4 mb-4 border ${themeClasses.border}`}>
            <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
              <div className="flex-1 max-w-sm">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 text-sm ${themeClasses.input} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300`}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm ${themeClasses.button} text-white rounded-lg hover:shadow-lg transition-all duration-300`}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                  {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                
                <button
                  onClick={clearFilters}
                  className={`px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all duration-300`}
                >
                  Clear
                </button>
                
                <button
                  onClick={() => fetchTableData(true)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm ${themeClasses.button} text-white rounded-lg transition-all duration-300`}
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </button>
                
                <button
                  onClick={() => fetchTableData(false)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm ${themeClasses.button} text-white rounded-lg transition-all duration-300 ${
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

            {/* Compact Filters Panel */}
            {showFilters && (
              <div className={`mt-4 pt-4 border-t ${themeClasses.border}`}>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                  <div>
                    <label className={`block text-xs font-medium ${themeClasses.textSecondary} mb-1`}>Department</label>
                    <select
                      value={filters.dept}
                      onChange={(e) => handleFilterChange('dept', e.target.value)}
                      className={`w-full p-2 text-sm ${themeClasses.input} rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                    >
                      <option value="">All</option>
                      {getUniqueValues('dept').map(dept => (
                        <option key={dept} value={dept}>{dept}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-xs font-medium ${themeClasses.textSecondary} mb-1`}>State</label>
                    <select
                      value={filters.state_id}
                      onChange={(e) => handleFilterChange('state_id', e.target.value)}
                      className={`w-full p-2 text-sm ${themeClasses.input} rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                    >
                      <option value="">All</option>
                      {getUniqueValues('state_id').map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-xs font-medium ${themeClasses.textSecondary} mb-1`}>Event Type</label>
                    <select
                      value={filters.event_type_1}
                      onChange={(e) => handleFilterChange('event_type_1', e.target.value)}
                      className={`w-full p-2 text-sm ${themeClasses.input} rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                    >
                      <option value="">All</option>
                      {getUniqueValues('event_type_1').map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-xs font-medium ${themeClasses.textSecondary} mb-1`}>SNAP Active</label>
                    <select
                      value={filters.snap_active}
                      onChange={(e) => handleFilterChange('snap_active', e.target.value)}
                      className={`w-full p-2 text-sm ${themeClasses.input} rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                    >
                      <option value="">All</option>
                      <option value="1">Yes</option>
                      <option value="0">No</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-xs font-medium ${themeClasses.textSecondary} mb-1`}>Weekday</label>
                    <select
                      value={filters.weekday}
                      onChange={(e) => handleFilterChange('weekday', e.target.value)}
                      className={`w-full p-2 text-sm ${themeClasses.input} rounded-lg focus:ring-2 focus:ring-blue-500 transition-all duration-300`}
                    >
                      <option value="">All</option>
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
            <div className={`mb-4 text-sm text-red-400 bg-red-900/20 border border-red-500/20 p-3 rounded-lg`}>
              ❌ {error}
            </div>
          )}

          {/* Main Content Layout */}
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Column Selector - Compact Sidebar */}
            {data.length > 0 && (
              <div className={`${themeClasses.cardBg} rounded-lg shadow border ${themeClasses.border} p-4 lg:w-64`}>
                <h3 className={`text-sm font-medium ${themeClasses.textSecondary} mb-3`}>Visible Columns</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {allColumns.map(column => (
                    <label key={column} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={visibleColumns.includes(column)}
                        onChange={() => toggleColumn(column)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`text-xs ${themeClasses.text}`}>{column}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Data Table - Compact */}
            <div className={`${themeClasses.cardBg} rounded-lg shadow border ${themeClasses.border} flex-1`}>
              <div className={`p-4 border-b ${themeClasses.border}`}>
                <h3 className={`text-lg font-semibold ${themeClasses.text}`}>
                  Sales Data ({filteredData.length} records)
                </h3>
              </div>
              
              <div className="overflow-x-auto max-h-80">
                <table className="w-full">
                  <thead className={`${themeClasses.tableHeader} sticky top-0 z-10`}>
                    <tr>
                      {visibleColumns.map(column => (
                        <th
                          key={column}
                          className="px-4 py-3 text-left text-xs font-medium text-white uppercase tracking-wider cursor-pointer hover:bg-gray-600/50 transition-colors"
                          onClick={() => handleSort(column)}
                        >
                          <div className="flex items-center gap-2">
                            {column.replace(/_/g, ' ')}
                            {sortConfig.key === column && (
                              <span className="text-blue-400">
                                {sortConfig.direction === 'asc' ? 
                                  <ChevronUp className="w-3 h-3" /> : 
                                  <ChevronDown className="w-3 h-3" />
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
                          <td key={column} className={`px-4 py-3 whitespace-nowrap text-sm ${themeClasses.text}`}>
                            { 
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
                <div className={`text-center py-8 ${themeClasses.textSecondary}`}>
                  {data.length === 0 ? "No data loaded yet. Click refresh to fetch data." : "No data matches your current filters"}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveSalesDashboard;