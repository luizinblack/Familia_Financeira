import React, { useState, useEffect, useRef } from 'react';
import { User, Expense, ExpenseCategory, ExpenseStatus } from '../types';
import { extractExpenseFromImageOrPDF, blobToBase64 } from '../services/geminiService';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, ScanLine, Save, X, RefreshCw } from 'lucide-react';

interface SmartScannerProps {
  currentUser: User;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

export const SmartScanner: React.FC<SmartScannerProps> = ({ currentUser, onAddExpense, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // File State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  // Extracted Data State (Form)
  const [scannedData, setScannedData] = useState<Partial<Expense> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get local date string YYYY-MM-DD to avoid timezone issues with toISOString()
  const getTodayLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Effect to handle preview URL creation and cleanup
  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);

    // Cleanup function to avoid memory leaks
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Basic validation
      if (file.size > 5 * 1024 * 1024) {
        setError("O arquivo é muito grande (Máx 5MB).");
        return;
      }

      setSelectedFile(file);
      setError(null);
      setScannedData(null);

      // Auto-start scanning
      await scanDocument(file);
    }
  };

  const scanDocument = async (file: File) => {
    setIsProcessing(true);
    try {
      const result = await extractExpenseFromImageOrPDF(file);
      
      if (result) {
        // Prepare data for review
        const base64Data = await blobToBase64(file);
        
        setScannedData({
          amount: result.amount,
          description: result.description,
          location: result.location,
          category: result.category,
          date: result.date || getTodayLocal(),
          status: result.status,
          attachmentName: file.name,
          attachmentData: base64Data
        });
      } else {
        setError("A IA não conseguiu ler os dados deste arquivo. Tente uma imagem mais nítida.");
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao processar o documento. Verifique sua conexão.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    if (scannedData && scannedData.amount && scannedData.description) {
      onAddExpense({
        userId: currentUser.id,
        amount: scannedData.amount,
        description: scannedData.description,
        location: scannedData.location || '',
        category: scannedData.category || ExpenseCategory.OUTROS,
        date: scannedData.date || getTodayLocal(),
        status: scannedData.status || 'paid',
        notes: "Importado via Scanner Inteligente",
        attachmentName: scannedData.attachmentName,
        attachmentData: scannedData.attachmentData
      });
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setScannedData(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        
        <div className="text-center mb-8">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ScanLine size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800">Scanner Inteligente</h2>
          <p className="text-slate-500 max-w-lg mx-auto mt-2">
            Adicione um comprovante, nota fiscal ou fatura (PDF ou Imagem). 
            Nossa IA lerá os dados e preencherá tudo para você automaticamente.
          </p>
        </div>

        {/* --- STEP 1: UPLOAD AREA --- */}
        {!selectedFile && (
          <div 
            className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,.pdf" 
              onChange={handleFileSelect}
            />
            <div className="group-hover:scale-110 transition-transform duration-300 inline-block">
               <Upload size={48} className="text-slate-400 mb-4 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-slate-700">Clique para selecionar o arquivo</h3>
            <p className="text-sm text-slate-400 mt-2">Suporta JPG, PNG e PDF (Máx 5MB)</p>
          </div>
        )}

        {/* --- STEP 2: PROCESSING & REVIEW --- */}
        {selectedFile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Left: Preview */}
            <div className="bg-slate-100 rounded-xl p-4 flex items-center justify-center relative overflow-hidden min-h-[300px]">
               {selectedFile.type === 'application/pdf' ? (
                 <div className="text-center text-slate-500">
                    <FileText size={64} className="mx-auto mb-2" />
                    <p className="font-medium">{selectedFile.name}</p>
                    <p className="text-xs">Pré-visualização de PDF simplificada</p>
                 </div>
               ) : (
                 <img 
                   src={previewUrl || ''} 
                   alt="Preview" 
                   className="w-full h-auto max-h-[400px] object-contain rounded shadow-md" 
                 />
               )}
               
               <button 
                 onClick={reset}
                 className="absolute top-2 right-2 p-2 bg-white/80 hover:bg-white text-slate-600 rounded-full shadow-sm backdrop-blur-sm z-10"
                 title="Remover arquivo"
               >
                 <X size={20} />
               </button>
            </div>

            {/* Right: Analysis Result */}
            <div className="flex flex-col justify-center">
               
               {isProcessing ? (
                 <div className="text-center py-12">
                    <Loader2 size={48} className="animate-spin text-indigo-600 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-slate-800">Analisando Documento...</h3>
                    <p className="text-slate-500 text-sm">A IA está lendo o valor, data e local.</p>
                 </div>
               ) : error ? (
                 <div className="bg-red-50 p-6 rounded-xl border border-red-100 text-center">
                    <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
                    <p className="text-red-700 font-medium mb-4">{error}</p>
                    <button onClick={reset} className="text-sm font-bold text-red-600 hover:underline">Tentar outro arquivo</button>
                 </div>
               ) : scannedData ? (
                 <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex items-center justify-between mb-2">
                       <h3 className="font-bold text-emerald-700 flex items-center">
                          <CheckCircle size={18} className="mr-2" />
                          Leitura Concluída!
                       </h3>
                       <span className="text-xs text-slate-400">Verifique os dados abaixo</span>
                    </div>

                    <div className="space-y-3">
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Valor</label>
                          <input 
                            type="number" 
                            className="w-full font-mono text-2xl font-bold text-slate-800 bg-transparent border-b border-slate-200 focus:border-indigo-500 focus:outline-none py-1"
                            value={scannedData.amount}
                            onChange={(e) => setScannedData({...scannedData, amount: parseFloat(e.target.value)})}
                          />
                       </div>

                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase">Descrição / Local</label>
                          <input 
                            type="text" 
                            className="w-full font-medium text-slate-800 bg-transparent border-b border-slate-200 focus:border-indigo-500 focus:outline-none py-1"
                            value={scannedData.description}
                            onChange={(e) => setScannedData({...scannedData, description: e.target.value})}
                          />
                       </div>

                       <div className="grid grid-cols-2 gap-4">
                          <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Data</label>
                             <input 
                               type="date" 
                               className="w-full text-slate-800 bg-transparent border-b border-slate-200 focus:border-indigo-500 focus:outline-none py-1"
                               value={scannedData.date}
                               onChange={(e) => setScannedData({...scannedData, date: e.target.value})}
                             />
                          </div>
                          <div>
                             <label className="text-xs font-bold text-slate-500 uppercase">Categoria</label>
                             <select 
                               className="w-full text-slate-800 bg-transparent border-b border-slate-200 focus:border-indigo-500 focus:outline-none py-1"
                               value={scannedData.category}
                               onChange={(e) => setScannedData({...scannedData, category: e.target.value as ExpenseCategory})}
                             >
                                {Object.values(ExpenseCategory).map(c => <option key={c} value={c}>{c}</option>)}
                             </select>
                          </div>
                       </div>
                    </div>

                    <div className="pt-6 flex space-x-3">
                       <button 
                         onClick={handleSave}
                         className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center"
                       >
                          <Save size={18} className="mr-2" />
                          Confirmar e Salvar
                       </button>
                       <button 
                         onClick={reset}
                         className="px-4 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200"
                         title="Escanear outro"
                       >
                          <RefreshCw size={18} />
                       </button>
                    </div>
                 </div>
               ) : null}

            </div>
          </div>
        )}
      </div>
    </div>
  );
};