import { User, UserRole, Expense, ExpenseCategory, Budget } from '../types';

const USERS_KEY = 'famfin_users';
const EXPENSES_KEY = 'famfin_expenses';
const BUDGETS_KEY = 'famfin_budgets';
const WITHDRAWALS_KEY = 'famfin_system_withdrawals'; // New key for withdrawals

export interface SystemWithdrawal {
  id: string;
  amount: number;
  date: string;
  method: string; // e.g., 'PIX'
  destination: string; // e.g., PIX Key
  status: 'completed';
}

const MOCK_USERS: User[] = [
  { 
    id: 'owner1', 
    name: 'Dono do Sistema', 
    email: 'dono@software.com',
    cpf: '00000000000',
    password: '123',
    role: UserRole.SYSTEM_ADMIN, 
    plan: 'premium',
    avatar: 'https://ui-avatars.com/api/?name=Dono+Sistema&background=0f172a&color=fff' 
  },
  { 
    id: 'u1', 
    name: 'Carlos (Pai)', 
    email: 'carlos@familia.com',
    cpf: '11122233344',
    password: '123',
    role: UserRole.ADMIN, 
    plan: 'premium', // Carlos is now Premium for demo purposes
    avatar: 'https://picsum.photos/id/1005/100/100' 
  },
  { 
    id: 'u2', 
    name: 'Ana (Mãe)', 
    email: 'ana@familia.com',
    cpf: '22233344455',
    password: '123',
    role: UserRole.MEMBER, // Changed to MEMBER to enforce single admin policy
    plan: 'free',
    avatar: 'https://picsum.photos/id/1011/100/100' 
  },
  { 
    id: 'u3', 
    name: 'Pedro (Filho)', 
    email: 'pedro@familia.com',
    cpf: '33344455566',
    password: '123',
    role: UserRole.MEMBER, 
    plan: 'free',
    avatar: 'https://picsum.photos/id/1012/100/100' 
  },
];

// Helper to generate dates relative to today
const getRelativeDate = (daysOffset: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysOffset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', userId: 'u1', amount: 450.50, description: 'Compras do Mês', location: 'Carrefour', category: ExpenseCategory.MERCADO, date: getRelativeDate(0), status: 'paid' },
  { id: 'e2', userId: 'u2', amount: 120.00, description: 'Jantar Sábado', location: 'Outback', category: ExpenseCategory.LAZER, date: getRelativeDate(2), status: 'paid' },
  { id: 'e3', userId: 'u1', amount: 2500.00, description: 'Aluguel', location: 'Imobiliária', category: ExpenseCategory.CONTAS_FIXAS, date: getRelativeDate(5), status: 'pending' },
  { id: 'e4', userId: 'u3', amount: 45.90, description: 'Uber para Escola', location: 'Uber', category: ExpenseCategory.TRANSPORTE, date: getRelativeDate(1), status: 'paid' },
  { id: 'e5', userId: 'u2', amount: 300.00, description: 'Farmácia', location: 'Droga Raia', category: ExpenseCategory.SAUDE, date: getRelativeDate(3), status: 'paid' },
];

const MOCK_BUDGETS: Budget[] = [
  { category: ExpenseCategory.MERCADO, limit: 1500 },
  { category: ExpenseCategory.LAZER, limit: 500 },
];

export const initializeStorage = () => {
  if (!localStorage.getItem(USERS_KEY)) {
    localStorage.setItem(USERS_KEY, JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem(EXPENSES_KEY)) {
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(MOCK_EXPENSES));
  }
  if (!localStorage.getItem(BUDGETS_KEY)) {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(MOCK_BUDGETS));
  }
  if (!localStorage.getItem(WITHDRAWALS_KEY)) {
    localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify([]));
  }
};

export const getUsers = (): User[] => {
  const data = localStorage.getItem(USERS_KEY);
  return data ? JSON.parse(data) : [];
};

export const authenticateUser = (identifier: string, password: string): User | null => {
  const users = getUsers();
  
  // Remove non-numeric chars to compare as clean CPF
  const cleanIdentifier = identifier.replace(/\D/g, '');
  
  const user = users.find(u => {
    const isEmailMatch = u.email.toLowerCase() === identifier.toLowerCase();
    // Only check CPF match if the identifier looks like it has numbers and user has a cpf
    const isCpfMatch = u.cpf && cleanIdentifier.length > 0 && u.cpf === cleanIdentifier;
    
    return (isEmailMatch || isCpfMatch) && u.password === password;
  });

  return user || null;
};

