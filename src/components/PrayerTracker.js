import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
const STATUS_OPTIONS = ['none', 'on-time', 'late', 'missed'];

const getDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getFormattedDate = (dateStr) => {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (getDateString(date) === getDateString(today)) {
    return 'Today';
  } else if (getDateString(date) === getDateString(yesterday)) {
    return 'Yesterday';
  }
  
  const options = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

const getLast7Days = () => {
  const dates = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dates.push(getDateString(date));
  }
  return dates;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'on-time':
      return 'bg-green-500 hover:bg-green-600';
    case 'late':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'missed':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-200 hover:bg-gray-300';
  }
};

const getStatusLabel = (status) => {
  switch (status) {
    case 'on-time':
      return '✓';
    case 'late':
      return '~';
    case 'missed':
      return '✗';
    default:
      return '';
  }
};

export const PrayerTracker = () => {
  const { user } = useAuth();
  const [prayerData, setPrayerData] = useState({});
  const [loading, setLoading] = useState(true);
  const dates = getLast7Days();

  // Load prayer data from Firestore
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadPrayerData = async () => {
      try {
        const data = {};
        
        for (const date of dates) {
          const docRef = doc(db, 'users', user.uid, 'prayers', date);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            data[date] = docSnap.data();
          } else {
            data[date] = {};
          }
        }
        
        setPrayerData(data);
        setLoading(false);
      } catch (error) {
        console.error('Error loading prayer data:', error);
        setLoading(false);
      }
    };

    loadPrayerData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCellClick = async (date, prayer) => {
    if (!user) return;

    const currentStatus = prayerData[date]?.[prayer] || 'none';
    const currentIndex = STATUS_OPTIONS.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % STATUS_OPTIONS.length;
    const nextStatus = STATUS_OPTIONS[nextIndex];

    // Update local state immediately for fast UI
    setPrayerData(prev => ({
      ...prev,
      [date]: {
        ...prev[date],
        [prayer]: nextStatus
      }
    }));

    // Save to Firestore
    try {
      const docRef = doc(db, 'users', user.uid, 'prayers', date);
      await setDoc(docRef, {
        ...prayerData[date],
        [prayer]: nextStatus
      }, { merge: true });
    } catch (error) {
      console.error('Error saving prayer status:', error);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full" data-testid="prayer-tracker-signin">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Prayer Tracker</h2>
        <p className="text-gray-600">Please sign in to track your prayers.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-4xl w-full" data-testid="prayer-tracker-loading">
        <div className="text-center text-gray-600">Loading prayer data...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6 max-w-4xl w-full" data-testid="prayer-tracker">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Prayer Tracker</h2>
        <p className="text-sm text-gray-600">Tap to cycle: Empty → On-time → Late → Missed</p>
      </div>

      {/* Prayer Grid */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-2 text-left font-semibold text-gray-700 border-b-2 border-gray-300 min-w-[100px]">
                Date
              </th>
              {PRAYERS.map(prayer => (
                <th 
                  key={prayer} 
                  className="p-2 text-center font-semibold text-gray-700 border-b-2 border-gray-300 min-w-[70px] text-sm sm:text-base"
                  data-testid={`prayer-header-${prayer.toLowerCase()}`}
                >
                  {prayer}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dates.map(date => (
              <tr key={date} className="border-b border-gray-200">
                <td className="p-2 font-medium text-gray-700 text-sm sm:text-base" data-testid={`date-${date}`}>
                  {getFormattedDate(date)}
                </td>
                {PRAYERS.map(prayer => {
                  const status = prayerData[date]?.[prayer] || 'none';
                  return (
                    <td key={prayer} className="p-1">
                      <button
                        onClick={() => handleCellClick(date, prayer)}
                        className={`w-full h-12 sm:h-14 rounded-lg transition-colors duration-200 font-bold text-white text-lg ${getStatusColor(status)}`}
                        data-testid={`cell-${date}-${prayer.toLowerCase()}`}
                        aria-label={`${prayer} on ${date}: ${status}`}
                      >
                        {getStatusLabel(status)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Legend:</h3>
        <div className="flex flex-wrap gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-green-500 flex items-center justify-center text-white font-bold">✓</div>
            <span className="text-gray-600">On-time</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-500 flex items-center justify-center text-white font-bold">~</div>
            <span className="text-gray-600">Late</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center text-white font-bold">✗</div>
            <span className="text-gray-600">Missed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-200"></div>
            <span className="text-gray-600">Not recorded</span>
          </div>
        </div>
      </div>
    </div>
  );
};
