
import React, { useState } from 'react';
import { Member, Income } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  members: Member[];
  incomes: Income[];
  onAdd: (income: Omit<Income, 'id'>) => void;
  onDelete: (id: string) => void;
}

const IncomeManager: React.FC<Props> = ({ members, incomes, onAdd, onDelete }) => {
  const [formData, setFormData] = useState({
    memberId: members[0]?.id || '',
    source: '',
    amount: 0,
    isRecurring: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount > 0 && formData.source) {
      onAdd(formData);
      setFormData(prev => ({ ...prev, source: '', amount: 0 }));
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end border border-gray-100">
        <div>
          <label className="block text-sm text-gray-600 mb-1">صاحب درآمد</label>
          <select 
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.memberId}
            onChange={e => setFormData({ ...formData, memberId: e.target.value })}
          >
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">منبع درآمد</label>
          <input 
            type="text" 
            placeholder="مثلا: حقوق ماهیانه"
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.source}
            onChange={e => setFormData({ ...formData, source: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">مبلغ ماهانه (تومان)</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
          />
        </div>
        <div className="flex items-center h-[42px]">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              checked={formData.isRecurring}
              onChange={e => setFormData({ ...formData, isRecurring: e.target.checked })}
              className="w-4 h-4 text-blue-600 rounded"
            />
            <span className="text-sm text-gray-600">درآمد مستمر ماهانه</span>
          </label>
        </div>
        <button type="submit" className="bg-blue-600 text-white p-2 rounded-lg font-bold hover:bg-blue-700 h-[42px]">ثبت درآمد</button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <th className="p-4">منبع</th>
              <th className="p-4">صاحب</th>
              <th className="p-4 text-center">نوع</th>
              <th className="p-4">مبلغ</th>
              <th className="p-4">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {incomes.map(income => (
              <tr key={income.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-bold">{income.source}</td>
                <td className="p-4">{members.find(m => m.id === income.memberId)?.name}</td>
                <td className="p-4 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${income.isRecurring ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {income.isRecurring ? 'مستمر' : 'یکبار'}
                  </span>
                </td>
                <td className="p-4 text-blue-600 font-bold">{formatCurrency(income.amount)}</td>
                <td className="p-4">
                  <button onClick={() => onDelete(income.id)} className="text-gray-400 hover:text-red-500 transition-colors">🗑️ حذف</button>
                </td>
              </tr>
            ))}
            {incomes.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">هیچ درآمدی ثبت نشده است.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IncomeManager;
