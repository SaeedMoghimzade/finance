
import React, { useState } from 'react';
import { Member, Liability, RepaymentType, Installment } from '../types';
import { formatCurrency, generateId, addCommas, removeCommas } from '../utils';

interface Props {
  members: Member[];
  liabilities: Liability[];
  onAdd: (liability: Omit<Liability, 'id'>) => void;
  onToggleInstallment: (lId: string, iId: string) => void;
  onUpdateInstallmentAmount: (lId: string, iId: string, amount: number) => void;
  onDelete: (id: string) => void;
}

const LiabilitiesManager: React.FC<Props> = ({ members, liabilities, onAdd, onToggleInstallment, onUpdateInstallmentAmount, onDelete }) => {
  const [formData, setFormData] = useState({
    memberId: members[0]?.id || '',
    title: '',
    totalAmount: 0,
    repaymentType: RepaymentType.INSTALLMENT,
    installmentsCount: 12,
    startDate: new Date().toISOString().split('T')[0],
    description: ''
  });

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingInstallmentId, setEditingInstallmentId] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState<number>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.totalAmount > 0 && formData.title) {
      const installments: Installment[] = [];
      const installmentAmount = Math.floor(formData.totalAmount / formData.installmentsCount);
      
      if (formData.repaymentType === RepaymentType.INSTALLMENT) {
        for (let i = 0; i < formData.installmentsCount; i++) {
          const date = new Date(formData.startDate);
          date.setMonth(date.getMonth() + i);
          installments.push({
            id: generateId(),
            dueDate: date.toISOString().split('T')[0],
            amount: i === formData.installmentsCount - 1 ? formData.totalAmount - (installmentAmount * (formData.installmentsCount - 1)) : installmentAmount,
            isPaid: false
          });
        }
      } else {
        installments.push({
          id: generateId(),
          dueDate: formData.startDate,
          amount: formData.totalAmount,
          isPaid: false
        });
      }

      onAdd({
        memberId: formData.memberId,
        title: formData.title,
        totalAmount: formData.totalAmount,
        repaymentType: formData.repaymentType,
        installments,
        startDate: formData.startDate,
        description: formData.description
      });

      setFormData(prev => ({ ...prev, title: '', totalAmount: 0, description: '' }));
    }
  };

  const handleStartEdit = (ins: Installment) => {
    setEditingInstallmentId(ins.id);
    setTempAmount(ins.amount);
  };

  const handleSaveEdit = (liabilityId: string, installmentId: string) => {
    onUpdateInstallmentAmount(liabilityId, installmentId, tempAmount);
    setEditingInstallmentId(null);
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">شخص مدیون</label>
            <select 
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.memberId}
              onChange={e => setFormData({ ...formData, memberId: e.target.value })}
            >
              {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">عنوان بدهی / وام</label>
            <input 
              type="text" 
              placeholder="مثلا: وام مسکن"
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">مبلغ کل (تومان)</label>
            <input 
              type="text" 
              inputMode="numeric"
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold"
              value={addCommas(formData.totalAmount)}
              onChange={e => setFormData({ ...formData, totalAmount: removeCommas(e.target.value) })}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">تاریخ شروع / سررسید</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.startDate}
              onChange={e => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-600 mb-1">نوع بازپرداخت</label>
            <select 
              className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.repaymentType}
              onChange={e => setFormData({ ...formData, repaymentType: e.target.value as RepaymentType })}
            >
              <option value={RepaymentType.INSTALLMENT}>اقساطی</option>
              <option value={RepaymentType.LUMP_SUM}>یکجا</option>
            </select>
          </div>
          {formData.repaymentType === RepaymentType.INSTALLMENT && (
            <div>
              <label className="block text-sm text-gray-600 mb-1">تعداد اقساط</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.installmentsCount}
                onChange={e => setFormData({ ...formData, installmentsCount: Number(e.target.value) })}
              />
            </div>
          )}
          <button type="submit" className="bg-red-600 text-white p-2 rounded-lg font-bold hover:bg-red-700 h-[42px]">ثبت بدهی جدید</button>
        </div>
      </form>

      <div className="space-y-4">
        {liabilities.map(l => {
          const paidCount = l.installments.filter(i => i.isPaid).length;
          const totalCount = l.installments.length;
          const remainingAmount = l.installments.filter(i => !i.isPaid).reduce((s, ins) => s + ins.amount, 0);

          return (
            <div key={l.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div 
                className="p-6 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === l.id ? null : l.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <h3 className="text-lg font-bold">{l.title}</h3>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                      {members.find(m => m.id === l.memberId)?.name}
                    </span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    مبلغ کل: {formatCurrency(l.totalAmount)} | باقیمانده: <span className="text-red-600 font-bold">{formatCurrency(remainingAmount)}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-left">
                    <div className="text-sm font-medium">{paidCount} از {totalCount} قسط پرداخت شده</div>
                    <div className="w-32 h-2 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-green-50 transition-all duration-500" 
                        style={{ width: `${(paidCount / totalCount) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(l.id); }}
                    className="text-gray-400 hover:text-red-500 p-2"
                  >🗑️</button>
                  <span className={`text-xl transition-transform duration-300 ${expandedId === l.id ? 'rotate-180' : ''}`}>▼</span>
                </div>
              </div>

              {expandedId === l.id && (
                <div className="border-t border-gray-100 p-6 bg-gray-50">
                  <h4 className="font-bold mb-4 text-sm text-gray-600 uppercase tracking-wider">لیست اقساط و وضعیت پرداخت</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {l.installments.map((ins, idx) => (
                      <div 
                        key={ins.id} 
                        className={`p-3 rounded-xl border flex flex-col gap-2 transition-all ${ins.isPaid ? 'bg-green-50 border-green-100 opacity-80' : 'bg-white border-gray-200 shadow-sm'}`}
                      >
                        <div className="flex justify-between items-center">
                          <div className="text-xs text-gray-400">قسط {idx + 1}</div>
                          <input 
                            type="checkbox" 
                            checked={ins.isPaid}
                            onChange={() => onToggleInstallment(l.id, ins.id)}
                            className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                          />
                        </div>
                        
                        <div className="flex justify-between items-end">
                          <div>
                            {editingInstallmentId === ins.id ? (
                              <div className="flex items-center gap-1">
                                <input 
                                  autoFocus
                                  type="text"
                                  inputMode="numeric"
                                  className="w-24 p-1 text-xs border rounded outline-none focus:ring-1 focus:ring-blue-400 font-bold"
                                  value={addCommas(tempAmount)}
                                  onChange={e => setTempAmount(removeCommas(e.target.value))}
                                />
                                <button 
                                  onClick={() => handleSaveEdit(l.id, ins.id)}
                                  className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded"
                                >✔</button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2 group/amount">
                                <div className="font-bold text-sm">{formatCurrency(ins.amount)}</div>
                                {!ins.isPaid && (
                                  <button 
                                    onClick={() => handleStartEdit(ins)}
                                    className="text-[10px] text-blue-400 opacity-0 group-hover/amount:opacity-100 transition-opacity"
                                  >ویرایش</button>
                                )}
                              </div>
                            )}
                            <div className="text-[10px] text-gray-500">{new Date(ins.dueDate).toLocaleDateString('fa-IR')}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {liabilities.length === 0 && (
          <div className="bg-white p-12 text-center rounded-2xl border-2 border-dashed border-gray-200 text-gray-400">
            هنوز هیچ بدهی یا وامی ثبت نشده است.
          </div>
        )}
      </div>
    </div>
  );
};

export default LiabilitiesManager;
