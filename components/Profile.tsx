import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Camera, Save, Lock, User as UserIcon, Mail, Fingerprint, Shield, RefreshCw, Check, Trash2, AlertTriangle } from 'lucide-react';

interface ProfileProps {
  user: User;
  onUpdate: (updates: Partial<User>) => Promise<void>;
  onDeleteAllExpenses: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate, onDeleteAllExpenses }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [cpf, setCpf] = useState(user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')); // Initial format
  const [avatar, setAvatar] = useState(user.avatar);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  // Helper to format CPF as user types
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const generateAvatar = () => {
    const seed = Math.floor(Math.random() * 1000);
    const bgColors = ['10b981', '3b82f6', 'f59e0b', 'ec4899', '8b5cf6'];
    const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];
    const newAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${randomColor}&color=fff&seed=${seed}`;
    setAvatar(newAvatarUrl);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      // Send raw values, validation happens in service
      const updates: Partial<User> = { name, avatar, email, cpf };

      if (showPasswordChange) {
        if (!currentPassword) throw new Error('Confirme sua senha atual.');
        if (currentPassword !== user.password) throw new Error('Senha atual incorreta.');
        if (newPassword.length < 3) throw new Error('A nova senha deve ter pelo menos 3 caracteres.');
        if (newPassword !== confirmPassword) throw new Error('As novas senhas não coincidem.');
        updates.password = newPassword;
      }

      await onUpdate(updates);
      
      setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
      setShowPasswordChange(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      setMessage({ text: error.message || 'Erro ao atualizar perfil.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetData = () => {
    if (window.confirm('TEM CERTEZA? Isso apagará TODOS os lançamentos da dashboard para sempre. Esta ação é irreversível.')) {
      onDeleteAllExpenses();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Meu Perfil</h2>
          <p className="text-slate-500">Gerencie suas informações pessoais e segurança</p>
        </div>
        <div className="mt-2 md:mt-0">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {user.role === UserRole.ADMIN ? 'Administrador' : 'Membro da Família'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Public Info */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="relative group mb-4">
              <img 
                src={avatar} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-slate-50 shadow-md object-cover"
              />
              <button 
                type="button"
                onClick={generateAvatar}
                className="absolute bottom-0 right-0 p-2 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-colors"
                title="Gerar novo avatar"
              >
                <RefreshCw size={18} />
              </button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800">{user.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{user.email}</p>

            <div className="w-full pt-4 border-t border-slate-100 text-left space-y-2">
              <div className="flex items-center text-sm text-slate-600">
                <Fingerprint size={16} className="mr-2 text-slate-400" />
                <span className="font-mono">{user.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4')}</span>
              </div>
              <div className="flex items-center text-sm text-slate-600">
                <Shield size={16} className="mr-2 text-slate-400" />
                <span>Nível: {user.role}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone - Reset Dashboard */}
          <div className="bg-red-50 p-6 rounded-xl border border-red-100">
            <div className="flex items-center space-x-2 text-red-700 mb-2">
              <AlertTriangle size={20} />
              <h4 className="font-bold">Zona de Perigo</h4>
            </div>
            <p className="text-sm text-red-600 mb-4">
              Zerar todos os dados de gastos da dashboard. Esta ação não pode ser desfeita.
            </p>
            <button
              type="button"
              onClick={handleResetData}
              className="w-full flex items-center justify-center space-x-2 bg-white text-red-600 border border-red-200 px-4 py-2 rounded-lg font-medium hover:bg-red-100 hover:border-red-300 transition-colors"
            >
              <Trash2 size={16} />
              <span>Excluir Todos os Lançamentos</span>
            </button>
          </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="font-bold text-slate-800">Editar Informações</h3>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="p-6 space-y-6">
              
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome de Exibição</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon size={18} className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800"
                  />
                </div>
              </div>

              {/* Editable Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-slate-400" />
                      </div>
                      <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)} 
                        className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800" 
                      />
                   </div>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Fingerprint size={18} className="text-slate-400" />
                      </div>
                      <input 
                        type="text" 
                        value={cpf}
                        onChange={handleCpfChange}
                        maxLength={14}
                        className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800" 
                      />
                   </div>
                </div>
              </div>

              {/* Avatar URL Input (Advanced) */}
              <div>
                 <label className="block text-sm font-medium text-slate-700 mb-1">URL da Foto (Opcional)</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Camera size={18} className="text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      value={avatar} 
                      onChange={(e) => setAvatar(e.target.value)} 
                      className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border text-xs text-slate-500 bg-white"
                      placeholder="https://..."
                    />
                 </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  <Lock size={16} className="mr-1" />
                  {showPasswordChange ? 'Cancelar alteração de senha' : 'Alterar minha senha'}
                </button>

                {showPasswordChange && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-lg space-y-4 animate-in slide-in-from-top-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-700 mb-1">Senha Atual</label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full rounded-lg border-slate-300 p-2 border text-sm bg-white text-slate-800"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Nova Senha</label>
                        <input
                          type="password"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full rounded-lg border-slate-300 p-2 border text-sm bg-white text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-700 mb-1">Confirmar Nova Senha</label>
                        <input
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full rounded-lg border-slate-300 p-2 border text-sm bg-white text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {message.text && (
                <div className={`p-3 rounded-lg text-sm flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {message.type === 'success' ? <Check size={16} className="mr-2"/> : <Shield size={16} className="mr-2"/>}
                  {message.text}
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-md disabled:opacity-70"
                >
                  {loading ? (
                    <span>Salvando...</span>
                  ) : (
                    <>
                      <Save size={18} />
                      <span>Salvar Alterações</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};