export const registerUser = (name: string, email: string, cpf: string, password: string): User => {
  const users = getUsers();
  const cleanCpf = cpf.replace(/\D/g, '');
  
  if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('Este email já está cadastrado.');
  }

  if (users.some(u => u.cpf === cleanCpf)) {
    throw new Error('Este CPF já está cadastrado.');
  }

  // Check if an admin already exists. 
  // If exists, new user is MEMBER. 
  // If NOT exists (first user of the system), new user is ADMIN.
  const hasAdmin = users.some(u => u.role === UserRole.ADMIN);
  const role = hasAdmin ? UserRole.MEMBER : UserRole.ADMIN;

  const newUser: User = {
    id: Date.now().toString(),
    name,
    email,
    cpf: cleanCpf,
    password,
    role, 
    plan: 'free',
    // Generate a simple avatar based on name initials
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=10b981&color=fff`
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return newUser;
};

export const updateUser = (id: string, updates: Partial<User>): User => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  
  if (index === -1) {
    throw new Error('Usuário não encontrado.');
  }

  // Prevent email duplication if email is being changed
  if (updates.email && users.some(u => u.email.toLowerCase() === updates.email?.toLowerCase() && u.id !== id)) {
    throw new Error('Este email já está em uso por outro usuário.');
  }

  // Prevent CPF duplication if CPF is being changed
  if (updates.cpf) {
    const cleanCpf = updates.cpf.replace(/\D/g, '');
    if (users.some(u => u.cpf === cleanCpf && u.id !== id)) {
      throw new Error('Este CPF já está em uso por outro usuário.');
    }
    // Update the updates object to ensure we save the clean version
    updates.cpf = cleanCpf;
  }

  const updatedUser = { ...users[index], ...updates };
  users[index] = updatedUser;
  
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  return updatedUser;
};

// Function to handle subscription simulation
export const subscribeUser = (userId: string): User => {
  return updateUser(userId, { plan: 'premium' });
};

export const deleteUser = (id: string): void => {
  const users = getUsers();
  const userToDelete = users.find(u => u.id === id);

  if (!userToDelete) {
    throw new Error('Usuário não encontrado.');
  }

  if (userToDelete.role === UserRole.ADMIN) {
    // Check if it's the only admin
    const adminCount = users.filter(u => u.role === UserRole.ADMIN).length;
    if (adminCount <= 1) {
      throw new Error('Não é possível excluir o único administrador do sistema.');
    }
  }

  const newUsers = users.filter(u => u.id !== id);
  localStorage.setItem(USERS_KEY, JSON.stringify(newUsers));
  
  // Optionally clean up expenses? For this demo, we keep them or assign to null, 
  // but to keep it simple we just leave them (they will show as "Unknown User" in lists).
};

export const getExpenses = (): Expense[] => {
  const data = localStorage.getItem(EXPENSES_KEY);
  return data ? JSON.parse(data) : [];
};

export const addExpense = (expense: Expense): void => {
  const expenses = getExpenses();
  expenses.push(expense);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

export const updateExpense = (id: string, updates: Partial<Expense>): void => {
  const expenses = getExpenses();
  const index = expenses.findIndex(e => e.id === id);
  if (index !== -1) {
    expenses[index] = { ...expenses[index], ...updates };
    localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
  }
};

export const deleteExpense = (id: string): void => {
  const expenses = getExpenses().filter(e => e.id !== id);
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(expenses));
};

export const deleteAllExpenses = (): void => {
  localStorage.setItem(EXPENSES_KEY, JSON.stringify([]));
};

export const getBudgets = (): Budget[] => {
  const data = localStorage.getItem(BUDGETS_KEY);
  return data ? JSON.parse(data) : [];
};

// --- SYSTEM FINANCE FUNCTIONS ---

export const getSystemWithdrawals = (): SystemWithdrawal[] => {
  const data = localStorage.getItem(WITHDRAWALS_KEY);
  return data ? JSON.parse(data) : [];
};

export const createSystemWithdrawal = (amount: number, method: string, destination: string): SystemWithdrawal => {
  const withdrawals = getSystemWithdrawals();
  const newWithdrawal: SystemWithdrawal = {
    id: Date.now().toString(),
    amount,
    date: new Date().toISOString(),
    method,
    destination,
    status: 'completed'
  };
  withdrawals.push(newWithdrawal);
  localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(withdrawals));
  return newWithdrawal;
};

// --- END SYSTEM FINANCE FUNCTIONS ---

export const getFullDatabase = () => {
  return {
    users: getUsers(),
    expenses: getExpenses(),
    budgets: getBudgets(),
    withdrawals: getSystemWithdrawals(), // Include withdrawals in backup
    lastBackup: new Date().toISOString()
  };
};

export const overwriteDatabase = (data: any) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Dados inválidos para restauração.');
  }

  // Simple validation to ensure core keys exist
  if (!Array.isArray(data.users) || !Array.isArray(data.expenses)) {
    throw new Error('Formato inválido: O JSON deve conter arrays de "users" e "expenses".');
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
  localStorage.setItem(EXPENSES_KEY, JSON.stringify(data.expenses));
  
  if (data.budgets) {
    localStorage.setItem(BUDGETS_KEY, JSON.stringify(data.budgets));
  }
  
  if (data.withdrawals) {
    localStorage.setItem(WITHDRAWALS_KEY, JSON.stringify(data.withdrawals));
  }
};