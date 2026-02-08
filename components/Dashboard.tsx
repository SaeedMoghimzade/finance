
import React from 'react';
import { FinancialData } from '../types';
import { formatCurrency } from '../utils';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const Dashboard: React.FC<{ data: FinancialData }> = ({ data }) => {
  const totalAssets = data.assets.reduce((sum, a) => sum + a.amount, 0);
  const totalLiabilities = data.liabilities.reduce((sum, l) => sum + l.totalAmount, 0);
  const totalPaidLiabilities = data.liabilities.reduce((sum, l) => {
    return sum + l.installments.filter(i => i.isPaid).reduce((s, ins) => s + ins.amount, 0);
  }, 0);
  const netWorth = totalAssets - (totalLiabilities - totalPaidLiabilities);

  const assetDistribution = data.assets.reduce((acc: any[], asset) => {
    const existing = acc.find(item => item.name === asset.type);
    if (existing) existing.value += asset.amount;
    else acc.push({ name: asset.type, value: asset.amount });
    return acc;
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="کل دارایی‌ها" value={formatCurrency(totalAssets)} color="text-green-600" bg="bg-green-50" icon="💰" />
        <StatCard title="بدهی باقیمانده" value={formatCurrency(totalLiabilities - totalPaidLiabilities)} color="text-red-600" bg="bg-red-50" icon="📉" />
        <StatCard title="خالص دارایی (تراز)" value={formatCurrency(netWorth)} color="text-blue-600" bg="bg-blue-50" icon="⚖️" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">توزیع نوع دارایی‌ها</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name }) => name}
                >
                  {assetDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold mb-4">وضعیت بدهی به تفکیک اعضا</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data.members.map(m => ({
                  name: m.name,
                  بدهی: data.liabilities.filter(l => l.memberId === m.id).reduce((sum, l) => sum + l.totalAmount, 0)
                }))}
                layout="vertical"
              >
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="بدهی" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: string; color: string; bg: string; icon: string }> = ({ title, value, color, bg, icon }) => (
  <div className={`${bg} p-6 rounded-2xl shadow-sm flex items-center justify-between border border-gray-100`}>
    <div>
      <p className="text-sm text-gray-500 font-medium mb-1">{title}</p>
      <p className={`text-xl font-bold ${color}`}>{value}</p>
    </div>
    <div className="text-3xl bg-white p-3 rounded-full shadow-inner">{icon}</div>
  </div>
);

export default Dashboard;
