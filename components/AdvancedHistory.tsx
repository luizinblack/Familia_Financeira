import React, { useState, useMemo } from 'react';
import { Expense, User } from '../types';
import { Download, Calendar, ChevronDown, ChevronRight, FileJson, FileSpreadsheet, Printer, CheckSquare, Square, Filter } from 'lucide-react';

interface AdvancedHistoryProps {
  expenses: Expense[];
  users: User[];
}

type GroupMode = 'day' | 'week' | 'month' | 'year';

interface GroupedData {
  key: string;
  label: string;
  total: number;
  items: Expense[];
}

export const AdvancedHistory: React.FC<AdvancedHistoryProps> = ({ expenses, users }) => {
  const [groupMode, setGroupMode] = useState<GroupMode>('month');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Helper to get user name
  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Desconhecido';

  // --- Grouping Logic ---
  const groupedData = useMemo(() => {
    const groups: Record<string, GroupedData> = {};

    // Sort expenses by date descending first
    const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sortedExpenses.forEach(expense => {
      const date = new Date(expense.date);
      let key = '';
      let label = '';

      if (groupMode === 'year') {
        key = date.getFullYear().toString();
        label = key;
      } else if (groupMode === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        label = monthName.charAt(0).toUpperCase() + monthName.slice(1);
      } else if (groupMode === 'week') {
        // Calculate start of the week (Sunday)
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day;
        const weekStart = new Date(d.setDate(diff));
        key = weekStart.toISOString().split('T')[0];
        label = `Semana de ${weekStart.toLocaleDateString('pt-BR')}`;
      } else if (groupMode === 'day') {
        key = expense.date; // YYYY-MM-DD
        label = date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
      }

      if (!groups[key]) {
        groups[key] = { key, label, total: 0, items: [] };
      }

      groups[key].items.push(expense);
      groups[key].total += expense.amount;
    });

    return Object.values(groups).sort((a, b) => b.key.localeCompare(a.key));
  }, [expenses, groupMode]);

  // --- Selection Logic ---
  const toggleGroupSelection = (groupItems: Expense[]) => {
    const allSelected = groupItems.every(item => selectedIds.has(item.id));
    const newSelected = new Set(selectedIds);

    if (allSelected) {
      groupItems.forEach(item => newSelected.delete(item.id));
    } else {
      groupItems.forEach(item => newSelected.add(item.id));
    }
    setSelectedIds(newSelected);
  };

  const toggleItemSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === expenses.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(expenses.map(e => e.id)));
    }
  };

  const toggleGroupExpand = (key: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedGroups(newExpanded);
  };

  // --- Export Logic ---
  const getSelectedExpenses = () => {
    return expenses.filter(e => selectedIds.has(e.id)).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const exportCSV = () => {
    const selected = getSelectedExpenses();
    if (selected.length === 0) return alert('Selecione pelo menos um item.');

    const headers = ['Data', 'Usuario', 'Categoria', 'Local', 'Descricao', 'Valor', 'Status'];
    const csvContent = [
      headers.join(','),
      ...selected.map(e => [
        e.date,
        getUserName(e.userId),
        e.category,
        e.location.replace(/,/g, ''), // prevent csv break
        e.description.replace(/,/g, ''),
        e.amount.toFixed(2),
        e.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `relatorio_${groupMode}_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const exportJSON = () => {
    const selected = getSelectedExpenses();
    if (selected.length === 0) return alert('Selecione pelo menos um item.');
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(selected, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `dados_exportados_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const handlePrint = () => {
    const selected = getSelectedExpenses();
    if (selected.length === 0) return alert('Selecione pelo menos um item.');

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const total = selected.reduce((acc, curr) => acc + curr.amount, 0);
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Relatório de Despesas</title>
            <style>
              body { font-family: sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .header { margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .total { text-align: right; font-size: 1.2em; font-weight: bold; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Relatório de Despesas</h1>
              <p>Gerado em: ${new Date().toLocaleDateString()}</p>
              <p>Itens selecionados: ${selected.length}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Responsável</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th>Local</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                ${selected.map(e => `
                  <tr>
                    <td>${e.date.split('-').reverse().join('/')}</td>
                    <td>${getUserName(e.userId)}</td>
                    <td>${e.category}</td>
                    <td>${e.description}</td>
                    <td>${e.location}</td>
                    <td>R$ ${e.amount.toFixed(2)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="total">Total Geral: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Histórico Avançado</h2>
          <p className="text-slate-500">Agrupe, selecione e exporte seus dados</p>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-20">
        
        {/* Mode Select */}
        <div className="flex bg-slate-100 p-1 rounded-lg w-full md:w-auto">
          {(['year', 'month', 'week', 'day'] as GroupMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => { setGroupMode(mode); setExpandedGroups(new Set()); }} // Reset expand on change
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all capitalize ${
                groupMode === mode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {mode === 'year' ? 'Ano' : mode === 'month' ? 'Mês' : mode === 'week' ? 'Semana' : 'Dia'}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
           <div className="text-sm text-slate-500 mr-2">
             <span className="font-bold text-slate-800">{selectedIds.size}</span> selecionados
           </div>
           
           <button onClick={selectAll} className="p-2 hover:bg-slate-100 rounded-lg text-slate-600" title="Selecionar Todos">
             {selectedIds.size === expenses.length && expenses.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
           </button>

           <div className="h-6 w-px bg-slate-300 mx-2"></div>

           <button onClick={exportCSV} className="flex items-center space-x-1 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-200">
             <FileSpreadsheet size={16} />
             <span className="text-sm font-medium">CSV</span>
           </button>
           
           <button onClick={handlePrint} className="flex items-center space-x-1 px-3 py-2 bg-slate-50 text-slate-700 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200">
             <Printer size={16} />
             <span className="text-sm font-medium">PDF</span>
           </button>

           <button onClick={exportJSON} className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-lg" title="Exportar JSON">
             <FileJson size={20} />
           </button>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {groupedData.length === 0 ? (
           <div className="text-center py-12 text-slate-400">Nenhum lançamento encontrado.</div>
        ) : (
          groupedData.map((group) => {
             const isExpanded = expandedGroups.has(group.key) || groupMode === 'year'; // Always expand year? or keep consistent
             const isGroupSelected = group.items.every(item => selectedIds.has(item.id));
             const isGroupPartiallySelected = group.items.some(item => selectedIds.has(item.id)) && !isGroupSelected;

             return (
              <div key={group.key} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Group Header */}
                <div 
                  className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${isGroupSelected ? 'bg-indigo-50' : 'bg-slate-50 hover:bg-slate-100'}`}
                >
                  <div className="flex items-center space-x-3 flex-1">
                     <button onClick={(e) => { e.stopPropagation(); toggleGroupSelection(group.items); }}>
                        {isGroupSelected ? (
                          <CheckSquare className="text-indigo-600" size={20} />
                        ) : isGroupPartiallySelected ? (
                          <div className="w-5 h-5 bg-indigo-200 rounded text-indigo-600 flex items-center justify-center font-bold text-xs">-</div>
                        ) : (
                          <Square className="text-slate-400" size={20} />
                        )}
                     </button>
                     
                     <div 
                        className="flex items-center space-x-2 flex-1"
                        onClick={() => toggleGroupExpand(group.key)}
                     >
                        {isExpanded ? <ChevronDown size={18} className="text-slate-400"/> : <ChevronRight size={18} className="text-slate-400"/>}
                        <span className="font-bold text-slate-700">{group.label}</span>
                        <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">{group.items.length} itens</span>
                     </div>
                  </div>
                  
                  <div className="font-bold text-slate-800">
                    R$ {group.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                {/* Items List (Accordion Body) */}
                {isExpanded && (
                  <div className="divide-y divide-slate-100 border-t border-slate-100">
                    {group.items.map(expense => (
                      <div 
                        key={expense.id} 
                        className={`flex items-center p-3 hover:bg-slate-50 transition-colors ${selectedIds.has(expense.id) ? 'bg-indigo-50/50' : ''}`}
                        onClick={() => toggleItemSelection(expense.id)}
                      >
                         <div className="mr-4">
                            {selectedIds.has(expense.id) ? <CheckSquare className="text-indigo-500" size={16} /> : <Square className="text-slate-300" size={16} />}
                         </div>
                         <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2 text-sm items-center">
                            <div className="font-medium text-slate-700">
                              {new Date(expense.date).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-slate-600 flex flex-col">
                               <span className="font-medium">{expense.description}</span>
                               <span className="text-xs text-slate-400">{expense.location}</span>
                            </div>
                            <div className="flex items-center text-xs text-slate-500">
                               <span className="bg-slate-100 px-2 py-1 rounded-md">{expense.category}</span>
                               <span className="ml-2 text-slate-400">• {getUserName(expense.userId)}</span>
                            </div>
                            <div className="text-right font-bold text-slate-700">
                               R$ {expense.amount.toFixed(2)}
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
             );
          })
        )}
      </div>
    </div>
  );
};