import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

import Sidebar from './components/Sidebar';
import SkuSearchEdit from './components/SkuSearchEdit';
import PredictionResults from './components/PredictionResults';
import StoreRiskMap from './components/StoreVisualize';
import Login from './components/Login';
import Signup from './components/Signup';

import { auth } from './firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import storeData from './data/storeData';

function App() {
  const [user, setUser] = useState(null);
  const [isOpen, setIsOpen] = useState(true);
  const [sku, setSku] = useState('');
  const [skuData, setSkuData] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert('Logged out successfully!');
    } catch (err) {
      alert('Error logging out: ' + err.message);
    }
  };

  const mockSkuDB = {
    SKU123: { sku: 'SKU123', store: 'Store A', stock: 120, price: 15.99 },
    SKU456: { sku: 'SKU456', store: 'Store B', stock: 80, price: 12.49 },
  };

  const handleSearch = () => {
    const data = mockSkuDB[sku.toUpperCase()];
    setSkuData(data || null);
    if (data) {
      setEditStock(data.stock);
      setEditPrice(data.price);
    }
  };

  const handleUpdate = () => {
    setSkuData({ ...skuData, stock: editStock, price: editPrice });
  };

  const handleRunPrediction = () => {
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
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <div className="flex flex-col md:flex-row min-h-screen">
                <div className="hidden md:block">
                  <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
                </div>
                <div
                  className="flex-1 p-4 transition-all duration-300"
                  style={{
                    backgroundColor: 'rgba(244, 251, 255, 0.93)',
                    marginLeft: isOpen ? '280px' : '80px',
                  }}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-3xl font-bold text-gray-800">
                        AI Overstock Liquidation Dashboard
                      </h3>
                      <p className="text-gray-500">
                        Manage SKUs, predict overstock, and optimize inventory
                      </p>
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
                      <button
                        onClick={handleLogout}
                        className="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
                      >
                        Logout
                      </button>
                    </div>
                  </div>

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

                  <PredictionResults
                    prediction={prediction}
                    handleRunPrediction={handleRunPrediction}
                  />

                  {prediction && <StoreRiskMap storeData={storeData} />}
                </div>
              </div>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </Router>
  );
}

export default App;
