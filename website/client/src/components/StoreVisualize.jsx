import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Color logic based on risk level
const getColor = (risk) => {
  switch (risk?.toLowerCase()) {
    case 'high': return 'red';
    case 'moderate': return 'orange';
    case 'low': return 'yellow';
    default: return 'blue';
  }
};

const StoreMapDashboard = ({ storeData = [] }) => {
  const [selectedStore, setSelectedStore] = useState(null);

  return (
    <div className="w-full mb-8 font-inter">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overstock SKUs</h2>
      <div className="w-full h-[600px] rounded-lg shadow border border-gray-200 overflow-hidden">
        <MapContainer
          center={[20.5937, 78.9629]} // Center on India
          zoom={4.8}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {storeData?.map((store, idx) => (
            <Marker
              key={idx}
              position={[store.lat, store.lng]}
              eventHandlers={{
                click: () => setSelectedStore(store),
              }}
              icon={L.divIcon({
                className: 'custom-icon',
                html: `<div style="background:${getColor(store.risk)}; width:16px; height:16px; border-radius:50%; border:2px solid white;"></div>`
              })}
            >
              <Popup>
                <strong>{store.name}</strong><br />
                Store ID: {store.storeId}<br />
                Stock: {store.stock}<br />
                Risk: {store.risk}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default StoreMapDashboard;
