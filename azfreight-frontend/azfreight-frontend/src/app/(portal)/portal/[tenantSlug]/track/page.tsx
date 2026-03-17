'use client';

import { useState } from 'react';

export default function TrackPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');

  const handleTrack = () => {
    if (!trackingNumber.trim()) {
      setError('Please enter a tracking number');
      return;
    }
    // TODO: Implement tracking API
    setError('Tracking feature coming soon. Please contact us for shipment status.');
  };

  return (
    <div className="max-w-lg mx-auto py-16">
      <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Track Shipment</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <label className="block text-sm font-medium text-slate-700 mb-1">Reference Number</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => { setTrackingNumber(e.target.value); setError(''); }}
            placeholder="e.g. SHP-20260317-0001"
            className="input-field flex-1"
          />
          <button onClick={handleTrack} className="btn-primary whitespace-nowrap">Track</button>
        </div>
        {error && <p className="text-sm text-amber-600 mt-3">{error}</p>}
      </div>
    </div>
  );
}
