
import React, { useState } from 'react';
import { Member, Asset, AssetType } from '../types';
import { formatCurrency } from '../utils';

interface Props {
  members: Member[];
  assets: Asset[];
  onAdd: (asset: Omit<Asset, 'id'>) => void;
}

const AssetsManager: React.FC<Props> = ({ members, assets, onAdd }) => {
  const [formData, setFormData] = useState({
    memberId: members[0]?.id || '',
    type: AssetType.CASH,
    title: '',
    amount: 0
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount > 0 && formData.title) {
      onAdd(formData);
      setFormData(prev => ({ ...prev, title: '', amount: 0 }));
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end border border-gray-100">
        <div>
          <label className="block text-sm text-gray-600 mb-1">صاحب دارایی</label>
          <select 
            className="w-full p-2 border rounded-lg"
            value={formData.memberId}
            onChange={e => setFormData({ ...formData, memberId: e.target.value })}
          >
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">نوع دارایی</label>
          <select 
            className="w-full p-2 border rounded-lg"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value as AssetType })}
          >
            {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">عنوان دارایی</label>
          <input 
            type="text" 
            placeholder="مثلا: حساب بانک ملی"
            className="w-full p-2 border rounded-lg"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1">ارزش / موجودی (تومان)</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded-lg"
            value={formData.amount}
            onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
          />
        </div>
        <button type="submit" className="bg-green-600 text-white p-2 rounded-lg font-bold hover:bg-green-700">ثبت دارایی</button>
      </form>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <th className="p-4">عنوان</th>
              <th className="p-4">نوع</th>
              <th className="p-4">صاحب</th>
              <th className="p-4">ارزش</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => (
              <tr key={asset.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="p-4 font-medium">{asset.title}</td>
                <td className="p-4"><span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{asset.type}</span></td>
                <td className="p-4">{members.find(m => m.id === asset.memberId)?.name}</td>
                <td className="p-4 text-green-600 font-bold">{formatCurrency(asset.amount)}</td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">هیچ دارایی ثبت نشده است.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetsManager;
