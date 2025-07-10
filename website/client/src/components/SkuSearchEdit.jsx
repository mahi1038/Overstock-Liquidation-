import React from 'react';

const SkuSearchEdit = ({
  itemId,
  setItemId,
  storeId,
  setStoreId,
  snap,
  setSnap,
  sellPrice,
  setSellPrice,
  eventName1,
  setEventName1,
  eventType1,
  setEventType1,
  eventName2,
  setEventName2,
  eventType2,
  setEventType2,
  handleSubmit,
}) => {
  return (
    <div className="w-full mb-8 font-inter">
      <div className="bg-gradient-to-br from-[#1f2937] via-[#334155] to-[#0f172a] rounded-xl shadow-md p-6 md:p-8 text-white">
        <h2 className="text-xl font-semibold mb-6">Update Item Details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Item ID */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Item ID</label>
            <input
              type="text"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
              placeholder="e.g., ITEM123"
              className="px-4 py-2 rounded-lg border border-gray-600 bg-[#1e293b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Store ID */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Store ID</label>
            <input
              type="text"
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              placeholder="e.g., STORE456"
              className="px-4 py-2 rounded-lg border border-gray-600 bg-[#1e293b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Snap Active */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Snap Active</label>
            <select
              value={snap}
              onChange={(e) => setSnap(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-600 bg-[#1e293b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>

          {/* Sell Price */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Sell Price (₹)</label>
            <input
              type="number"
              value={sellPrice}
              onChange={(e) => setSellPrice(e.target.value)}
              placeholder="e.g., 1499"
              className="px-4 py-2 rounded-lg border border-gray-600 bg-[#1e293b] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Event Name 1 */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Event Name 1</label>
            <select
              value={eventName1}
              onChange={(e) => setEventName1(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-600 bg-[#1e293b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NAN">NAN</option>
              <option value="Discount">Discount</option>
              <option value="Clearance">Clearance</option>
              <option value="Festival Sale">Festival Sale</option>
            </select>
          </div>

          {/* Event Type 1 */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Event Type 1</label>
            <select
              value={eventType1}
              onChange={(e) => setEventType1(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-600 bg-[#1e293b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NAN">NAN</option>
              <option value="Online">Online</option>
              <option value="In-Store">In-Store</option>
              <option value="Flash Sale">Flash Sale</option>
            </select>
          </div>

          {/* Event Name 2 */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Event Name 2</label>
            <select
              value={eventName2}
              onChange={(e) => setEventName2(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-600 bg-[#1e293b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NAN">NAN</option>
              <option value="Discount">Discount</option>
              <option value="Clearance">Clearance</option>
              <option value="Festival Sale">Festival Sale</option>
            </select>
          </div>

          {/* Event Type 2 */}
          <div className="flex flex-col">
            <label className="text-sm text-gray-300 mb-1">Event Type 2</label>
            <select
              value={eventType2}
              onChange={(e) => setEventType2(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-600 bg-[#1e293b] text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NAN">NAN</option>
              <option value="Online">Online</option>
              <option value="In-Store">In-Store</option>
              <option value="Flash Sale">Flash Sale</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkuSearchEdit;

