import { PrayerTimesData } from '../types';

// Default Fallback Timetable for Dhaka (Bangladesh standard time)
const DEFAULT_DHAKA_TIMETABLE: Record<number, PrayerTimesData['timings']> = {
  // Monthly approximate timings for Dhaka
  0: { Fajr: '05:18', Sunrise: '06:40', Dhuhr: '12:08', Asr: '15:20', Sunset: '17:35', Maghrib: '17:38', Isha: '18:55' }, // Jan
  1: { Fajr: '05:10', Sunrise: '06:28', Dhuhr: '12:12', Asr: '15:35', Sunset: '17:55', Maghrib: '17:58', Isha: '19:12' }, // Feb
  2: { Fajr: '04:52', Sunrise: '06:05', Dhuhr: '12:10', Asr: '15:40', Sunset: '18:10', Maghrib: '18:12', Isha: '19:25' }, // Mar
  3: { Fajr: '04:22', Sunrise: '05:38', Dhuhr: '12:02', Asr: '15:42', Sunset: '18:22', Maghrib: '18:25', Isha: '19:42' }, // Apr
  4: { Fajr: '03:58', Sunrise: '05:15', Dhuhr: '11:58', Asr: '15:45', Sunset: '18:40', Maghrib: '18:42', Isha: '20:02' }, // May
  5: { Fajr: '03:48', Sunrise: '05:10', Dhuhr: '12:02', Asr: '15:52', Sunset: '18:52', Maghrib: '18:54', Isha: '20:18' }, // Jun
  6: { Fajr: '03:56', Sunrise: '05:18', Dhuhr: '12:06', Asr: '15:55', Sunset: '18:52', Maghrib: '18:53', Isha: '20:16' }, // Jul
  7: { Fajr: '04:12', Sunrise: '05:30', Dhuhr: '12:04', Asr: '15:48', Sunset: '18:35', Maghrib: '18:37', Isha: '19:55' }, // Aug
  8: { Fajr: '04:25', Sunrise: '05:44', Dhuhr: '11:56', Asr: '15:28', Sunset: '18:05', Maghrib: '18:07', Isha: '19:24' }, // Sep (current)
  9: { Fajr: '04:38', Sunrise: '05:56', Dhuhr: '11:48', Asr: '15:05', Sunset: '17:35', Maghrib: '17:38', Isha: '18:55' }, // Oct
  10: { Fajr: '04:54', Sunrise: '06:14', Dhuhr: '11:48', Asr: '14:50', Sunset: '17:15', Maghrib: '17:17', Isha: '18:38' }, // Nov
  11: { Fajr: '05:10', Sunrise: '06:32', Dhuhr: '11:58', Asr: '14:55', Sunset: '17:15', Maghrib: '17:18', Isha: '18:40' }, // Dec
};

export async function fetchPrayerTimes(
  city: string = 'Dhaka',
  country: string = 'Bangladesh',
  date: Date = new Date()
): Promise<PrayerTimesData> {
  const dateStr = date.toISOString().slice(0, 10);
  const [yyyy, mm, dd] = dateStr.split('-');
  const monthIdx = date.getMonth();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 sec timeout to never block UI

    const url = `https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?city=${encodeURIComponent(
      city
    )}&country=${encodeURIComponent(country)}&method=1`;

    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.timings) {
        const raw = data.data.timings;
        return {
          city,
          country,
          date: dateStr,
          timings: {
            Fajr: raw.Fajr?.slice(0, 5) || '04:25',
            Sunrise: raw.Sunrise?.slice(0, 5) || '05:44',
            Dhuhr: raw.Dhuhr?.slice(0, 5) || '11:56',
            Asr: raw.Asr?.slice(0, 5) || '15:28',
            Sunset: raw.Sunset?.slice(0, 5) || '18:05',
            Maghrib: raw.Maghrib?.slice(0, 5) || '18:07',
            Isha: raw.Isha?.slice(0, 5) || '19:24',
          },
          source: 'aladhan_api',
        };
      }
    }
  } catch (err) {
    console.warn('Aladhan API unavailable, falling back to local Dhaka table', err);
  }

  // Fallback to local table
  return {
    city,
    country,
    date: dateStr,
    timings: DEFAULT_DHAKA_TIMETABLE[monthIdx] || DEFAULT_DHAKA_TIMETABLE[8],
    source: 'default_dhaka',
  };
}

export function formatTime12H(time24: string): string {
  if (!time24) return '';
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr || '00';
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${m} ${ampm}`;
}

export function getNextUpcomingPrayer(timings: PrayerTimesData['timings']): {
  name: 'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha';
  time: string;
  time12: string;
} {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const order: Array<'Fajr' | 'Dhuhr' | 'Asr' | 'Maghrib' | 'Isha'> = [
    'Fajr',
    'Dhuhr',
    'Asr',
    'Maghrib',
    'Isha',
  ];

  for (const prayer of order) {
    const timeStr = timings[prayer];
    if (timeStr) {
      const [h, m] = timeStr.split(':').map(Number);
      const prayerMinutes = h * 60 + m;
      if (prayerMinutes > currentMinutes) {
        return { name: prayer, time: timeStr, time12: formatTime12H(timeStr) };
      }
    }
  }

  // If after Isha, next is Fajr tomorrow
  return { name: 'Fajr', time: timings.Fajr, time12: formatTime12H(timings.Fajr) };
}
