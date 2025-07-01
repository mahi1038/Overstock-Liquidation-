import React from 'react';

const SkuSearchEdit = ({ sku, setSku, skuData, editStock, setEditStock, editPrice, setEditPrice, handleSearch, handleUpdate }) => (
  <div className="bg-white p-6 rounded-lg shadow mb-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full md:w-auto">
      <input
        type="text"
        value={sku}
        onChange={e => setSku(e.target.value)}
        placeholder="Search an SKU (e.g., SKU123)"
        className="w-64 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 placeholder-gray-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
      <button
        onClick={handleSearch}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
      >
        Search
      </button>
    </div>
    {skuData && (
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center w-full md:w-auto">
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">SKU</span>
          <span className="font-semibold">{skuData.sku}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Store</span>
          <span className="font-semibold">{skuData.store}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Stock</span>
          <input
            type="number"
            value={editStock}
            onChange={e => setEditStock(e.target.value)}
            className="w-20 px-2 py-1 rounded border border-gray-300"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-gray-500 text-sm">Price</span>
          <input
            type="number"
            value={editPrice}
            onChange={e => setEditPrice(e.target.value)}
            className="w-24 px-2 py-1 rounded border border-gray-300"
          />
        </div>
        <button
          onClick={handleUpdate}
          className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          Save
        </button>
      </div>
    )}
  </div>
);

export default SkuSearchEdit; 