
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

export const getPersianMonthName = (monthIndex: number): string => {
  const months = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];
  return months[monthIndex % 12];
};

export const generateId = () => Math.random().toString(36).substr(2, 9);
