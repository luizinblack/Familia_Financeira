import React, { useState } from 'react';
import { User } from '../types';
import { CreditCard, Lock, Loader2, User as UserIcon, ShieldCheck, ArrowLeft, Check, PieChart } from 'lucide-react';
import { subscribeUser } from '../services/storageService';

interface CheckoutPageProps {
  user: User;
  onSuccess: (updatedUser: User) => void;
  onCancel: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ user, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Form State
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const updatedUser = subscribeUser(user.id);
      setPaymentSuccess(true);
      setTimeout(() => {
        onSuccess(updatedUser);
      }, 1500);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-12 flex flex-col items-center justify-center text-center max-w-md w-full animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
            <Check size={40} className="text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-2">Pagamento Confirmado!</h3>
          <p className="text-slate-600 mb-6">Sua assinatura Premium foi ativada. Você será redirecionado...</p>
          <Loader2 className="animate-spin text-emerald-600" size={24} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header Simplificado */}
      <header className="bg-white border-b border-slate-200 py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-emerald-600 p-1.5 rounded-lg">
              <PieChart size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">Família Fin.</span>
            <span className="text-slate-400 mx-2">|</span>
            <span className="text-slate-500 font-medium text-sm uppercase tracking-wide">Checkout Seguro</span>
          </div>
          <div className="flex items-center text-xs text-emerald-600 font-medium bg-emerald-50 px-3 py-1 rounded-full">
            <Lock size={12} className="mr-1" /> Ambiente Seguro 256-bit SSL
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-start justify-center p-4 sm:p-8">
        <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Coluna Esquerda: Resumo do Pedido */}
          <div className="md:col-span-5 order-2 md:order-1 space-y-6">
             <button 
                onClick={onCancel}
                className="flex items-center text-slate-500 hover:text-slate-800 transition-colors text-sm font-medium mb-4"
             >
                <ArrowLeft size={16} className="mr-1" /> Voltar para o Dashboard
             </button>

             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Resumo do Pedido</h2>
                <div className="flex justify-between items-center py-4 border-b border-slate-100">
                   <div>
                      <p className="font-semibold text-slate-700">Plano Família Premium</p>
                      <p className="text-xs text-slate-500">Cobrança Mensal</p>
                   </div>
                   <p className="font-bold text-slate-800">R$ 10,00</p>
                </div>
                <div className="flex justify-between items-center py-4">
                   <p className="font-bold text-slate-800 text-lg">Total a pagar</p>
                   <p className="font-bold text-emerald-600 text-2xl">R$ 10,00</p>
                </div>
                
                <div className="mt-6 bg-slate-50 p-4 rounded-lg space-y-2">
                   <div className="flex items-center text-sm text-slate-600">
                      <Check size={16} className="text-emerald-500 mr-2" />
                      Lançamentos Ilimitados
                   </div>
                   <div className="flex items-center text-sm text-slate-600">
                      <Check size={16} className="text-emerald-500 mr-2" />
                      Inteligência Artificial Avançada
                   </div>
                   <div className="flex items-center text-sm text-slate-600">
                      <Check size={16} className="text-emerald-500 mr-2" />
                      Upload de Comprovantes
                   </div>
                </div>
             </div>

             <div className="flex items-center justify-center space-x-4 grayscale opacity-60">
                {/* Mock logos */}
                <div className="h-8 w-12 bg-slate-300 rounded"></div>
                <div className="h-8 w-12 bg-slate-300 rounded"></div>
                <div className="h-8 w-12 bg-slate-300 rounded"></div>
                <div className="h-8 w-12 bg-slate-300 rounded"></div>
             </div>
          </div>

          {/* Coluna Direita: Formulário de Pagamento */}
          <div className="md:col-span-7 order-1 md:order-2">
             <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
                <div className="bg-slate-900 text-white p-6">
                   <h2 className="text-xl font-bold flex items-center">
                      <CreditCard className="mr-2" size={24}/> Dados de Pagamento
                   </h2>
                   <p className="text-slate-400 text-sm mt-1">Complete seus dados para ativar o plano.</p>
                </div>

                <form onSubmit={handleSubscribe} className="p-8 space-y-6">
                  
                   {/* Info Usuário */}
                   <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-center space-x-3 mb-6">
                      <div className="bg-white p-2 rounded-full text-blue-500">
                         <UserIcon size={20} />
                      </div>
                      <div>
                         <p className="text-xs text-blue-600 font-bold uppercase">Assinando como</p>
                         <p className="text-sm font-medium text-slate-700">{user.name} ({user.email})</p>
                      </div>
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nome Impresso no Cartão</label>
                      <input 
                        type="text" 
                        required 
                        value={cardName}
                        onChange={e => setCardName(e.target.value)}
                        placeholder="NOME COMO NO CARTÃO"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-800 uppercase"
                      />
                   </div>

                   <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Número do Cartão</label>
                      <div className="relative">
                        <input 
                          type="text" 
                          required 
                          maxLength={19}
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value.replace(/\D/g,'').replace(/(\d{4})/g, '$1 ').trim())}
                          placeholder="0000 0000 0000 0000"
                          className="w-full pl-12 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-800 font-mono text-lg"
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <CreditCard size={20} className="text-slate-400" />
                        </div>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Validade</label>
                        <input 
                          type="text" 
                          required 
                          maxLength={5}
                          value={expiry}
                          onChange={e => setExpiry(e.target.value.replace(/\D/g,'').replace(/(\d{2})(\d)/, '$1/$2'))}
                          placeholder="MM/AA"
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-800 text-center"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CVV</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            required 
                            maxLength={4}
                            value={cvv}
                            onChange={e => setCvv(e.target.value.replace(/\D/g,''))}
                            placeholder="123"
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white text-slate-800"
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Lock size={16} className="text-slate-400" />
                          </div>
                        </div>
                      </div>
                   </div>

                   <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 disabled:opacity-70 mt-4 flex items-center justify-center"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={24} className="animate-spin mr-2" /> Processando...
                        </>
                      ) : (
                        "Finalizar Pagamento e Assinar"
                      )}
                   </button>
                   
                   <p className="text-xs text-center text-slate-400 mt-4 flex items-center justify-center">
                      <ShieldCheck size={14} className="mr-1" /> Seus dados estão protegidos.
                   </p>
                </form>
             </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-6 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-400 text-sm">
           © 2023 Família Fin. Pagamento processado de forma segura.
        </div>
      </footer>
    </div>
  );
};