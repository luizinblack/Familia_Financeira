import React, { useState, useMemo } from 'react';
import { Expense, ExpenseCategory, User, ExpenseStatus } from '../types';
import { Download, Search, FileText, Trash2, Calendar, CheckCircle, Clock, XCircle, X, Eye } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  users: User[];
  onDelete: (id: string) => void;
}

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, users, onDelete }) => {
  const [filterText, setFilterText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // State for Attachment Modal
  const [viewingAttachment, setViewingAttachment] = useState<{name: string, data: string} | null>(null);

  // Helper for date display YYYY-MM-DD -> DD/MM/YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const matchesText = 
        expense.description.toLowerCase().includes(filterText.toLowerCase()) || 
        expense.location.toLowerCase().includes(filterText.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || expense.category === filterCategory;
      const matchesUser = filterUser === 'all' || expense.userId === filterUser;
      
      const matchesStatus = filterStatus === 'all' || expense.status === filterStatus;

      const matchesStartDate = !startDate || expense.date >= startDate;
      const matchesEndDate = !endDate || expense.date <= endDate;

      return matchesText && matchesCategory && matchesUser && matchesStatus && matchesStartDate && matchesEndDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, filterText, filterCategory, filterUser, filterStatus, startDate, endDate]);

  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Desconhecido';
  const getUserAvatar = (id: string) => users.find(u => u.id === id)?.avatar || '';

  const getStatusBadge = (status: ExpenseStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="flex items-center text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full text-xs font-semibold w-fit">
            <CheckCircle size={14} className="mr-1" /> Pago
          </span>
        );
      case 'pending':
        return (
          <span className="flex items-center text-amber-600 bg-amber-50 px-2 py-1 rounded-full text-xs font-semibold w-fit">
            <Clock size={14} className="mr-1" /> Pendente
          </span>
        );
      case 'cancelled':
        return (
           <span className="flex items-center text-slate-500 bg-slate-100 px-2 py-1 rounded-full text-xs font-semibold w-fit line-through">
            <XCircle size={14} className="mr-1" /> Cancelado
          </span>
        );
    }
  };

  const handleExport = () => {
    const headers = ['Data', 'Status', 'Usuario', 'Categoria', 'Local', 'Descricao', 'Valor', 'Obs'];
    const csvContent = [
      headers.join(','),
      ...filteredExpenses.map(e => [
        e.date,
        e.status,
        `"${getUserName(e.userId)}"`,
        e.category,
        `"${e.location.replace(/"/g, '""')}"`, // Escape quotes and wrap in quotes to allow commas
        `"${e.description.replace(/"/g, '""')}"`,
        e.amount,
        `"${(e.notes || '').replace(/"/g, '""')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    
    // Use local date for filename
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    link.download = `gastos_${dateStr}.csv`;
    link.click();
  };

  const getMimeType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return 'application/pdf';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext || '')) return `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    return 'application/octet-stream';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <h2 className="text-2xl font-bold text-slate-800">Histórico de Lançamentos</h2>
        <button
          onClick={handleExport}
          className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 text-sm font-medium shadow-sm"
        >
          <Download size={16} />
          <span>Exportar CSV</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="relative col-span-1 md:col-span-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-slate-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por descrição ou local..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-10 w-full rounded-lg border-slate-200 bg-white text-slate-800 text-sm p-2.5 focus:ring-emerald-500 focus:border-emerald-500 border"
          />
        </div>

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="col-span-1 md:col-span-2 w-full rounded-lg border-slate-200 bg-white text-slate-800 text-sm p-2.5 border"
        >
          <option value="all">Todas Categorias</option>
          {Object.values(ExpenseCategory).map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <select
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
          className="col-span-1 md:col-span-2 w-full rounded-lg border-slate-200 bg-white text-slate-800 text-sm p-2.5 border"
        >
          <option value="all">Todos Membros</option>
          {users.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="col-span-1 md:col-span-2 w-full rounded-lg border-slate-200 bg-white text-slate-800 text-sm p-2.5 border"
        >
          <option value="all">Todos Status</option>
          <option value="paid">Pagos</option>
          <option value="pending">Pendentes</option>
          <option value="cancelled">Cancelados</option>
        </select>

        <div className="col-span-1 md:col-span-1">
           <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border-slate-200 bg-white text-slate-800 text-sm p-2.5 border"
            title="Data Inicial"
          />
        </div>

        <div className="col-span-1 md:col-span-1">
           <input 
            type="date" 
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border-slate-200 bg-white text-slate-800 text-sm p-2.5 border"
            title="Data Final"
          />
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Responsável</th>
                <th className="px-6 py-4 font-semibold">Descrição</th>
                <th className="px-6 py-4 font-semibold">Categoria</th>
                <th className="px-6 py-4 font-semibold text-right">Valor</th>
                <th className="px-6 py-4 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Nenhum lançamento encontrado.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className={`hover:bg-slate-50 transition-colors ${expense.status === 'cancelled' ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center text-slate-500">
                         <Calendar size={14} className="mr-2" />
                         {formatDate(expense.date)}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(expense.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img src={getUserAvatar(expense.userId)} alt="" className="w-6 h-6 rounded-full mr-2" />
                        <span className="font-medium text-slate-700">{getUserName(expense.userId)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-800">{expense.description}</div>
                      <div className="text-xs text-slate-400">{expense.location}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                        ${expense.category === ExpenseCategory.LAZER ? 'bg-purple-100 text-purple-800' : 
                          expense.category === ExpenseCategory.MERCADO ? 'bg-green-100 text-green-800' :
                          'bg-slate-100 text-slate-800'}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-slate-800">
                      R$ {expense.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center space-x-3">
                        {expense.attachmentData && expense.attachmentName && (
                           <button 
                             onClick={() => setViewingAttachment({name: expense.attachmentName!, data: expense.attachmentData!})}
                             className="text-blue-500 hover:text-blue-700 transition-colors p-1 hover:bg-blue-50 rounded-full" 
                             title={`Ver Anexo: ${expense.attachmentName}`}
                           >
                             <Eye size={18} />
                           </button>
                        )}
                        <button 
                          onClick={() => onDelete(expense.id)}
                          className="text-red-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded-full"
                          title="Excluir"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Attachment Modal */}
      {viewingAttachment && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setViewingAttachment(null)} // Click outside to close
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()} // Prevent close on content click
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center space-x-2 text-slate-700">
                <FileText size={20} />
                <h3 className="font-bold text-lg truncate">{viewingAttachment.name}</h3>
              </div>
              <button 
                onClick={() => setViewingAttachment(null)}
                className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-500 hover:text-slate-800"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 bg-slate-100 overflow-auto flex items-center justify-center p-4 relative">
              {getMimeType(viewingAttachment.name) === 'application/pdf' ? (
                <iframe 
                  src={`data:application/pdf;base64,${viewingAttachment.data}`} 
                  className="w-full h-full rounded shadow-sm bg-white"
                  title="PDF Viewer"
                />
              ) : (
                <img 
                  src={`data:${getMimeType(viewingAttachment.name)};base64,${viewingAttachment.data}`} 
                  alt="Anexo" 
                  className="max-w-full max-h-full object-contain rounded shadow-lg"
                />
              )}
            </div>
             
             {/* Modal Footer */}
             <div className="p-4 border-t border-slate-200 bg-white flex justify-end">
                <a 
                   href={`data:${getMimeType(viewingAttachment.name)};base64,${viewingAttachment.data}`} 
                   download={viewingAttachment.name}
                   className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                  <Download size={16} />
                  <span>Baixar Arquivo</span>
                </a>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};