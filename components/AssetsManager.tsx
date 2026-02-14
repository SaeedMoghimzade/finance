
import React, { useState } from 'react';
import { Member, Asset, AssetType } from '../types';
import { formatCurrency, addCommas, removeCommas } from '../utils';

interface Props {
  members: Member[];
  assets: Asset[];
  onAdd: (asset: Omit<Asset, 'id'>) => void;
  onUpdateAmount: (id: string, amount: number) => void;
  onDelete: (id: string) => void;
}

const AssetsManager: React.FC<Props> = ({ members, assets, onAdd, onUpdateAmount, onDelete }) => {
  const [formData, setFormData] = useState({
    memberId: members[0]?.id || '',
    type: AssetType.CASH,
    title: '',
    amount: 0
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount > 0 && formData.title) {
      onAdd(formData);
      setFormData(prev => ({ ...prev, title: '', amount: 0 }));
    }
  };

  const handleStartEdit = (asset: Asset) => {
    setEditingId(asset.id);
    setTempAmount(asset.amount);
  };

  const handleSaveEdit = (id: string) => {
    onUpdateAmount(id, tempAmount);
    setEditingId(null);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end border border-gray-100">
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-bold">صاحب دارایی</label>
          <select 
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.memberId}
            onChange={e => setFormData({ ...formData, memberId: e.target.value })}
          >
            {members.length > 0 ? (
              members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)
            ) : (
              <option disabled>ابتدا عضو اضافه کنید</option>
            )}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-bold">نوع دارایی</label>
          <select 
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.type}
            onChange={e => setFormData({ ...formData, type: e.target.value as AssetType })}
          >
            {Object.values(AssetType).map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-bold">عنوان دارایی</label>
          <input 
            type="text" 
            placeholder="مثلا: حساب بانک ملی"
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600 mb-1 font-bold">ارزش / موجودی (تومان)</label>
          <input 
            type="text" 
            inputMode="numeric"
            className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
            value={addCommas(formData.amount)}
            onChange={e => setFormData({ ...formData, amount: removeCommas(e.target.value) })}
          />
        </div>
        <button type="submit" className="bg-green-600 text-white p-2 rounded-lg font-bold hover:bg-green-700 h-[42px] shadow-sm">ثبت دارایی</button>
      </form>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
              <th className="p-4 font-bold">عنوان</th>
              <th className="p-4 font-bold">نوع</th>
              <th className="p-4 font-bold">صاحب</th>
              <th className="p-4 font-bold">ارزش / موجودی</th>
              <th className="p-4 font-bold text-center">عملیات</th>
            </tr>
          </thead>
          <tbody>
            {assets.map(asset => (
              <tr key={asset.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <td className="p-4 font-medium">{asset.title}</td>
                <td className="p-4">
                  <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full">{asset.type}</span>
                </td>
                <td className="p-4 text-gray-600">
                  {members.find(m => m.id === asset.memberId)?.name || 'نامشخص'}
                </td>
                <td className="p-4">
                  {editingId === asset.id ? (
                    <div className="flex items-center gap-2">
                      <input 
                        autoFocus
                        type="text"
                        inputMode="numeric"
                        className="w-32 p-1 border rounded outline-none focus:ring-2 focus:ring-blue-400 font-bold"
                        value={addCommas(tempAmount)}
                        onChange={e => setTempAmount(removeCommas(e.target.value))}
                      />
                      <button 
                        onClick={() => handleSaveEdit(asset.id)}
                        className="bg-green-500 text-white p-1 rounded hover:bg-green-600"
                        title="ذخیره"
                      >✅</button>
                      <button 
                        onClick={() => setEditingId(null)}
                        className="bg-gray-200 text-gray-600 p-1 rounded hover:bg-gray-300"
                        title="انصراف"
                      >✖</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 group">
                      <span className="text-green-600 font-bold">{formatCurrency(asset.amount)}</span>
                      <button 
                        onClick={() => handleStartEdit(asset)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-blue-500 hover:text-blue-700"
                        title="ویرایش موجودی"
                      >
                        ✏️
                      </button>
                    </div>
                  )}
                </td>
                <td className="p-4 text-center">
                  <button 
                    onClick={() => onDelete(asset.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                    title="حذف دارایی"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-4xl">💰</span>
                    هیچ دارایی ثبت نشده است.
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssetsManager;
