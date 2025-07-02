import SideNavbar from './components/SideNavbar.jsx';
import Sidebar from './components/Sidebar.js';
import { useState } from 'react';
import SkuSearchEdit from './components/SkuSearchEdit.jsx';
import PredictionResults from './components/PredictionResults.jsx';
import StoreRiskMap from './components/StoreVisualize.jsx';

function App() {
    const [isOpen, setIsOpen] = useState(true);
  // Mock data for stats and recent activity
  const stats = [
    { label: 'Total Sales', value: '$12,340', icon: '💰' },
    { label: 'New Users', value: '1,234', icon: '👤' },
    { label: 'Revenue', value: '$8,900', icon: '📈' },
    { label: 'Pending Orders', value: '23', icon: '🕒' },
  ];
  const recentActivity = [
    { id: 1, user: 'Alice', action: 'Purchased SKU123', time: '2m ago' },
    { id: 2, user: 'Bob', action: 'Signed up', time: '10m ago' },
    { id: 3, user: 'Charlie', action: 'Purchased SKU456', time: '1h ago' },
    { id: 4, user: 'Dana', action: 'Requested refund', time: '2h ago' },
  ];
  const storeData = [
  { storeId: 'STORE001', name: 'Delhi Outlet', lat: 28.6139, lng: 77.2090, stock: 120, risk: 'high' },
  { storeId: 'STORE002', name: 'Mumbai Hub', lat: 19.0760, lng: 72.8777, stock: 85, risk: 'moderate' },
  { storeId: 'STORE003', name: 'Kolkata Depot', lat: 22.5726, lng: 88.3639, stock: 45, risk: 'low' },
  { storeId: 'STORE004', name: 'Bangalore Center', lat: 12.9716, lng: 77.5946, stock: 200, risk: 'ok' }
];


  // State for SKU search and edit
  const [sku, setSku] = useState('');
  const [skuData, setSkuData] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [prediction, setPrediction] = useState(null);

  // Mock SKU database
  const mockSkuDB = {
    SKU123: { sku: 'SKU123', store: 'Store A', stock: 120, price: 15.99 },
    SKU456: { sku: 'SKU456', store: 'Store B', stock: 80, price: 12.49 },
  };

  // Handle SKU search
  const handleSearch = () => {
    const data = mockSkuDB[sku.toUpperCase()];
    setSkuData(data || null);
    if (data) {
      setEditStock(data.stock);
      setEditPrice(data.price);
    }
  };

  // Handle SKU update
  const handleUpdate = () => {
    // Here you would update the DB; for now, just update local state
    setSkuData({ ...skuData, stock: editStock, price: editPrice });
    // Optionally show a success message
  };

  // Handle Run Prediction
  const handleRunPrediction = () => {
    // Mock prediction result
    setPrediction({
      atRisk: 5,
      riskLevel: 'High',
      overstockData: [
        { sku: 'SKU123', store: 'Store A', stock: 120, predicted: 60, confidence: '92%' },
        { sku: 'SKU456', store: 'Store B', stock: 80, predicted: 30, confidence: '88%' },
      ],
      clusterData: [
        { cluster: 'Bin 1', skus: 3, overstock: '60%' },
        { cluster: 'Bin 2', skus: 2, overstock: '40%' },
      ],
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* SideNavbar: hidden on small screens, visible on md+ */}
      <div className="hidden md:block"> 
         {/* <SideNavbar />  */}
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
      {/* <div style={{ marginLeft: isOpen ? '1px' : '80px', padding: '20px', width: '100%', transition: 'margin-left 0.3s ease' }}></div> */}
      </div>

      {/* Main content */}
      {/* <div className="flex-1 p-4 md:ml-64" style={{ backgroundColor: 'rgba(244, 251, 255, 0.93)' }}> */}
      <div
  className="flex-1 p-4 transition-all duration-300"
  style={{
    backgroundColor: 'rgba(244, 251, 255, 0.93)',
    marginLeft: isOpen ? '280px' : '80px',
  }}
>
        {/* Header row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-3xl font-bold text-gray-800">AI Overstock Liquidation Dashboard</h3>
            <p className="text-gray-500">Manage SKUs, predict overstock, and optimize inventory</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="p-2 rounded-full bg-white shadow hover:bg-blue-50 ml-2">
              <span role="img" aria-label="notifications">🔔</span>
            </button>
            <img
              src="https://randomuser.me/api/portraits/men/32.jpg"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-blue-200 object-cover"
            />
          </div>
        </div>

        {/* SKU Search & Edit Component */}
        <SkuSearchEdit
          sku={sku}
          setSku={setSku}
          skuData={skuData}
          editStock={editStock}
          setEditStock={setEditStock}
          editPrice={editPrice}
          setEditPrice={setEditPrice}
          handleSearch={handleSearch}
          handleUpdate={handleUpdate}
        />

        {/* Prediction Results Component */}
        <PredictionResults
          prediction={prediction}
          handleRunPrediction={handleRunPrediction}
        />
        {prediction && (
       <StoreRiskMap  storeData={storeData} />

)}

      </div>
    </div>
  );
}

export default App;