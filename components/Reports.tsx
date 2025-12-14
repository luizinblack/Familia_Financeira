import React, { useMemo } from 'react';
import { Expense, User, ExpenseStatus } from '../types';
import { CheckCircle, Clock, Calendar, Tag, XCircle, Check, X } from 'lucide-react';

interface ReportsProps {
  expenses: Expense[];
  users: User[];
  onUpdateStatus: (id: string, status: ExpenseStatus) => void;
}

export const Reports: React.FC<ReportsProps> = ({ expenses, users, onUpdateStatus }) => {
  // Ordenar por data decrescente
  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses]);

  // Total should ignore cancelled items
  const totalValue = sortedExpenses
    .filter(e => e.status !== 'cancelled')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Helper for date display YYYY-MM-DD -> DD/MM/YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const getStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle size={12} className="mr-1" /> Pago
          </span>
        );
      case 'pending':
        return (
           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock size={12} className="mr-1" /> Pendente
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500 line-through">
            <XCircle size={12} className="mr-1" /> Cancelado
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Relatório de Gestão</h2>
          <p className="text-slate-500">Alterar status e visualizar consolidados</p>
        </div>
        <div className="mt-4 md:mt-0 bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100">
          <span className="text-sm text-emerald-600 font-semibold uppercase tracking-wider">Total (Ativos)</span>
          <div className="text-xl font-bold text-emerald-700">
            R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status Atual</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Categoria</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Valor</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedExpenses.map((expense) => (
                <tr key={expense.id} className={`hover:bg-slate-50 transition-colors ${expense.status === 'cancelled' ? 'opacity-60 bg-slate-50' : ''}`}>
                  {/* Data */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-slate-600 font-medium">
                      <Calendar size={14} className="mr-2 text-slate-400" />
                      {formatDate(expense.date)}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(expense.status)}
                  </td>

                  {/* Descrição */}
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-900 font-medium">{expense.description}</div>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center">
                      <span className="truncate max-w-[200px]">{expense.location}</span>
                    </div>
                  </td>

                  {/* Categoria */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-slate-600">
                      <Tag size={14} className="mr-2 text-slate-400" />
                      {expense.category}
                    </div>
                  </td>

                  {/* Valor */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className={`text-sm font-bold ${expense.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                      R$ {expense.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </td>

                  {/* Ações */}
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center space-x-2">
                       <button 
                         onClick={() => onUpdateStatus(expense.id, 'paid')}
                         disabled={expense.status === 'paid'}
                         className={`p-1.5 rounded-md transition-colors ${expense.status === 'paid' ? 'bg-emerald-100 text-emerald-400 cursor-default' : 'bg-slate-100 text-slate-400 hover:bg-emerald-100 hover:text-emerald-600'}`}
                         title="Marcar como Pago"
                       >
                         <Check size={16} />
                       </button>

                       <button 
                         onClick={() => onUpdateStatus(expense.id, 'pending')}
                         disabled={expense.status === 'pending'}
                         className={`p-1.5 rounded-md transition-colors ${expense.status === 'pending' ? 'bg-amber-100 text-amber-400 cursor-default' : 'bg-slate-100 text-slate-400 hover:bg-amber-100 hover:text-amber-600'}`}
                         title="Marcar como Pendente"
                       >
                         <Clock size={16} />
                       </button>

                       <button 
                         onClick={() => onUpdateStatus(expense.id, 'cancelled')}
                         disabled={expense.status === 'cancelled'}
                         className={`p-1.5 rounded-md transition-colors ${expense.status === 'cancelled' ? 'bg-red-100 text-red-400 cursor-default' : 'bg-slate-100 text-slate-400 hover:bg-red-100 hover:text-red-600'}`}
                         title="Cancelar Lançamento"
                       >
                         <X size={16} />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {sortedExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Nenhum registro encontrado para exibição.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};