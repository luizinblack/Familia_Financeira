import React, { useMemo } from 'react';
import { Expense, User, Budget, ExpenseCategory } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  users: User[];
  budgets: Budget[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1', '#14b8a6'];

// Optimization: Component defined outside to prevent re-creation on every render
const StatCard = ({ title, value, icon: Icon, color }: any) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center justify-between">
    <div>
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <h3 className="text-2xl font-bold text-slate-800 mt-1">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
      <Icon className={color.replace('bg-', 'text-')} size={24} />
    </div>
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ expenses, users, budgets }) => {
  
  // Filter out cancelled expenses for all calculations
  const activeExpenses = useMemo(() => expenses.filter(e => e.status !== 'cancelled'), [expenses]);

  // Calculations
  const totalSpent = useMemo(() => activeExpenses.reduce((acc, curr) => acc + curr.amount, 0), [activeExpenses]);
  
  // Date Helpers
  const currentDate = new Date();
  const currentMonthIdx = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const currentMonthName = monthNames[currentMonthIdx];

  const currentMonthExpenses = activeExpenses.filter(e => {
    // Manually parse YYYY-MM-DD to avoid timezone issues
    const [y, m, d] = e.date.split('-').map(Number);
    // Month in split is 1-12, js Date is 0-11
    return (m - 1) === currentMonthIdx && y === currentYear;
  });

  const currentMonthTotal = currentMonthExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Category Data for Pie Chart
  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    activeExpenses.forEach(e => {
      map.set(e.category, (map.get(e.category) || 0) + e.amount);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [activeExpenses]);

  // User Data for Bar Chart - Optimized
  const userSpentData = useMemo(() => {
    const userMap = new Map<string, number>();
    activeExpenses.forEach(e => {
      userMap.set(e.userId, (userMap.get(e.userId) || 0) + e.amount);
    });
    
    return users.map(user => ({
      name: user.name.split(' ')[0],
      spent: userMap.get(user.id) || 0
    }));
  }, [activeExpenses, users]);

  // Monthly Comparison
  const monthlyData = useMemo(() => {
    const data = monthNames.map(m => ({ name: m, total: 0 }));
    
    activeExpenses.forEach(e => {
      const [y, m, d] = e.date.split('-').map(Number);
      if (y === currentYear) {
         data[m - 1].total += e.amount;
      }
    });
    
    // Filter to show only months with data or until current month
    // Simplified: show all months that have data
    return data.filter(d => d.total > 0);
  }, [activeExpenses, currentYear]);

  // Alerts
  const budgetAlerts = useMemo(() => {
    const alerts: string[] = [];
    budgets.forEach(budget => {
      const spentInCategory = categoryData.find(c => c.name === budget.category)?.value || 0;
      if (spentInCategory > budget.limit) {
        alerts.push(`Limite excedido em ${budget.category}: R$ ${spentInCategory.toFixed(2)} / R$ ${budget.limit.toFixed(2)}`);
      }
    });
    return alerts;
  }, [categoryData, budgets]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
          <p className="text-slate-500">Resumo financeiro da família</p>
        </div>
        <div className="mt-2 md:mt-0 text-right">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Mês Atual</span>
          <div className="text-lg font-bold text-emerald-600">{currentMonthName} {currentYear}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Gasto Total (Mês)" 
          value={`R$ ${currentMonthTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="bg-emerald-500"
        />
        <StatCard 
          title="Total Acumulado" 
          value={`R$ ${totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingUp}
          color="bg-blue-500"
        />
        <StatCard 
          title="Média por Pessoa" 
          value={`R$ ${(totalSpent / (users.length || 1)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          icon={TrendingDown}
          color="bg-purple-500"
        />
        <StatCard 
          title="Lançamentos Ativos" 
          value={activeExpenses.length}
          icon={PieChart}
          color="bg-orange-500"
        />
      </div>

      {/* Alerts Section */}
      {budgetAlerts.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Atenção aos Limites</h3>
              <div className="mt-2 text-sm text-red-700">
                <ul className="list-disc pl-5 space-y-1">
                  {budgetAlerts.map((alert, idx) => (
                    <li key={idx}>{alert}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Evolução Mensal ({currentYear})</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$${value}`} />
                <Tooltip 
                  formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Total']}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Pie */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Gastos por Categoria</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Spending by Person */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 lg:col-span-2">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Gastos por Familiar</h3>
          <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userSpentData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} />
                <Tooltip 
                   formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Gasto']}
                   cursor={{fill: 'transparent'}}
                />
                <Bar dataKey="spent" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};