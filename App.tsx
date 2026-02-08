
import React, { useState, useEffect } from 'react';
import { Member, Asset, Liability, Income, FinancialData } from './types';
import { generateId } from './utils';
import { saveData, loadData } from './db';
import Dashboard from './components/Dashboard';
import MembersManager from './components/MembersManager';
import AssetsManager from './components/AssetsManager';
import LiabilitiesManager from './components/LiabilitiesManager';
import IncomeManager from './components/IncomeManager';
import Reports from './components/Reports';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'members' | 'assets' | 'liabilities' | 'income' | 'reports'>('dashboard');
  const [isLoaded, setIsLoaded] = useState(false);
  
  const [data, setData] = useState<FinancialData>({
    members: [],
    assets: [],
    liabilities: [],
    incomes: []
  });

  useEffect(() => {
    const init = async () => {
      const saved = await loadData();
      if (saved) {
        setData(saved);
      }
      setIsLoaded(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (isLoaded) {
      saveData(data);
    }
  }, [data, isLoaded]);

  const addMember = (name: string) => {
    setData(prev => ({ ...prev, members: [...prev.members, { id: generateId(), name }] }));
  };

  const deleteMember = (id: string) => {
    setData(prev => ({
      ...prev,
      members: prev.members.filter(m => m.id !== id),
      assets: prev.assets.filter(a => a.memberId !== id),
      liabilities: prev.liabilities.filter(l => l.memberId !== id),
      incomes: prev.incomes.filter(i => i.memberId !== id)
    }));
  };

  const addAsset = (asset: Omit<Asset, 'id'>) => {
    setData(prev => ({ ...prev, assets: [...prev.assets, { ...asset, id: generateId() }] }));
  };

  const addLiability = (liability: Omit<Liability, 'id'>) => {
    setData(prev => ({ ...prev, liabilities: [...prev.liabilities, { ...liability, id: generateId() }] }));
  };

  const deleteLiability = (id: string) => {
    setData(prev => ({ ...prev, liabilities: prev.liabilities.filter(l => l.id !== id) }));
  };

  const addIncome = (income: Omit<Income, 'id'>) => {
    setData(prev => ({ ...prev, incomes: [...prev.incomes, { ...income, id: generateId() }] }));
  };

  const deleteIncome = (id: string) => {
    setData(prev => ({ ...prev, incomes: prev.incomes.filter(i => i.id !== id) }));
  };

  const toggleInstallment = (liabilityId: string, installmentId: string) => {
    setData(prev => ({
      ...prev,
      liabilities: prev.liabilities.map(l => {
        if (l.id === liabilityId) {
          return {
            ...l,
            installments: l.installments.map(ins => ins.id === installmentId ? { ...ins, isPaid: !ins.isPaid } : ins)
          };
        }
        return l;
      })
    }));
  };

  const updateInstallmentAmount = (liabilityId: string, installmentId: string, newAmount: number) => {
    setData(prev => ({
      ...prev,
      liabilities: prev.liabilities.map(l => {
        if (l.id === liabilityId) {
          const updatedInstallments = l.installments.map(ins => 
            ins.id === installmentId ? { ...ins, amount: newAmount } : ins
          );
          // Optional: Update total amount based on sum of installments or keep it as metadata
          const newTotal = updatedInstallments.reduce((sum, ins) => sum + ins.amount, 0);
          return {
            ...l,
            installments: updatedInstallments,
            totalAmount: newTotal
          };
        }
        return l;
      })
    }));
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center animate-pulse">
          <div className="text-4xl mb-4">💰</div>
          <div className="text-xl font-bold">در حال بارگذاری اطلاعات مالی...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-800">
      <nav className="w-full md:w-64 bg-slate-900 text-white p-6 space-y-2 flex-shrink-0">
        <div className="text-2xl font-bold mb-8 text-blue-400 border-b border-gray-700 pb-4 text-center">حساب‌وکتاب من</div>
        <NavItem active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} icon="📊" label="داشبورد" />
        <NavItem active={activeTab === 'members'} onClick={() => setActiveTab('members')} icon="👥" label="اعضای خانواده" />
        <NavItem active={activeTab === 'assets'} onClick={() => setActiveTab('assets')} icon="💰" label="ثبت دارایی‌ها" />
        <NavItem active={activeTab === 'liabilities'} onClick={() => setActiveTab('liabilities')} icon="📉" label="بدهی‌ها و وام‌ها" />
        <NavItem active={activeTab === 'income'} onClick={() => setActiveTab('income')} icon="💸" label="درآمدهای مستمر" />
        <NavItem active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} icon="📑" label="گزارشات جامع" />
      </nav>

      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        <header className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-2xl font-bold text-slate-800">
            {activeTab === 'dashboard' && 'نمای کلی وضعیت مالی'}
            {activeTab === 'members' && 'مدیریت اعضا'}
            {activeTab === 'assets' && 'مدیریت دارایی‌ها'}
            {activeTab === 'liabilities' && 'مدیریت بدهی‌ها و اقساط'}
            {activeTab === 'income' && 'مدیریت درآمدهای مستمر'}
            {activeTab === 'reports' && 'گزارشات و تحلیل تراز'}
          </h1>
          <div className="text-sm text-gray-500 font-medium">امروز: {new Date().toLocaleDateString('fa-IR')}</div>
        </header>

        <div className="max-w-6xl mx-auto pb-12">
          {activeTab === 'dashboard' && <Dashboard data={data} />}
          {activeTab === 'members' && <MembersManager members={data.members} onAdd={addMember} onDelete={deleteMember} />}
          {activeTab === 'assets' && <AssetsManager members={data.members} assets={data.assets} onAdd={addAsset} />}
          {activeTab === 'liabilities' && (
            <LiabilitiesManager 
              members={data.members} 
              liabilities={data.liabilities} 
              onAdd={addLiability} 
              onToggleInstallment={toggleInstallment}
              onUpdateInstallmentAmount={updateInstallmentAmount}
              onDelete={deleteLiability}
            />
          )}
          {activeTab === 'income' && <IncomeManager members={data.members} incomes={data.incomes} onAdd={addIncome} onDelete={deleteIncome} />}
          {activeTab === 'reports' && <Reports data={data} />}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 space-x-reverse p-3 rounded-xl transition-all duration-300 ${active ? 'bg-blue-600 text-white shadow-lg translate-x-1' : 'hover:bg-slate-800 text-gray-400 hover:text-white'}`}
  >
    <span className="text-xl">{icon}</span>
    <span className="font-bold">{label}</span>
  </button>
);

export default App;
