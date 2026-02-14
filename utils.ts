
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};

export const addCommas = (val: number | string): string => {
  if (val === undefined || val === null || val === '') return '';
  const str = val.toString().replace(/,/g, '');
  return str.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const removeCommas = (str: string): number => {
  return Number(str.replace(/,/g, '')) || 0;
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

// --- Robust Jalaali Conversion Algorithm (Jalaali-js based) ---

export interface JalaliDate {
  jy: number;
  jm: number;
  jd: number;
}

/**
 * Converts Gregorian date to Jalali
 */
export function toJalali(gy: number, gm: number, gd: number): JalaliDate {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy, jm, jd, days;
  let gy2 = (gm > 2) ? (gy - 1600) : (gy - 1601);
  days = 365 * gy2 + Math.floor((gy2 + 3) / 4) - Math.floor((gy2 + 99) / 100) + Math.floor((gy2 + 399) / 400) + gd + g_d_m[gm - 1];
  jy = 979 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return { jy, jm, jd };
}

/**
 * Converts Jalali date to Gregorian
 */
export function toGregorian(jy: number, jm: number, jd: number): Date {
  const jalali_to_gregorian = (jy: number, jm: number, jd: number) => {
    let days, gy, gm, gd;
    jy -= 979;
    jd -= 1;
    days = 365 * jy + Math.floor(jy / 33) * 8 + Math.floor((jy % 33 + 3) / 4) + jd + (jm < 7 ? (jm - 1) * 31 : (jm - 7) * 30 + 186);
    gy = 1600 + 400 * Math.floor(days / 146097);
    days %= 146097;
    if (days > 36524) {
      gy += 100 * Math.floor(--days / 36524);
      days %= 36524;
      if (days >= 365) days++;
    }
    gy += 4 * Math.floor(days / 1461);
    days %= 1461;
    if (days > 365) {
      gy += Math.floor((days - 1) / 365);
      days = (days - 1) % 365;
    }
    gd = days + 1;
    const sal = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    for (gm = 1; gm <= 12; gm++) {
      if (gd <= sal[gm]) break;
      gd -= sal[gm];
    }
    return { gy, gm, gd };
  };
  const res = jalali_to_gregorian(jy, jm, jd);
  return new Date(res.gy, res.gm - 1, res.gd);
}

export const getPersianMonthName = (monthIndex: number): string => {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return months[(monthIndex - 1) % 12];
};

/**
 * Formats a YYYY-MM-DD string into a Persian date string
 */
export const formatPersianDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return '';
  
  const gy = parseInt(parts[0], 10);
  const gm = parseInt(parts[1], 10);
  const gd = parseInt(parts[2], 10);
  
  const j = toJalali(gy, gm, gd);
  const f = new Intl.NumberFormat('fa-IR', { useGrouping: false });
  return `${f.format(j.jy)}/${f.format(j.jm).padStart(2, '۰')}/${f.format(j.jd).padStart(2, '۰')}`;
};
