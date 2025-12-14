import React, { useState, useEffect } from 'react';
import { UserPlus, Database, Lock, Copy, Check, Download, ShieldAlert, Fingerprint, Mail, User, Save, RefreshCw, Users, Trash2, KeyRound, Search } from 'lucide-react';
import { getFullDatabase, overwriteDatabase, getUsers, updateUser, deleteUser } from '../services/storageService';
import { User as UserType, UserRole } from '../types';

interface AdminPanelProps {
  onRegisterUser: (name: string, email: string, cpf: string, password: string) => Promise<boolean>;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onRegisterUser }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'manage_accounts' | 'database'>('users');
  const [dbData, setDbData] = useState<any>(null);
  const [editingJson, setEditingJson] = useState('');
  const [copied, setCopied] = useState(false);
  const [userList, setUserList] = useState<UserType[]>([]);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (activeTab === 'database') {
      const data = getFullDatabase();
      setDbData(data);
      setEditingJson(JSON.stringify(data, null, 2));
    }
    if (activeTab === 'manage_accounts') {
      refreshUserList();
    }
  }, [activeTab]);

  const refreshUserList = () => {
    setUserList(getUsers());
  };

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

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    try {
      await onRegisterUser(name, email, cpf, password);
      setMessage({ text: 'Usuário cadastrado com sucesso!', type: 'success' });
      setName('');
      setEmail('');
      setCpf('');
      setPassword('');
    } catch (error: any) {
      setMessage({ text: error.message || 'Erro ao cadastrar usuário.', type: 'error' });
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    const newPass = window.prompt(`Digite a nova senha para ${userName}:`);
    if (newPass) {
      try {
        updateUser(userId, { password: newPass });
        setMessage({ text: `Senha de ${userName} alterada com sucesso!`, type: 'success' });
        refreshUserList();
      } catch (error: any) {
        setMessage({ text: 'Erro ao alterar senha: ' + error.message, type: 'error' });
      }
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário ${userName}? Esta ação não pode ser desfeita.`)) {
      try {
        deleteUser(userId);
        setMessage({ text: `Usuário ${userName} excluído.`, type: 'success' });
        refreshUserList();
      } catch (error: any) {
        setMessage({ text: 'Erro ao excluir: ' + error.message, type: 'error' });
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(editingJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadDb = () => {
    const blob = new Blob([editingJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_familia_fin_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleSaveDatabase = () => {
    if (!window.confirm('Tem certeza? Isso irá SOBRESCREVER todos os dados atuais com o conteúdo abaixo.')) {
      return;
    }

    try {
      const parsedData = JSON.parse(editingJson);
      overwriteDatabase(parsedData);
      setMessage({ text: 'Banco de dados atualizado com sucesso! Recarregando...', type: 'success' });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setMessage({ text: 'Erro ao salvar: JSON Inválido ou formato incorreto. ' + error.message, type: 'error' });
    }
  };

  // Filter users based on search term
  const filteredUsers = userList.filter(user => {
    const term = searchTerm.toLowerCase();
    return (
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.cpf.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Painel Administrativo</h2>
          <p className="text-slate-500">Gestão de sistema e usuários</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'users' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <UserPlus size={16} />
          <span>Criar Usuário</span>
        </button>
        <button
          onClick={() => setActiveTab('manage_accounts')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'manage_accounts' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Users size={16} />
          <span>Gerenciar Contas</span>
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'database' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-800'
          }`}
        >
          <Database size={16} />
          <span>Banco de Dados</span>
        </button>
      </div>

      {message.text && (
         <div className={`p-4 rounded-lg text-sm flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            <div className="flex items-center">
               {message.type === 'success' ? <Check size={18} className="mr-2"/> : <ShieldAlert size={18} className="mr-2"/>}
               <span className="font-medium">{message.text}</span>
            </div>
            {message.type === 'success' && <RefreshCw size={16} className="animate-spin ml-2"/>}
         </div>
       )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 max-w-2xl">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-800">Criar Nova Conta</h3>
            <p className="text-sm text-slate-500">Adicione um novo membro à família</p>
          </div>
          
          <form onSubmit={handleRegister} className="p-6 space-y-5">
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex items-start space-x-3">
              <ShieldAlert className="text-indigo-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-bold text-indigo-900">Política de Acesso</h4>
                <p className="text-xs text-indigo-700 mt-1">
                  O sistema permite apenas <strong>1 conta Administrador</strong> por família. 
                  Novas contas criadas aqui serão automaticamente definidas como <strong>Membros</strong>.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800"
                  placeholder="Nome do familiar"
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
                  required
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800"
                  placeholder="000.000.000-00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800"
                  placeholder="email@familia.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha Provisória</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="text" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800"
                  placeholder="Defina uma senha inicial"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white p-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200"
            >
              Criar Conta
            </button>
          </form>
        </div>
      )}

      {activeTab === 'manage_accounts' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Gerenciar Contas</h3>
              <p className="text-sm text-slate-500">Altere senhas ou remova usuários do sistema.</p>
            </div>
            
            {/* Search Input */}
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar usuário..."
                className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border text-sm bg-white text-slate-800"
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
                  <th className="px-6 py-4 font-semibold">Função</th>
                  <th className="px-6 py-4 font-semibold text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                      Nenhum usuário encontrado com os termos pesquisados.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img src={user.avatar} alt="" className="w-8 h-8 rounded-full mr-3 border border-slate-200" />
                          <span className="font-medium text-slate-800">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{user.email}</td>
                      <td className="px-6 py-4 font-mono text-xs">{user.cpf}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.role === UserRole.ADMIN ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button 
                            onClick={() => handleResetPassword(user.id, user.name)}
                            className="flex items-center space-x-1 px-3 py-1 bg-amber-50 text-amber-600 rounded-md hover:bg-amber-100 transition-colors border border-amber-200"
                            title="Resetar Senha"
                          >
                            <KeyRound size={14} />
                            <span className="text-xs font-bold">Senha</span>
                          </button>
                          
                          {/* Prevent deleting the only admin or oneself roughly (though storage service protects last admin) */}
                          <button 
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors border border-red-200"
                            title="Excluir Usuário"
                          >
                            <Trash2 size={14} />
                            <span className="text-xs font-bold">Excluir</span>
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
      )}

      {activeTab === 'database' && (
        <div className="space-y-4">
          <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700 flex flex-col h-[600px]">
            <div className="bg-slate-800 p-4 flex justify-between items-center border-b border-slate-700 shrink-0">
              <div className="flex items-center space-x-2 text-slate-300">
                <Database size={18} />
                <span className="font-mono text-sm">system_database.json</span>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={copyToClipboard}
                  className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
                  title="Copiar JSON"
                >
                  {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  <span className="text-xs">{copied ? 'Copiado!' : 'Copiar'}</span>
                </button>
                <button 
                  onClick={downloadDb}
                  className="p-2 hover:bg-slate-700 rounded-md text-slate-400 hover:text-white transition-colors flex items-center space-x-1"
                  title="Baixar Backup"
                >
                  <Download size={16} />
                  <span className="text-xs">Baixar</span>
                </button>
                <div className="w-px h-6 bg-slate-600 mx-2 self-center"></div>
                <button 
                  onClick={handleSaveDatabase}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-500 transition-colors flex items-center space-x-2 shadow-lg"
                  title="Salvar alterações"
                >
                  <Save size={16} />
                  <span className="text-xs font-bold">GRAVAR ALTERAÇÕES</span>
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <textarea
                value={editingJson}
                onChange={(e) => setEditingJson(e.target.value)}
                className="w-full h-full bg-slate-950 text-emerald-400 font-mono text-xs p-4 focus:outline-none resize-none leading-relaxed custom-scrollbar"
                spellCheck={false}
              />
            </div>
          </div>
          
          <div className="flex items-start space-x-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
             <ShieldAlert size={20} className="shrink-0 mt-0.5" />
             <p className="text-sm">
               <strong>Atenção:</strong> Você está editando o banco de dados bruto. Alterações incorretas podem corromper o sistema. 
               Certifique-se de manter a estrutura JSON válida. Recomenda-se baixar um backup antes de salvar.
             </p>
          </div>
        </div>
      )}
    </div>
  );
};