import React, { useState } from 'react';
import { Lock, Mail, ArrowRight, ShieldCheck, User, Fingerprint, Shield, ArrowLeft } from 'lucide-react';

interface LoginProps {
  onLogin: (identifier: string, password: string, requireAdmin: boolean) => Promise<boolean>;
  onRegister: (name: string, email: string, cpf: string, password: string) => Promise<boolean>;
  onBack?: () => void; // New prop to go back to landing page
}

export const Login: React.FC<LoginProps> = ({ onLogin, onRegister, onBack }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdminLogin, setIsAdminLogin] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        const success = await onRegister(name, email, cpf, password);
        if (!success) {
           setError('Erro ao criar conta. Tente novamente.');
        }
      } else {
        const success = await onLogin(email, password, isAdminLogin);
        if (!success) {
          if (isAdminLogin) {
            setError('Falha no login. Verifique suas credenciais e permissões de administrador.');
          } else {
            setError('Credenciais inválidas. Verifique Email/CPF ou senha.');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setError('');
    setName('');
    setEmail('');
    setCpf('');
    setPassword('');
    if (!isRegistering) setIsAdminLogin(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 to-slate-800 -z-10"></div>

      <div className="bg-white rounded-2xl shadow-2xl flex flex-col md:flex-row w-full max-w-4xl overflow-hidden transition-all duration-500 min-h-[600px]">
        
        {/* Left Side - Brand & Info */}
        <div className={`md:w-1/2 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden transition-colors duration-500 ${isAdminLogin ? 'bg-slate-800' : 'bg-emerald-600'}`}>
          <div className="relative z-10">
            {onBack && (
              <button 
                onClick={onBack}
                className="flex items-center space-x-2 text-white/80 hover:text-white mb-8 transition-colors text-sm font-medium"
              >
                <ArrowLeft size={16} />
                <span>Voltar para Home</span>
              </button>
            )}

            <div className="flex items-center space-x-2 mb-6">
              <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                <ShieldCheck size={28} className="text-white" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight">Família Fin.</h1>
            </div>
            
            <h2 className="text-3xl font-bold mb-4 leading-tight">
              {isRegistering ? "Junte-se a nós!" : isAdminLogin ? "Acesso Administrativo" : "Controle total das finanças."}
            </h2>
            <p className={`text-lg ${isAdminLogin ? 'text-slate-300' : 'text-emerald-100'}`}>
              {isRegistering 
                ? "Crie sua conta em segundos. Use seu CPF para maior segurança e organização." 
                : isAdminLogin
                  ? "Gerencie permissões, usuários e configurações globais da família."
                  : "Gerencie gastos, planeje o futuro e mantenha a economia familiar organizada em um só lugar."}
            </p>
          </div>

          <div className="mt-8 relative z-10">
            {!isRegistering && (
              <div className="bg-white/10 p-4 rounded-lg backdrop-blur-sm border border-white/20">
                <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isAdminLogin ? 'text-slate-300' : 'text-emerald-200'}`}>
                  Credenciais Demo:
                </p>
                <div className="space-y-1 text-sm">
                  <p><span className="opacity-70">Admin:</span> carlos@familia.com / 123</p>
                  <p><span className="opacity-70">Membro:</span> pedro@familia.com / 123</p>
                  <p className="mt-2 pt-2 border-t border-white/20 text-yellow-300 font-bold"><span className="opacity-70">Dono:</span> dono@software.com / 123</p>
                </div>
              </div>
            )}
          </div>

          {/* Decorative Circles */}
          <div className={`absolute -bottom-24 -left-24 w-64 h-64 rounded-full opacity-50 blur-3xl ${isAdminLogin ? 'bg-indigo-600' : 'bg-emerald-500'}`}></div>
          <div className={`absolute -top-24 -right-24 w-64 h-64 rounded-full opacity-50 blur-3xl ${isAdminLogin ? 'bg-indigo-500' : 'bg-emerald-400'}`}></div>
        </div>

        {/* Right Side - Form */}
        <div className="md:w-1/2 p-8 md:p-12 bg-white flex flex-col justify-center animate-in fade-in duration-300">
          <div className="mb-6">
             <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {isRegistering ? "Crie sua conta" : "Bem-vindo de volta!"}
                </h2>
                <p className="text-slate-500 mt-1">
                  {isRegistering ? "Preencha seus dados pessoais." : "Use suas credenciais para acessar."}
                </p>
              </div>
              
              {/* Admin Toggle */}
              {!isRegistering && (
                <button
                  type="button"
                  onClick={() => setIsAdminLogin(!isAdminLogin)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isAdminLogin 
                      ? 'bg-indigo-100 text-indigo-700 ring-2 ring-indigo-500' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  title="Alternar para login administrativo"
                >
                  <Shield size={14} />
                  <span>Admin</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegistering && (
              <>
                <div className="animate-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required={isRegistering}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border transition-colors bg-white text-slate-800"
                      placeholder="Seu Nome"
                    />
                  </div>
                </div>

                <div className="animate-in slide-in-from-top-4 duration-300">
                  <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Fingerprint size={18} className="text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required={isRegistering}
                      value={cpf}
                      onChange={handleCpfChange}
                      maxLength={14}
                      className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-3 border transition-colors bg-white text-slate-800"
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isRegistering ? "Email" : "Email ou CPF"}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`pl-10 w-full rounded-lg shadow-sm p-3 border transition-colors bg-white text-slate-800 ${isAdminLogin ? 'focus:border-indigo-500 focus:ring-indigo-500 border-slate-300' : 'focus:border-emerald-500 focus:ring-emerald-500 border-slate-300'}`}
                  placeholder={isRegistering ? "seu@email.com" : "email@exemplo.com ou CPF"}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`pl-10 w-full rounded-lg shadow-sm p-3 border transition-colors bg-white text-slate-800 ${isAdminLogin ? 'focus:border-indigo-500 focus:ring-indigo-500 border-slate-300' : 'focus:border-emerald-500 focus:ring-emerald-500 border-slate-300'}`}
                  placeholder="••••••••"
                  minLength={3}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 flex items-center animate-in fade-in">
                <span className="mr-2">⚠️</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full flex items-center justify-center space-x-2 text-white p-3 rounded-lg font-semibold shadow-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform hover:-translate-y-0.5 ${
                isAdminLogin 
                  ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200' 
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200'
              }`}
            >
              {loading ? (
                <span>Processando...</span>
              ) : (
                <>
                  <span>{isRegistering ? "Criar Conta" : isAdminLogin ? "Entrar como Admin" : "Entrar no Sistema"}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-slate-100 pt-6">
            <p className="text-sm text-slate-500">
              {isRegistering ? "Já tem uma conta?" : "Não tem uma conta ainda?"}
            </p>
            <button 
              onClick={toggleMode}
              className={`mt-2 font-semibold transition-colors ${isAdminLogin ? 'text-indigo-600 hover:text-indigo-800' : 'text-emerald-600 hover:text-emerald-800'}`}
            >
              {isRegistering ? "Fazer Login" : "Criar nova conta"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};