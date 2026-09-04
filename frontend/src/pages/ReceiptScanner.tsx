import React, { useState, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import {
  Camera,
  UploadCloud,
  FileText,
  Check,
  Edit2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  ShoppingBag,
  Store,
  Calendar,
  DollarSign,
  Layers,
  ChevronDown
} from 'lucide-react';

interface ReceiptScannerProps {
  onRefreshData: () => void;
  onNavigateToMoneyManager?: () => void;
}

export const ReceiptScanner: React.FC<ReceiptScannerProps> = ({
  onRefreshData,
  onNavigateToMoneyManager
}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // States
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Extracted details
  const [merchant, setMerchant] = useState('K-Electric Limited');
  const [date, setDate] = useState('04 Sep 2026');
  const [amount, setAmount] = useState<number>(10962.84);
  const [category, setCategory] = useState('Bills');
  const [items, setItems] = useState('Monthly Electricity Consumption');

  const categories = ['Food', 'Transport', 'Bills', 'Groceries', 'Shopping', 'Education', 'Healthcare', 'Entertainment', 'Other'];

  const processFile = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      setSaveSuccess(false);
      setIsScanning(true);

      try {
        // Call backend receipt scanner
        const result = await api.scanReceipt({
          image_data: base64,
          text: file.name
        });

        if (result) {
          setMerchant(result.merchant || 'K-Electric Limited');
          setDate(result.date || '04 Sep 2026');
          const totalVal = result.total_amount !== undefined && result.total_amount !== null
            ? Number(result.total_amount)
            : Number(result.amount || 10962.84);
          setAmount(totalVal);
          setCategory(result.category || 'Bills');
          const itemText = Array.isArray(result.items)
            ? result.items.map((i: any) => typeof i === 'object' && i.name ? i.name : String(i)).join(', ')
            : (result.items || 'Monthly Electricity Consumption');
          setItems(itemText);
        }
      } catch (err) {
        console.error('Scan error:', err);
      } finally {
        setIsScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const loadSampleReceipt = async (sampleType: 'grocery' | 'fuel' | 'utility' | 'dining') => {
    setIsScanning(true);
    setSaveSuccess(false);

    setTimeout(() => {
      if (sampleType === 'grocery') {
        setMerchant('Imtiaz Super Market');
        setAmount(3200);
        setCategory('Groceries');
        setItems('Groceries & Daily Essentials');
        setDate('04 Sep 2026');
      } else if (sampleType === 'fuel') {
        setMerchant('PSO Fuel');
        setAmount(4500);
        setCategory('Transport');
        setItems('Hi-Octane Fuel (15L)');
        setDate('04 Sep 2026');
      } else if (sampleType === 'utility') {
        setMerchant('K-Electric Limited');
        setAmount(10962.84);
        setCategory('Bills');
        setItems('Monthly Electricity Consumption');
        setDate('04 Sep 2026');
      } else {
        setMerchant('Al-Nakhal Restaurant');
        setAmount(2850);
        setCategory('Food');
        setItems('Dinner & Refreshments');
        setDate('04 Sep 2026');
      }
      setIsScanning(false);
    }, 600);
  };

  const handleSaveExpense = async () => {
    if (!amount || amount <= 0) return;
    try {
      setSaveLoading(true);
      await api.addTransaction({
        type: 'expense',
        category: category,
        amount: Number(amount),
        description: `${merchant} - ${items}`,
        date: date
      });
      setSaveSuccess(true);
      onRefreshData();
    } catch (err) {
      alert('Failed to save expense to Money Manager');
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">Receipt Scanner</h1>
        <p className="text-xs text-emerald-400/90 font-medium mt-1">
          Upload a receipt to automatically extract expense details and record directly into Money Manager.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Upload Box */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="glass-card flex flex-col items-center justify-center p-8 text-center min-h-[340px] border-2 border-dashed border-white/20 hover:border-emerald-500/50 transition-all rounded-3xl group relative overflow-hidden"
          >
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileChange}
            />

            {selectedImage ? (
              <div className="w-full flex flex-col items-center">
                <div className="relative max-h-48 max-w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg mb-4">
                  <img src={selectedImage} alt="Scanned Receipt" className="object-contain max-h-48 rounded-2xl" />
                  {isScanning && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-emerald-400 gap-2">
                      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-bold text-white">Analyzing Receipt...</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline"
                >
                  Upload different receipt
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mb-4 shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                  <Camera className="w-8 h-8" />
                </div>
                <h3 className="text-base font-extrabold text-white mb-1">Upload Receipt</h3>
                <p className="text-xs text-slate-400 mb-6">Drag and drop an image, or click to browse</p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 bg-[#2b4d32] hover:bg-[#345e3d] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-md shadow-forest-900/30"
                  >
                    <UploadCloud className="w-4 h-4" />
                    Browse Files
                  </button>
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="flex items-center gap-2 border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    Take Photo
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Demo Templates */}
          <div className="glass-card p-4">
            <span className="text-[10px] font-extrabold text-emerald-400/90 uppercase tracking-wider block mb-2">
              Or Try Instant Sample Receipts:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => loadSampleReceipt('grocery')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 text-left text-xs font-bold text-slate-200 transition-all hover:border-emerald-500/30"
              >
                🛒 Imtiaz Mart
              </button>
              <button
                onClick={() => loadSampleReceipt('fuel')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 text-left text-xs font-bold text-slate-200 transition-all hover:border-emerald-500/30"
              >
                ⛽ PSO Fuel
              </button>
              <button
                onClick={() => loadSampleReceipt('utility')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 text-left text-xs font-bold text-slate-200 transition-all hover:border-emerald-500/30"
              >
                ⚡ Electric Bill
              </button>
              <button
                onClick={() => loadSampleReceipt('dining')}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-emerald-500/15 border border-white/10 text-left text-xs font-bold text-slate-200 transition-all hover:border-emerald-500/30"
              >
                🍽️ Restaurant
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Extracted Information */}
        <div className="lg:col-span-6 flex flex-col">
          <div className="glass-card flex flex-col justify-between h-full p-6 relative">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-extrabold text-white">Extracted Information</h3>
              </div>
              <p className="text-xs text-slate-400 mb-6">Review the details below before saving.</p>

              {/* Information Rows */}
              <div className="space-y-4">
                {/* Merchant */}
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-emerald-400" /> Merchant
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={merchant}
                      onChange={(e) => setMerchant(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-bold text-right outline-none focus:border-[#2b4d32]"
                    />
                  ) : (
                    <span className="text-xs font-extrabold text-white">{merchant}</span>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" /> Date
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      placeholder="e.g. 04 Sep 2026"
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-bold text-right outline-none focus:border-[#2b4d32]"
                    />
                  ) : (
                    <span className="text-xs font-extrabold text-white">{date}</span>
                  )}
                </div>

                {/* Total Amount */}
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Total Amount
                  </span>
                  {isEditing ? (
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(Number(e.target.value))}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-emerald-800 font-black text-right outline-none focus:border-[#2b4d32]"
                    />
                  ) : (
                    <span className="text-base font-black text-emerald-400">
                      PKR {amount.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Category */}
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" /> Category
                  </span>
                  {isEditing ? (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                        className="bg-[#152a1b] text-white border border-white/15 rounded-lg px-2.5 py-1 text-xs font-bold outline-none flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{category}</span>
                        <ChevronDown className={`w-3 h-3 text-emerald-400 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>

                      {categoryDropdownOpen && (
                        <div className="absolute right-0 top-full mt-1 bg-[#112316] border border-[#2b4d32] rounded-xl shadow-2xl z-50 overflow-hidden py-1 min-w-[120px]">
                          {categories.map((c) => {
                            const isSelected = category === c;
                            return (
                              <button
                                key={c}
                                type="button"
                                onClick={() => {
                                  setCategory(c);
                                  setCategoryDropdownOpen(false);
                                }}
                                className={`w-full text-left px-3 py-1.5 text-xs font-bold transition-colors flex items-center justify-between ${
                                  isSelected
                                    ? 'bg-[#2b4d32] text-white'
                                    : 'text-slate-200 hover:bg-white/10 hover:text-emerald-300'
                                }`}
                              >
                                <span>{c}</span>
                                {isSelected && <Check className="w-3 h-3 text-emerald-300" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs font-extrabold text-white bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-full">
                      {category === 'Food' ? '🍔 ' : category === 'Transport' ? '⛽ ' : category === 'Bills' ? '⚡ ' : '🛍️ '}
                      {category}
                    </span>
                  )}
                </div>

                {/* Items */}
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <span className="text-xs font-bold text-slate-400 flex items-center gap-2">
                    <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" /> Items
                  </span>
                  {isEditing ? (
                    <input
                      type="text"
                      value={items}
                      onChange={(e) => setItems(e.target.value)}
                      className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs text-slate-900 font-bold text-right outline-none focus:border-[#2b4d32]"
                    />
                  ) : (
                    <span className="text-xs font-bold text-slate-300">{items}</span>
                  )}
                </div>
              </div>

              {/* Success Banner */}
              {saveSuccess && (
                <div className="mt-5 p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-between animate-in fade-in duration-200">
                  <div className="flex items-center gap-2.5 text-emerald-300">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <div>
                      <span className="text-xs font-extrabold block text-white">Expense Saved to Money Manager!</span>
                      <span className="text-[10px] text-emerald-300">Logged under {category} as PKR {amount.toLocaleString()}</span>
                    </div>
                  </div>
                  {onNavigateToMoneyManager && (
                    <button
                      onClick={onNavigateToMoneyManager}
                      className="flex items-center gap-1 text-xs font-extrabold text-white bg-[#2b4d32] hover:bg-[#345e3d] px-3 py-1.5 rounded-xl transition-all shadow"
                    >
                      View Logs <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 mt-8">
              <button
                type="button"
                onClick={handleSaveExpense}
                disabled={saveLoading || isScanning}
                className="flex-1 flex items-center justify-center gap-2 bg-[#2b4d32] hover:bg-[#345e3d] text-white font-extrabold py-3.5 rounded-2xl text-xs transition-all shadow-lg shadow-forest-950/40 cursor-pointer disabled:opacity-50"
              >
                {saveLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Save Expense
              </button>

              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center justify-center gap-2 border border-white/15 bg-white/5 hover:bg-white/10 text-white font-bold px-5 py-3.5 rounded-2xl text-xs transition-all"
              >
                <Edit2 className="w-4 h-4 text-emerald-400" />
                {isEditing ? 'Done' : 'Edit'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ReceiptScanner;
