import React from 'react';
import { LayoutDashboard, Mic, Users, ShieldCheck, ArrowRight, PieChart, Star, CheckCircle } from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigateToLogin }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-600 p-2 rounded-lg">
                <PieChart size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-800">Família Fin.</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={onNavigateToLogin}
                className="text-slate-600 hover:text-emerald-600 font-medium transition-colors hidden md:block"
              >
                Já tenho conta
              </button>
              <button 
                onClick={onNavigateToLogin}
                className="bg-emerald-600 text-white px-5 py-2 rounded-lg font-semibold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                Entrar
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative overflow-hidden pt-16 pb-24 lg:pt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-sm font-semibold mb-6 border border-emerald-200">
              <Star size={14} className="mr-2 fill-emerald-800" />
              O app nº 1 para finanças familiares
            </div>
            <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6 leading-tight">
              Controle os gastos da sua família com <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Inteligência Artificial</span>
            </h1>
            <p className="text-xl text-slate-600 mb-10 leading-relaxed">
              Diga adeus às planilhas complicadas. Use sua voz para registrar gastos, separe contas por membro da família e visualize o futuro financeiro do seu lar.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button 
                onClick={onNavigateToLogin}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-all shadow-xl"
              >
                <span>Começar Gratuitamente</span>
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={onNavigateToLogin}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all"
              >
                <span>Ver Demonstração</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-1/2 w-full -translate-x-1/2 h-full z-0 pointer-events-none">
           <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
           <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
           <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>
      </header>

      {/* Features Grid */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Tudo o que você precisa em um só lugar</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Desenvolvido pensando na rotina real das famílias brasileiras. Simples, rápido e poderoso.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Mic className="text-white" size={24} />}
              color="bg-purple-500"
              title="Registro por Voz via IA"
              description="Basta falar: 'Gastei 50 reais na padaria'. Nossa IA entende, categoriza e registra tudo automaticamente."
            />
            <FeatureCard 
              icon={<Users className="text-white" size={24} />}
              color="bg-blue-500"
              title="Controle Multiusuário"
              description="Cada membro da família tem seu acesso. O administrador visualiza tudo, mantendo a organização centralizada."
            />
            <FeatureCard 
              icon={<LayoutDashboard className="text-white" size={24} />}
              color="bg-emerald-500"
              title="Dashboards Intuitivos"
              description="Gráficos claros mostram para onde seu dinheiro está indo. Identifique gastos excessivos num piscar de olhos."
            />
          </div>
        </div>
      </section>

      {/* Trust/Security Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0 pr-0 md:pr-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Segurança e Organização para o seu lar</h2>
            <div className="space-y-4">
              <CheckItem text="Dados criptografados e seguros." />
              <CheckItem text="Separação de perfis (Pai, Mãe, Filhos)." />
              <CheckItem text="Exportação de relatórios em CSV." />
              <CheckItem text="Armazenamento de comprovantes e notas." />
            </div>
            <div className="mt-8">
               <div className="flex items-center space-x-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm w-fit">
                  <ShieldCheck size={32} className="text-emerald-600" />
                  <div>
                    <p className="font-bold text-slate-800">100% Seguro</p>
                    <p className="text-xs text-slate-500">Seus dados são protegidos</p>
                  </div>
               </div>
            </div>
          </div>
          <div className="md:w-1/2 bg-white p-8 rounded-2xl shadow-xl border border-slate-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            {/* Mockup visual */}
            <div className="space-y-4">
               <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                  <div className="h-4 w-32 bg-slate-200 rounded"></div>
                  <div className="h-8 w-8 bg-emerald-100 rounded-full"></div>
               </div>
               <div className="space-y-3">
                  <div className="h-20 bg-slate-50 rounded-lg p-3 flex items-center space-x-3">
                     <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">🛒</div>
                     <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 bg-slate-200 rounded"></div>
                        <div className="h-2 w-16 bg-slate-100 rounded"></div>
                     </div>
                     <div className="h-4 w-12 bg-slate-200 rounded"></div>
                  </div>
                  <div className="h-20 bg-slate-50 rounded-lg p-3 flex items-center space-x-3">
                     <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">🎬</div>
                     <div className="flex-1 space-y-2">
                        <div className="h-3 w-24 bg-slate-200 rounded"></div>
                        <div className="h-2 w-16 bg-slate-100 rounded"></div>
                     </div>
                     <div className="h-4 w-12 bg-slate-200 rounded"></div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-6">Pronto para organizar sua vida financeira?</h2>
          <button 
            onClick={onNavigateToLogin}
            className="bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-900/50"
          >
            Criar Conta Grátis
          </button>
          <p className="mt-8 text-slate-500 text-sm">© 2023 Família Fin. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, color, title, description }: any) => (
  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow duration-300">
    <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-md`}>
      {icon}
    </div>
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{description}</p>
  </div>
);

const CheckItem = ({ text }: { text: string }) => (
  <div className="flex items-center space-x-3">
    <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
    <span className="text-slate-700 font-medium">{text}</span>
  </div>
);