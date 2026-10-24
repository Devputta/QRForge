import React from 'react';
import { GoogleMapsConfig } from '../../types/qr';
import { MapPin, Navigation, Car, Footprints, Bike, Bus } from 'lucide-react';

interface GoogleMapsFormProps {
  config: GoogleMapsConfig;
  onChange: (config: GoogleMapsConfig) => void;
  error?: string;
}

export const GoogleMapsForm: React.FC<GoogleMapsFormProps> = ({
  config,
  onChange,
  error,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1 p-1 bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg">
        <button
          type="button"
          onClick={() => onChange({ ...config, mode: 'search' })}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            config.mode === 'search'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Place or address</span>
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...config, mode: 'directions' })}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            config.mode === 'directions'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Directions</span>
        </button>
        <button
          type="button"
          onClick={() => onChange({ ...config, mode: 'url' })}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            config.mode === 'url'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
          }`}
        >
          <span>Map link</span>
        </button>
      </div>

      {config.mode === 'search' && (
        <div className="space-y-2">
          <label htmlFor="maps-query" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Place name or street address
          </label>
          <input
            id="maps-query"
            type="text"
            value={config.searchQuery}
            onChange={(e) => onChange({ ...config, searchQuery: e.target.value })}
            placeholder="e.g. Central Park, New York, NY"
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          {config.searchQuery.includes('maps.app.goo.gl') || config.searchQuery.includes('google.com/maps') ? (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" />
              Google Maps link detected: using the exact link directly.
            </p>
          ) : (
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Creates a direct Google Maps search link.
            </p>
          )}
        </div>
      )}

      {config.mode === 'directions' && (
        <div className="space-y-3">
          <div>
            <label htmlFor="maps-dest" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Destination address
            </label>
            <input
              id="maps-dest"
              type="text"
              value={config.destinationAddress}
              onChange={(e) => onChange({ ...config, destinationAddress: e.target.value })}
              placeholder="e.g. Times Square, New York"
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="maps-origin" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1">
              Starting point (optional)
            </label>
            <input
              id="maps-origin"
              type="text"
              value={config.originAddress}
              onChange={(e) => onChange({ ...config, originAddress: e.target.value })}
              placeholder="Leave blank to use the scanner's current location"
              className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-1.5">
              Travel mode
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'driving', label: 'Drive', icon: Car },
                { id: 'transit', label: 'Transit', icon: Bus },
                { id: 'walking', label: 'Walk', icon: Footprints },
                { id: 'bicycling', label: 'Bicycle', icon: Bike },
              ].map(({ id, label, icon: Icon }) => {
                const isActive = config.travelMode === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => onChange({ ...config, travelMode: id as any })}
                    className={`flex flex-col items-center justify-center py-2 px-2 rounded-md border text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                      isActive
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-neutral-800 text-indigo-700 dark:text-neutral-100 font-medium shadow-xs'
                        : 'border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-200'
                    }`}
                  >
                    <Icon className="w-4 h-4 mb-1" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {config.mode === 'url' && (
        <div className="space-y-2">
          <label htmlFor="maps-pasted" className="block text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            Google Maps share link
          </label>
          <input
            id="maps-pasted"
            type="text"
            value={config.pastedUrl}
            onChange={(e) => onChange({ ...config, pastedUrl: e.target.value })}
            placeholder="https://maps.app.goo.gl/... or https://google.com/maps/..."
            className="w-full bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700/80 rounded-md px-3.5 py-2.5 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Keeps short links like maps.app.goo.gl and regular map links intact.
          </p>
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
};
