
import React, { useState, useRef, useEffect } from 'react';
import { toJalali, toGregorian, getPersianMonthName, formatPersianDate, JalaliDate } from '../utils';

interface Props {
  value: string; // ISO format (YYYY-MM-DD)
  onChange: (value: string) => void;
  label?: string;
}

const PersianDatePicker: React.FC<Props> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get TODAY's local Jalali date
  const getTodayJalali = (): JalaliDate => {
    const now = new Date();
    return toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
  };

  // Convert string value to Jalali object safely
  const valueToJalali = (val: string): JalaliDate => {
    if (!val) return getTodayJalali();
    const parts = val.split('-');
    if (parts.length === 3) {
      return toJalali(parseInt(parts[0], 10), parseInt(parts[1], 10), parseInt(parts[2], 10));
    }
    return getTodayJalali();
  };

  // The month/year currently being VIEWED in the picker
  const [viewJalali, setViewJalali] = useState<JalaliDate>(valueToJalali(value));

  // Sync view when opening or value changes
  useEffect(() => {
    if (isOpen) {
      setViewJalali(valueToJalali(value));
    }
  }, [isOpen, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isLeapYear = (y: number) => {
    const r = (y - 474) % 2820;
    return (((r + 474) + 38) * 31) % 128 < 31;
  };

  const daysInMonth = (m: number, y: number) => {
    if (m <= 6) return 31;
    if (m <= 11) return 30;
    return isLeapYear(y) ? 30 : 29;
  };

  const getFirstDayOfMonth = (y: number, m: number) => {
    const g = toGregorian(y, m, 1);
    // JS getDay(): 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    // Persian Week: Sat=0, Sun=1, Mon=2, Tue=3, Wed=4, Thu=5, Fri=6
    return (g.getDay() + 1) % 7;
  };

  const handleDayClick = (day: number) => {
    const g = toGregorian(viewJalali.jy, viewJalali.jm, day);
    const yStr = g.getFullYear().toString();
    const mStr = (g.getMonth() + 1).toString().padStart(2, '0');
    const dStr = g.getDate().toString().padStart(2, '0');
    onChange(`${yStr}-${mStr}-${dStr}`);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    let nm = viewJalali.jm + offset;
    let ny = viewJalali.jy;
    if (nm > 12) { nm = 1; ny++; }
    if (nm < 1) { nm = 12; ny--; }
    setViewJalali({ jy: ny, jm: nm, jd: 1 });
  };

  const dayLabels = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const firstDay = getFirstDayOfMonth(viewJalali.jy, viewJalali.jm);
  const totalDays = daysInMonth(viewJalali.jm, viewJalali.jy);
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: totalDays }, (_, i) => i + 1);
  const f = new Intl.NumberFormat('fa-IR', { useGrouping: false });

  // Check if a day in grid is "today"
  const isDateToday = (jDay: number) => {
    const today = getTodayJalali();
    return today.jy === viewJalali.jy && today.jm === viewJalali.jm && today.jd === jDay;
  };

  return (
    <div className="relative" ref={containerRef}>
      {label && <label className="block text-sm text-gray-600 mb-1 font-bold">{label}</label>}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-2.5 border border-gray-200 rounded-xl bg-white cursor-pointer flex justify-between items-center hover:border-blue-400 transition-all shadow-sm"
      >
        <span className="font-sans font-bold text-slate-800">{formatPersianDate(value) || 'انتخاب تاریخ'}</span>
        <span className="text-blue-500">📅</span>
      </div>

      {isOpen && (
        <div className="absolute z-[100] top-full mt-2 right-0 left-auto bg-white shadow-2xl rounded-2xl border border-gray-100 p-4 w-80 animate-in fade-in zoom-in duration-200">
          <div className="flex justify-between items-center mb-6">
            <button type="button" onClick={() => changeMonth(1)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">▶</button>
            <div className="font-bold text-slate-800 flex items-center gap-2 text-lg">
              <span>{getPersianMonthName(viewJalali.jm)}</span>
              <span className="font-sans">{f.format(viewJalali.jy)}</span>
            </div>
            <button type="button" onClick={() => changeMonth(-1)} className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">◀</button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayLabels.map(l => (
              <div key={l} className={`text-center text-xs font-bold py-2 ${l === 'ج' ? 'text-red-400' : 'text-gray-400'}`}>{l}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {blanks.map((_, i) => <div key={`b-${i}`} className="h-10 w-10" />)}
            {days.map(d => {
              const isSelected = value && value === (() => {
                const g = toGregorian(viewJalali.jy, viewJalali.jm, d);
                return `${g.getFullYear()}-${(g.getMonth() + 1).toString().padStart(2, '0')}-${g.getDate().toString().padStart(2, '0')}`;
              })();
              const isToday = isDateToday(d);

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleDayClick(d)}
                  className={`h-10 w-10 flex items-center justify-center text-sm rounded-xl transition-all font-sans font-bold ${
                    isSelected 
                    ? 'bg-blue-600 text-white shadow-lg ring-2 ring-blue-200' 
                    : isToday 
                    ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-300'
                    : 'hover:bg-gray-50 text-slate-700'
                  }`}
                >
                  {f.format(d)}
                </button>
              );
            })}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-50 flex justify-between items-center px-2">
             <button 
               type="button"
               onClick={() => {
                 const t = getTodayJalali();
                 const g = toGregorian(t.jy, t.jm, t.jd);
                 const yStr = g.getFullYear().toString();
                 const mStr = (g.getMonth() + 1).toString().padStart(2, '0');
                 const dStr = g.getDate().toString().padStart(2, '0');
                 onChange(`${yStr}-${mStr}-${dStr}`);
                 setIsOpen(false);
               }}
               className="text-xs text-blue-600 hover:text-blue-800 font-bold"
             >
               برو به امروز
             </button>
             <button 
               type="button"
               onClick={() => setIsOpen(false)}
               className="text-xs text-gray-400 font-bold"
             >
               بستن
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersianDatePicker;
