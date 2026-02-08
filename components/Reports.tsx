
import React, { useMemo } from 'react';
import { FinancialData, AssetType } from '../types';
import { formatCurrency, getPersianMonthName } from '../utils';

const Reports: React.FC<{ data: FinancialData }> = ({ data }) => {
  
  // 1. Monthly Repayment Schedule Report
  const monthlyRepayments = useMemo(() => {
    const months: Record<string, { total: number; details: { title: string; amount: number; member: string; isPaid: boolean }[] }> = {};
    
    data.liabilities.forEach(l => {
      l.installments.forEach(ins => {
        const monthKey = ins.dueDate.substring(0, 7); // YYYY-MM
        if (!months[monthKey]) months[monthKey] = { total: 0, details: [] };
        months[monthKey].total += ins.amount;
        months[monthKey].details.push({
          title: l.title,
          amount: ins.amount,
          member: data.members.find(m => m.id === l.memberId)?.name || 'نامشخص',
          isPaid: ins.isPaid
        });
      });
    });

    return Object.entries(months).sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  // 2. Per Member Summary
  const memberSummaries = useMemo(() => {
    return data.members.map(m => {
      const assets = data.assets.filter(a => a.memberId === m.id).reduce((sum, a) => sum + a.amount, 0);
      const liabilities = data.liabilities.filter(l => l.memberId === m.id).reduce((sum, l) => {
        const remaining = l.installments.filter(i => !i.isPaid).reduce((s, ins) => s + ins.amount, 0);
        return sum + remaining;
      }, 0);
      const monthlyIncome = data.incomes.filter(i => i.memberId === m.id && i.isRecurring).reduce((sum, i) => sum + i.amount, 0);
      
      return {
        id: m.id,
        name: m.name,
        assets,
        liabilities,
        monthlyIncome,
        net: assets - liabilities
      };
    });
  }, [data]);

  // 3. Monthly Balance Forecast (Next 12 Months starting from current month)
  const balanceForecast = useMemo(() => {
    const recurringIncome = data.incomes.filter(i => i.isRecurring).reduce((sum, i) => sum + i.amount, 0);
    const months = [];
    const today = new Date();
    
    for (let i = 0; i < 12; i++) {
      // Create a date for the 1st of each month starting from the current month
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      
      // Generate reliable YYYY-MM string to match against installment.dueDate
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const monthStr = `${year}-${month.toString().padStart(2, '0')}`;
      
      const installmentsInMonth = data.liabilities.reduce((sum, l) => {
        return sum + l.installments
          .filter(ins => ins.dueDate.startsWith(monthStr))
          .reduce((s, ins) => s + ins.amount, 0);
      }, 0);

      // Use standard Intl to get localized Persian month/year for better look
      const persianLabel = new Intl.DateTimeFormat('fa-IR', { month: 'long', year: 'numeric' }).format(d);

      months.push({
        name: persianLabel,
        income: recurringIncome,
        expenses: installmentsInMonth,
        balance: recurringIncome - installmentsInMonth
      });
    }
    return months;
  }, [data]);

  return (
    <div className="space-y-10">
      {/* 1. Member Financial Overview */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-blue-100 p-2 rounded-lg">👥</span> وضعیت دارایی و بدهی به تفکیک اعضا
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memberSummaries.map(ms => (
            <div key={ms.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg text-slate-700">{ms.name}</h3>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${ms.net >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  خالص: {formatCurrency(ms.net)}
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">کل دارایی‌ها</span>
                  <span className="font-bold text-green-600">{formatCurrency(ms.assets)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">بدهی باقیمانده</span>
                  <span className="font-bold text-red-600">{formatCurrency(ms.liabilities)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-gray-50">
                  <span className="text-gray-500">درآمد مستمر ماهانه</span>
                  <span className="font-bold text-blue-600">{formatCurrency(ms.monthlyIncome)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Monthly Balance Forecast */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-green-100 p-2 rounded-lg">⚖️</span> تراز ماهانه (پیش‌بینی ۱۲ ماهه از ماه جاری)
        </h2>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                <th className="p-4">ماه</th>
                <th className="p-4">کل درآمد مستمر</th>
                <th className="p-4">کل بدهی ماه (اقساط)</th>
                <th className="p-4">تراز خالص</th>
              </tr>
            </thead>
            <tbody>
              {balanceForecast.map((m, idx) => (
                <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-bold">{m.name}</td>
                  <td className="p-4 text-blue-600">{formatCurrency(m.income)}</td>
                  <td className="p-4 text-red-600">{formatCurrency(m.expenses)}</td>
                  <td className={`p-4 font-bold ${m.balance >= 0 ? 'text-green-600' : 'text-red-700'}`}>
                    {formatCurrency(m.balance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 3. Detailed Monthly Repayment Breakdown */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span className="bg-purple-100 p-2 rounded-lg">📊</span> جزئیات ریز بدهی‌های هر ماه
        </h2>
        <div className="space-y-4">
          {monthlyRepayments.map(([month, data]) => (
            <div key={month} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
                <span className="font-bold">{month}</span>
                <span className="bg-red-500 px-3 py-1 rounded-full text-sm">مجموع: {formatCurrency(data.total)}</span>
              </div>
              <div className="p-4 space-y-2">
                {data.details.map((d, i) => (
                  <div 
                    key={i} 
                    className={`flex justify-between items-center text-sm p-3 rounded-lg border transition-all ${
                      d.isPaid 
                        ? 'bg-green-50 border-green-100 opacity-60' 
                        : 'bg-white border-transparent hover:bg-gray-50 shadow-sm'
                    }`}
                  >
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${d.isPaid ? 'text-green-800 line-through' : 'text-gray-700'}`}>
                          {d.title}
                        </span>
                        {d.isPaid && (
                          <span className="text-[10px] bg-green-200 text-green-900 px-1.5 py-0.5 rounded-md font-bold">
                            پرداخت شده ✓
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-gray-400">توسط: {d.member}</span>
                    </div>
                    <span className={`font-bold ${d.isPaid ? 'text-green-600' : 'text-red-500'}`}>
                      {formatCurrency(d.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {monthlyRepayments.length === 0 && (
            <div className="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
              داده‌ای برای نمایش بدهی‌های ماهانه وجود ندارد.
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Reports;
