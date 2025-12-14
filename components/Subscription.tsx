import React from 'react';
import { User } from '../types';
import { Check } from 'lucide-react';

interface SubscriptionProps {
  user: User;
  onStartCheckout: () => void; // Call parent to switch to checkout page
}

export const Subscription: React.FC<SubscriptionProps> = ({ user, onStartCheckout }) => {
  const isPremium = user.plan === 'premium';

  const PlanCard = ({ title, price, features, isRecommended, active }: any) => (
    <div className={`relative p-8 rounded-2xl border transition-all duration-300 flex flex-col h-full ${
      active 
        ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500 shadow-xl' 
        : isRecommended 
          ? 'border-slate-200 bg-white hover:border-emerald-300 shadow-lg hover:shadow-xl scale-105 z-10' 
          : 'border-slate-200 bg-white hover:border-slate-300'
    }`}>
      {isRecommended && !active && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-md">
          Recomendado
        </div>
      )}
      
      {active && (
         <div className="absolute top-4 right-4 text-emerald-600 flex items-center bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold">
            <Check size={12} className="mr-1"/> SEU PLANO
         </div>
      )}

      <div className="mb-6">
        <h3 className={`text-lg font-bold ${active ? 'text-emerald-800' : 'text-slate-800'}`}>{title}</h3>
        <div className="mt-4 flex items-baseline">
          <span className="text-4xl font-extrabold tracking-tight text-slate-900">R$ {price}</span>
          <span className="ml-1 text-xl font-semibold text-slate-500">/mês</span>
        </div>
        <p className="mt-2 text-sm text-slate-500">Cancele quando quiser.</p>
      </div>

      <ul className="space-y-4 mb-8 flex-1">
        {features.map((feature: string, idx: number) => (
          <li key={idx} className="flex items-start">
            <div className={`flex-shrink-0 p-1 rounded-full ${active ? 'bg-emerald-200' : 'bg-emerald-100'}`}>
              <Check size={12} className="text-emerald-700" />
            </div>
            <span className="ml-3 text-sm text-slate-600 font-medium">{feature}</span>
          </li>
        ))}
      </ul>

      {active ? (
        <button 
          disabled 
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 text-white font-bold opacity-80 cursor-default"
        >
          Plano Ativo
        </button>
      ) : (
        <button 
          onClick={onStartCheckout}
          className={`w-full py-3 px-4 rounded-xl font-bold transition-all shadow-lg ${
            isRecommended 
              ? 'bg-slate-900 text-white hover:bg-slate-800' 
              : 'bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-800'
          }`}
        >
          Assinar Agora
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-6">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-slate-900">Escolha o plano ideal para sua família</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Desbloqueie todo o potencial da inteligência artificial e organize suas finanças sem limites.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch pt-8">
        {/* Free Plan */}
        <PlanCard 
          title="Básico" 
          price="0,00" 
          active={!isPremium}
          features={[
            "Até 50 lançamentos mensais",
            "Dashboard básico",
            "1 usuário administrador",
            "Suporte por email",
            "Publicidade no app"
          ]} 
        />

        {/* Premium Plan */}
        <PlanCard 
          title="Família Premium" 
          price="10,00" 
          isRecommended={true}
          active={isPremium}
          features={[
            "Lançamentos ilimitados",
            "IA de transcrição avançada",
            "Usuários ilimitados",
            "Relatórios detalhados em PDF/CSV",
            "Upload de comprovantes",
            "Sem anúncios",
            "Suporte prioritário"
          ]} 
        />
      </div>
    </div>
  );
};