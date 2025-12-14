import React, { useState, useRef } from 'react';
import { Expense, ExpenseCategory, User, ExpenseStatus } from '../types';
import { Mic, MicOff, Save, Loader2, Upload, FileText } from 'lucide-react';
import { extractExpenseFromAudio, blobToBase64 } from '../services/geminiService';

interface ExpenseFormProps {
  currentUser: User;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onCancel: () => void;
}

export const ExpenseForm: React.FC<ExpenseFormProps> = ({ currentUser, onAddExpense, onCancel }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  
  // Helper to get local date string YYYY-MM-DD
  const getTodayLocal = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Form State
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.OUTROS);
  const [date, setDate] = useState(getTodayLocal());
  const [status, setStatus] = useState<ExpenseStatus>('paid');
  const [notes, setNotes] = useState('');
  const [attachment, setAttachment] = useState<{name: string, data: string} | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await processAudio(blob);
        stream.getTracks().forEach(track => track.stop()); // Stop mic
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setStatusMessage('Ouvindo... Fale o valor, local e descrição.');
    } catch (err) {
      console.error("Mic error:", err);
      setStatusMessage('Erro ao acessar microfone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatusMessage('Processando áudio com IA...');
      setIsProcessing(true);
    }
  };

  const processAudio = async (blob: Blob) => {
    try {
      const data = await extractExpenseFromAudio(blob);
      if (data) {
        setAmount(data.amount.toString());
        setDescription(data.description);
        setLocation(data.location || '');
        setCategory(data.category);
        if (data.date) setDate(data.date);
        if (data.status) setStatus(data.status);
        setStatusMessage('Preenchido automaticamente via IA!');
      } else {
        setStatusMessage('Não foi possível entender o áudio.');
      }
    } catch (error) {
      setStatusMessage('Erro na inteligência artificial.');
      console.error(error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        const base64 = await blobToBase64(file);
        setAttachment({
          name: file.name,
          data: base64
        });
      } catch (err) {
        console.error("File error", err);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      userId: currentUser.id,
      amount: parseFloat(amount),
      description,
      location,
      category,
      date,
      status,
      notes,
      attachmentName: attachment?.name,
      attachmentData: attachment?.data
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-2xl mx-auto">
      <div className="bg-emerald-600 p-6 text-white flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Novo Gasto</h2>
          <p className="text-emerald-100 text-sm">Preencha os dados ou use a voz</p>
        </div>
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={`p-3 rounded-full transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500 animate-pulse ring-4 ring-red-300' 
              : 'bg-white/20 hover:bg-white/30'
          }`}
        >
          {isProcessing ? <Loader2 className="animate-spin" /> : isRecording ? <MicOff /> : <Mic />}
        </button>
      </div>

      {statusMessage && (
        <div className={`p-2 text-center text-sm font-medium ${isProcessing ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Amount */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-500 font-bold">R$</span>
              </div>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-10 w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Date */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Data</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800"
            />
          </div>

          {/* Status Select */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Status do Pagamento</label>
            <div className="flex space-x-4">
               <label className={`flex-1 border rounded-lg p-3 flex items-center justify-center cursor-pointer transition-colors ${status === 'paid' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200'}`}>
                 <input 
                    type="radio" 
                    name="status" 
                    value="paid" 
                    checked={status === 'paid'} 
                    onChange={() => setStatus('paid')}
                    className="mr-2"
                  />
                 Pago
               </label>
               <label className={`flex-1 border rounded-lg p-3 flex items-center justify-center cursor-pointer transition-colors ${status === 'pending' ? 'bg-amber-50 border-amber-500 text-amber-700' : 'bg-white border-slate-200'}`}>
                 <input 
                    type="radio" 
                    name="status" 
                    value="pending" 
                    checked={status === 'pending'} 
                    onChange={() => setStatus('pending')}
                    className="mr-2"
                  />
                 Pendente
               </label>
            </div>
          </div>

          {/* Description */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800"
              placeholder="Ex: Compras semanais"
            />
          </div>

           {/* Location */}
           <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Local / Estabelecimento</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800"
              placeholder="Ex: Supermercado X"
            />
          </div>

          {/* Category */}
          <div className="col-span-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800"
            >
              {Object.values(ExpenseCategory).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Attachment */}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Comprovante (PDF/Imagem)</label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center justify-center px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 cursor-pointer">
                <Upload size={16} className="mr-2" />
                Upload Arquivo
                <input type="file" className="hidden" accept="image/*,.pdf" onChange={handleFileChange} />
              </label>
              {attachment && (
                <span className="text-sm text-emerald-600 flex items-center">
                  <FileText size={14} className="mr-1"/> {attachment.name}
                </span>
              )}
            </div>
          </div>
          
           {/* Notes */}
           <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Observações</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 p-2.5 border bg-white text-slate-800"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 border border-transparent rounded-lg text-sm font-medium text-white hover:bg-emerald-700 flex items-center"
          >
            <Save size={16} className="mr-2" />
            Salvar Lançamento
          </button>
        </div>
      </form>
    </div>
  );
};