import React, { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ExpenseList } from './components/ExpenseList';
import { ExpenseForm } from './components/ExpenseForm';
import { SmartScanner } from './components/SmartScanner';
import { Reports } from './components/Reports';
import { AdminPanel } from './components/AdminPanel';
import { Profile } from './components/Profile';
import { Subscription } from './components/Subscription';
import { SystemAdminPanel } from './components/SystemAdminPanel';
import { AdvancedHistory } from './components/AdvancedHistory';
import { LandingPage } from './components/LandingPage';
import { CheckoutPage } from './components/CheckoutPage'; 
import { User, Expense, ExpenseStatus, UserRole } from './types';
import * as storage from './services/storageService';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // View states
  const [showLanding, setShowLanding] = useState(true);
  const [isCheckout, setIsCheckout] = useState(false); 

  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<User[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState(storage.getBudgets());
  
  // Global Notification State
  const [notification, setNotification] = useState<string | null>(null);

  // Helper to show notification
  const showSuccess = (message: string = 'Alteração gravada com sucesso') => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // Initialization
  useEffect(() => {
    storage.initializeStorage();
    setUsers(storage.getUsers());
    setExpenses(storage.getExpenses());
  }, []);

  const handleLogin = async (identifier: string, password: string, requireAdmin: boolean): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const user = storage.authenticateUser(identifier, password);
    if (user) {
      if (requireAdmin && user.role !== UserRole.ADMIN && user.role !== UserRole.SYSTEM_ADMIN) {
        return false;
      }
      setCurrentUser(user);
      setActiveTab('dashboard');
      setShowLanding(false);
      setIsCheckout(false);
      return true;
    }
    return false;
  };

  const handleRegister = async (name: string, email: string, cpf: string, password: string): Promise<boolean> => {
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const newUser = storage.registerUser(name, email, cpf, password);
      setUsers(storage.getUsers());
      
      if (!currentUser) {
        setCurrentUser(newUser); 
        setActiveTab('dashboard');
        setShowLanding(false);
        setIsCheckout(false);
      } else {
        showSuccess('Novo usuário cadastrado com sucesso');
      }
      return true;
    } catch (error) {
      console.error(error);
      throw error; 
    }
  };

  const handleUpdateUser = async (updates: Partial<User>) => {
    if (!currentUser) return;
    await new Promise(resolve => setTimeout(resolve, 500));
    try {
      const updatedUser = storage.updateUser(currentUser.id, updates);
      setCurrentUser(updatedUser);
      setUsers(storage.getUsers());
      showSuccess('Alteração gravada com sucesso');
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  // Called when payment is confirmed in CheckoutPage
  const handleCheckoutSuccess = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(storage.getUsers());
    setIsCheckout(false); // Return to app
    setActiveTab('dashboard');
    showSuccess('Assinatura Premium ativada com sucesso!');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setNotification(null);
    setShowLanding(true);
    setIsCheckout(false);
  };

  const handleAddExpense = (newExpenseData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpenseData,
      id: Date.now().toString(),
    };
    storage.addExpense(newExpense);
    setExpenses(storage.getExpenses()); 
    setActiveTab('expenses'); 
    showSuccess('Alteração gravada com sucesso');
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
      storage.deleteExpense(id);
      setExpenses(storage.getExpenses());
      showSuccess('Alteração gravada com sucesso');
    }
  };

  const handleDeleteAllExpenses = () => {
    storage.deleteAllExpenses();
    setExpenses([]);
    showSuccess('Todos os lançamentos foram excluídos. Dashboard zerada.');
  };

  const handleUpdateStatus = (id: string, status: ExpenseStatus) => {
    storage.updateExpense(id, { status });
    setExpenses(storage.getExpenses());
    showSuccess('Alteração gravada com sucesso');
  };

  // --- Main Render Logic ---

  // 1. Logged in
  if (currentUser) {
    // 1a. Checkout View (External Page feel)
    if (isCheckout) {
      return (
        <CheckoutPage 
          user={currentUser} 
          onSuccess={handleCheckoutSuccess} 
          onCancel={() => setIsCheckout(false)} 
        />
      );
    }

    // 1b. Dashboard View
    return (
      <Layout 
        user={currentUser} 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onLogout={handleLogout}
        notification={notification}
      >
        {activeTab === 'dashboard' && <Dashboard expenses={expenses} users={users} budgets={budgets} />}
        {activeTab === 'expenses' && <ExpenseList expenses={expenses} users={users} onDelete={handleDeleteExpense} />}
        {activeTab === 'advanced_history' && <AdvancedHistory expenses={expenses} users={users} />}
        {activeTab === 'reports' && <Reports expenses={expenses} users={users} onUpdateStatus={handleUpdateStatus} />}
        {activeTab === 'new' && <ExpenseForm currentUser={currentUser} onAddExpense={handleAddExpense} onCancel={() => setActiveTab('expenses')} />}
        {activeTab === 'scanner' && <SmartScanner currentUser={currentUser} onAddExpense={handleAddExpense} onCancel={() => setActiveTab('expenses')} />}
        {activeTab === 'profile' && <Profile user={currentUser} onUpdate={handleUpdateUser} onDeleteAllExpenses={handleDeleteAllExpenses} />}
        {activeTab === 'subscription' && <Subscription user={currentUser} onStartCheckout={() => setIsCheckout(true)} />}
        {activeTab === 'admin' && currentUser.role === UserRole.ADMIN && <AdminPanel onRegisterUser={handleRegister} />}
        {activeTab === 'system_admin' && currentUser.role === UserRole.SYSTEM_ADMIN && <SystemAdminPanel />}
      </Layout>
    );
  }

  // 2. Landing Page
  if (showLanding) {
    return <LandingPage onNavigateToLogin={() => setShowLanding(false)} />;
  }

  // 3. Login Screen
  return <Login onLogin={handleLogin} onRegister={handleRegister} onBack={() => setShowLanding(true)} />;
};

export default App;