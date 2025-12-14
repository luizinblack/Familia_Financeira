import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import { Reports } from './components/Reports';
import { User, Expense, ExpenseStatus } from './types';
import * as storage from './services/storageService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState(storage.getBudgets());

  // Initialization
  useEffect(() => {
    storage.initializeStorage();
    setUsers(storage.getUsers());
    setExpenses(storage.getExpenses());
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: Date.now().toString(),
    };
    storage.addExpense(newExpense);
    setExpenses(storage.getExpenses()); // Refresh state
    setActiveTab('expenses'); // Go to list view
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      storage.deleteExpense(id);
      setExpenses(storage.getExpenses());
    }
  };

  const handleUpdateStatus = (id: string, status: ExpenseStatus) => {
    storage.updateExpense(id, { status });
    setExpenses(storage.getExpenses());
  };

  if (!currentUser) {
    return <Login users={users} onLogin={handleLogin} />;
  }

  return (
    <Layout 
      user={currentUser} 
      activeTab={activeTab} 
      onTabChange={setActiveTab}
      onLogout={handleLogout}
    >
      {activeTab === 'dashboard' && (
        <Dashboard 
          expenses={expenses} 
          users={users} 
          budgets={budgets} 
        />
      )}
      
      {activeTab === 'expenses' && (
        <ExpenseList 
          expenses={expenses} 
          users={users} 
          onDelete={handleDeleteExpense} 
        />
      )}

      {activeTab === 'reports' && (
        <Reports 
          expenses={expenses} 
          users={users}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
      
      {activeTab === 'new' && (
        <ExpenseForm 
          currentUser={currentUser}
          onAddExpense={handleAddExpense}
          onCancel={() => setActiveTab('expenses')}
        />
      )}
    </Layout>
  );
};

export default App;