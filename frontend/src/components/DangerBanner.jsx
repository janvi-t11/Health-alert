import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ExclamationTriangleIcon, XMarkIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useData } from '../context/DataContext';

export default function DangerBanner() {
  const { dangerZone } = useData();
  const [dismissed, setDismissed] = useState(false);

  if (!dangerZone || dismissed) return null;

  const isCritical = dangerZone.type === 'critical';

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-2 text-sm ${
        isCritical
          ? 'bg-red-600 text-white'
          : 'bg-orange-500 text-white'
      }`}
      style={{ minHeight: '36px' }}
    >
      {/* Left — icon + message */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <ExclamationTriangleIcon className="h-4 w-4 shrink-0 opacity-90" />
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPinIcon className="h-3.5 w-3.5 shrink-0 opacity-75" />
          <span className="font-medium truncate">
            {isCritical ? '🚨 Danger Zone:' : '⚠️ Health Alert:'}
          </span>
          <span className="opacity-90 truncate">
            {dangerZone.count} {isCritical ? 'critical' : 'high severity'} report{dangerZone.count > 1 ? 's' : ''} in {dangerZone.city}
          </span>
        </div>
      </div>

      {/* Right — view link + dismiss */}
      <div className="flex items-center gap-3 ml-4 shrink-0">
        <Link
          to={`/reports?city=${encodeURIComponent(dangerZone.city)}`}
          className="text-xs font-semibold underline underline-offset-2 opacity-90 hover:opacity-100 whitespace-nowrap"
        >
          View Reports
        </Link>
        <button
          onClick={() => setDismissed(true)}
          className="opacity-75 hover:opacity-100 transition-opacity"
          aria-label="Dismiss"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
