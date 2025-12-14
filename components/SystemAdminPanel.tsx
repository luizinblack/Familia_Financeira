import React, { useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { getUsers, getSystemWithdrawals, createSystemWithdrawal, SystemWithdrawal } from '../services/storageService';
import { Crown, DollarSign, Users, Search, TrendingUp, ShieldCheck, Wallet, ArrowRight, Download, History, CreditCard, LayoutGrid } from 'lucide-react';

export const SystemAdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'finance'>('overview');
  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<SystemWithdrawal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Withdrawal Form State
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [pixKey, setPixKey] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Load initial data
    setUsers(getUsers());
    setWithdrawals(getSystemWithdrawals());
  }, []);

  // Filter only premium users (subscribers)
  const premiumUsers = users.filter(u => u.plan === 'premium' && u.role !== UserRole.SYSTEM_ADMIN);
  const totalUsers = users.filter(u => u.role !== UserRole.SYSTEM_ADMIN).length;
  
  // Calculate Finances
  const totalRevenue = premiumUsers.length * 10.00;
  const totalWithdrawn = withdrawals.reduce((acc, curr) => acc + curr.amount, 0);
  const availableBalance = totalRevenue - totalWithdrawn;

  // Filter List for Overview Tab
  const filteredList = premiumUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.cpf.includes(searchTerm)
  );

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawMessage({ text: '', type: '' });
    
    const amount = parseFloat(withdrawAmount);

    if (isNaN(amount) || amount <= 0) {
      setWithdrawMessage({ text: 'Digite um valor válido.', type: 'error' });
      return;
    }

    if (amount > availableBalance) {
      setWithdrawMessage({ text: 'Saldo insuficiente para este valor.', type: 'error' });
      return;
    }

    if (!pixKey.trim()) {
      setWithdrawMessage({ text: 'Digite a chave PIX de destino.', type: 'error' });
      return;
    }

    setWithdrawLoading(true);
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      const newWithdrawal = createSystemWithdrawal(amount, 'PIX', pixKey);
      setWithdrawals(prev => [...prev, newWithdrawal]);
      setWithdrawMessage({ text: 'Saque realizado com sucesso!', type: 'success' });
      setWithdrawAmount('');
      setPixKey('');
    } catch (error) {
      setWithdrawMessage({ text: 'Erro ao processar saque.', type: 'error' });
    } finally {
      setWithdrawLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('pt-BR') + ' às ' + date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header Panel */}
      <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-xl border border-slate-700 relative overflow-hidden">
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
               <div className="flex items-center space-x-2 mb-2">
                  <div className="bg-indigo-500 p-1.5 rounded-md">
                     <ShieldCheck size={20} className="text-white" />
                  </div>
                  <span className="text-indigo-300 font-bold tracking-wider text-xs uppercase">Área Restrita</span>
               </div>
               <h2 className="text-3xl font-bold">Painel do Dono</h2>
               <p className="text-slate-400 mt-1">Gestão centralizada e retirada de lucros.</p>
            </div>
            
            <div className="mt-6 md:mt-0 flex space-x-2 bg-slate-800 p-1 rounded-lg">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <LayoutGrid size={16} />
                  <span>Visão Geral</span>
                </button>
                <button
                  onClick={() => setActiveTab('finance')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === 'finance' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
                >
                  <DollarSign size={16} />
                  <span>Financeiro</span>
                </button>
            </div>
         </div>
         
         {/* Background Decor */}
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-20"></div>
         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-emerald-600 rounded-full blur-3xl opacity-20"></div>
      </div>

      {/* ---------------- OVERVIEW TAB ---------------- */}
      {activeTab === 'overview' && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                   <p className="text-sm text-slate-500 font-medium">Assinantes Ativos</p>
                   <h3 className="text-3xl font-bold text-slate-800 mt-1">{premiumUsers.length}</h3>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                   <Crown className="text-amber-600" size={24} />
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                   <p className="text-sm text-slate-500 font-medium">Total de Usuários</p>
                   <h3 className="text-3xl font-bold text-slate-800 mt-1">{totalUsers}</h3>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                   <Users className="text-blue-600" size={24} />
                </div>
             </div>

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                   <p className="text-sm text-slate-500 font-medium">MRR (Receita Recorrente)</p>
                   <h3 className="text-3xl font-bold text-slate-800 mt-1">
                      R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                   </h3>
                </div>
                <div className="bg-emerald-100 p-3 rounded-full">
                   <TrendingUp className="text-emerald-600" size={24} />
                </div>
             </div>
          </div>

          {/* Subscribers List */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
             <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                   <Crown size={20} className="text-amber-500 mr-2" />
                   Lista de Assinantes (Premium)
                </h3>
                
                <div className="relative w-full md:w-64">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search size={16} className="text-slate-400" />
                   </div>
                   <input
                      type="text"
                      placeholder="Buscar assinante..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 text-sm border bg-white text-slate-800"
                   />
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                   <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                         <th className="px-6 py-4 font-semibold">Usuário</th>
                         <th className="px-6 py-4 font-semibold">Email</th>
                         <th className="px-6 py-4 font-semibold">CPF</th>
                         <th className="px-6 py-4 font-semibold">Plano</th>
                         <th className="px-6 py-4 font-semibold text-right">Valor Mensal</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {filteredList.length === 0 ? (
                         <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                               {searchTerm ? 'Nenhum assinante encontrado com este filtro.' : 'Nenhum assinante ativo no momento.'}
                            </td>
                         </tr>
                      ) : (
                         filteredList.map(user => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                               <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                     <img src={user.avatar} alt="" className="w-8 h-8 rounded-full mr-3 border border-slate-200" />
                                     <div>
                                        <div className="font-medium text-slate-800">{user.name}</div>
                                        <div className="text-xs text-slate-400">{user.role === UserRole.ADMIN ? 'Chefe de Família' : 'Membro'}</div>
                                     </div>
                                  </div>
                               </td>
                               <td className="px-6 py-4 text-slate-600">{user.email}</td>
                               <td className="px-6 py-4 font-mono text-xs">{user.cpf}</td>
                               <td className="px-6 py-4">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                                     <Crown size={10} className="mr-1 fill-amber-700" />
                                     PREMIUM
                                  </span>
                               </td>
                               <td className="px-6 py-4 text-right font-medium text-emerald-600">
                                  R$ 10,00
                               </td>
                            </tr>
                         ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </>
      )}

      {/* ---------------- FINANCE TAB ---------------- */}
      {activeTab === 'finance' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Financial Overview Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-emerald-600 text-white p-6 rounded-xl shadow-lg border border-emerald-500 relative overflow-hidden">
               <div className="relative z-10">
                 <p className="text-emerald-100 text-sm font-medium mb-1">Saldo Disponível para Saque</p>
                 <h3 className="text-4xl font-extrabold tracking-tight">R$ {availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
                 <p className="text-xs text-emerald-200 mt-2 opacity-80">Receita total menos saques realizados.</p>
               </div>
               <div className="absolute right-0 bottom-0 p-4 opacity-10">
                 <Wallet size={100} />
               </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-sm text-slate-500 font-medium">Total Sacado</p>
                 <div className="bg-slate-100 p-2 rounded-full"><Download size={16} className="text-slate-600"/></div>
               </div>
               <h3 className="text-2xl font-bold text-slate-800">R$ {totalWithdrawn.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-center">
               <div className="flex items-center justify-between mb-2">
                 <p className="text-sm text-slate-500 font-medium">Receita Bruta Total</p>
                 <div className="bg-blue-100 p-2 rounded-full"><TrendingUp size={16} className="text-blue-600"/></div>
               </div>
               <h3 className="text-2xl font-bold text-slate-800">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            </div>
          </div>

          {/* Withdrawal Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-slate-200 p-6 h-full">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <CreditCard size={20} className="mr-2 text-indigo-600" />
                Solicitar Saque
              </h3>
              
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Valor do Saque (R$)</label>
                   <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 font-bold text-sm">R$</span>
                      <input 
                        type="number"
                        step="0.01"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 font-medium text-slate-800 bg-white"
                        placeholder="0.00"
                      />
                   </div>
                   <p className="text-xs text-slate-400 mt-1 text-right">Máx: R$ {availableBalance.toFixed(2)}</p>
                </div>

                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Chave PIX de Destino</label>
                   <input 
                      type="text"
                      value={pixKey}
                      onChange={(e) => setPixKey(e.target.value)}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm bg-white text-slate-800"
                      placeholder="CPF, Email, Telefone ou Aleatória"
                   />
                </div>

                {withdrawMessage.text && (
                  <div className={`text-xs p-3 rounded-lg ${withdrawMessage.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {withdrawMessage.text}
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={withdrawLoading || availableBalance <= 0}
                  className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                   {withdrawLoading ? 'Processando...' : (
                     <>
                       <span>Confirmar Transferência</span>
                       <ArrowRight size={16} className="ml-2" />
                     </>
                   )}
                </button>
                <p className="text-xs text-center text-slate-400">Transferência simulada instantânea.</p>
              </form>
            </div>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <History size={20} className="mr-2 text-slate-500" />
                  Histórico de Saques
                </h3>
              </div>
              
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Data</th>
                      <th className="px-6 py-4 font-semibold">Método</th>
                      <th className="px-6 py-4 font-semibold">Destino</th>
                      <th className="px-6 py-4 font-semibold text-right">Valor</th>
                      <th className="px-6 py-4 font-semibold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                     {withdrawals.length === 0 ? (
                        <tr>
                           <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                              Nenhum saque realizado ainda.
                           </td>
                        </tr>
                     ) : (
                       // Reverse to show newest first
                       [...withdrawals].reverse().map((w) => (
                         <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-6 py-4 whitespace-nowrap text-slate-500 text-xs">
                             {formatDate(w.date)}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                             {w.method}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-slate-500">
                             {w.destination}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-red-600">
                             - R$ {w.amount.toFixed(2)}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-center">
                             <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">
                               Concluído
                             </span>
                           </td>
                         </tr>
                       ))
                     )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};