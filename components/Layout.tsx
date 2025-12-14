import React from 'react';
import { User, UserRole } from '../types';
import { LayoutDashboard, PlusCircle, List, LogOut, PieChart, Shield, User as UserIcon, ClipboardList, UserCog, CheckCircle, Crown, LockKeyhole, FolderArchive } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
  notification?: string | null; // New prop for notifications
}

export const Layout: React.FC<LayoutProps> = ({ children, user, activeTab, onTabChange, onLogout, notification }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'expenses', label: 'Lançamentos', icon: List },
    { id: 'advanced_history', label: 'Exportar & Histórico', icon: FolderArchive },
    { id: 'reports', label: 'Relatórios', icon: ClipboardList },
    { id: 'new', label: 'Novo Gasto (Manual)', icon: PlusCircle },
    { id: 'profile', label: 'Meu Perfil', icon: UserCog },
    { id: 'subscription', label: 'Assinatura', icon: Crown }, 
  ];

  // Add Admin Tab only for Admins
  if (user.role === UserRole.ADMIN) {
    navItems.push({ id: 'admin', label: 'Administração', icon: Shield });
  }

  // Add System Owner Tab (Visible ONLY to the software owner)
  if (user.role === UserRole.SYSTEM_ADMIN) {
     navItems.push({ id: 'system_admin', label: 'Painel do Dono', icon: LockKeyhole });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 relative">
      {/* Sidebar / Mobile Header */}
      <aside className="bg-slate-900 text-white w-full md:w-64 flex-shrink-0 flex flex-col">
        <div className="p-6 flex items-center justify-center md:justify-start space-x-3 border-b border-slate-700">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <PieChart size={24} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Família Fin.</span>
        </div>

        {/* User Profile Snippet */}
        <div className="p-6 flex items-center space-x-3 bg-slate-800 cursor-pointer hover:bg-slate-700 transition-colors relative group" onClick={() => onTabChange('profile')}>
          <div className="relative">
             <img src={user.avatar} alt={user.name} className={`w-10 h-10 rounded-full border-2 object-cover ${user.plan === 'premium' ? 'border-amber-400' : 'border-emerald-500'}`} />
             {user.plan === 'premium' && (
               <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-0.5" title="Membro Premium">
                 <Crown size={10} className="text-slate-900 fill-slate-900" />
               </div>
             )}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium truncate flex items-center">
               {user.name}
            </p>
            <div className="flex items-center text-xs text-slate-400">
              {user.role === UserRole.SYSTEM_ADMIN ? <LockKeyhole size={12} className="mr-1 text-indigo-400"/> : user.role === UserRole.ADMIN ? <Shield size={12} className="mr-1" /> : <UserIcon size={12} className="mr-1" />}
              {user.role === UserRole.SYSTEM_ADMIN ? 'Dono' : user.role}
            </div>
          </div>
        </div>
        
        {/* Subscription Status Banner (If free and NOT system admin) */}
        {user.plan !== 'premium' && user.role !== UserRole.SYSTEM_ADMIN && (
          <div className="px-4 pb-2">
            <button 
              onClick={() => onTabChange('subscription')}
              className="w-full bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 text-xs font-bold py-2 rounded-md shadow-sm hover:brightness-110 transition-all flex items-center justify-center space-x-1"
            >
              <Crown size={12} className="fill-yellow-900" />
              <span>SEJA PREMIUM</span>
            </button>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id