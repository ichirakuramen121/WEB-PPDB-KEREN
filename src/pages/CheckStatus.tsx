import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Clock, Loader2, ArrowLeft, Printer } from 'lucide-react';
import { Link } from 'react-router-dom';
import { checkStatus } from '../services/api';
import { cn } from '../lib/utils';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function CheckStatus() {
  const [noPendaftaran, setNoPendaftaran] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    noPendaftaran: string;
    namaLengkap: string;
    status: string;
  } | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noPendaftaran.trim()) return;

    setIsLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await checkStatus(noPendaftaran);
      if (response.status === 'success') {
        setResult(response.data);
      } else {
        setError(response.message || 'Data tidak ditemukan');
      }
    } catch (err) {
      setError('Terjadi kesalahan saat menghubungi server');
    } finally {
      setIsLoading(false);
    }
  };

  const printBuktiLulus = (data: any) => {
    if (!data) return;
    
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BUKTI KELULUSAN PPDB', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Tahun Ajaran ${new Date().getFullYear()}/${new Date().getFullYear() + 1}`, 105, 28, { align: 'center' });
    
    doc.line(20, 35, 190, 35);
    
    // Content
    doc.setFontSize(11);
    doc.text('Berdasarkan hasil seleksi Penerimaan Peserta Didik Baru (PPDB),', 20, 45);
    doc.text('menyatakan bahwa:', 20, 52);
    
    const startY = 65;
    const lineSpacing = 8;
    
    doc.setFont('helvetica', 'bold');
    doc.text('No. Pendaftaran', 30, startY);
    doc.text(':', 70, startY);
    doc.text(data.noPendaftaran || '-', 75, startY);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Nama Lengkap', 30, startY + lineSpacing);
    doc.text(':', 70, startY + lineSpacing);
    doc.text(data.namaLengkap || '-', 75, startY + lineSpacing);
    
    doc.text('Status', 30, startY + lineSpacing * 2);
    doc.text(':', 70, startY + lineSpacing * 2);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 128, 0); // Green
    doc.text('LULUS', 75, startY + lineSpacing * 2);
    doc.setTextColor(0, 0, 0); // Reset to black
    
    // Requirements
    doc.setFont('helvetica', 'normal');
    doc.text('Diharapkan segera melakukan daftar ulang dengan membawa persyaratan berikut:', 20, startY + lineSpacing * 4);
    
    const reqY = startY + lineSpacing * 5;
    doc.text('1. Bukti Kelulusan ini (dicetak)', 25, reqY);
    doc.text('2. Fotokopi Akta Kelahiran (2 lembar)', 25, reqY + lineSpacing);
    doc.text('3. Fotokopi Kartu Keluarga (2 lembar)', 25, reqY + lineSpacing * 2);
    doc.text('4. Pas Foto 3x4 (4 lembar)', 25, reqY + lineSpacing * 3);
    doc.text('5. Melakukan pembayaran administrasi awal', 25, reqY + lineSpacing * 4);
    
    // Footer
    const today = new Date();
    const dateStr = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()}`;
    
    doc.text(`Dicetak pada: ${dateStr}`, 20, 280);
    
    doc.save(`Bukti_Kelulusan_${data.noPendaftaran}.pdf`);
  };

  const getStatusDisplay = (status: string, data?: any) => {
    switch (status) {
      case 'Lulus':
        return (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-green-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-green-800 mb-2">Selamat! Anda Lulus</h3>
            <p className="text-green-700 mb-4">Silakan cetak bukti kelulusan dan lakukan daftar ulang.</p>
            
            <div className="bg-white rounded-lg p-4 border border-green-100 text-left mb-4">
              <h4 className="font-semibold text-green-800 mb-2 text-sm">Persyaratan Daftar Ulang:</h4>
              <ul className="list-disc list-inside text-sm text-green-700 space-y-1">
                <li>Membawa Bukti Kelulusan yang dicetak</li>
                <li>Membawa Fotokopi Akta Kelahiran (2 lembar)</li>
                <li>Membawa Fotokopi Kartu Keluarga (2 lembar)</li>
                <li>Membawa Pas Foto 3x4 (4 lembar)</li>
                <li>Melakukan pembayaran administrasi awal</li>
              </ul>
            </div>

            <button
              onClick={() => printBuktiLulus(data)}
              className="inline-flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl font-medium transition-colors shadow-sm"
            >
              <Printer size={20} /> Cetak Bukti Kelulusan
            </button>
          </div>
        );
      case 'Tidak Lulus':
        return (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <XCircle className="text-red-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-red-800 mb-2">Mohon Maaf, Anda Tidak Lulus</h3>
            <p className="text-red-700">Tetap semangat dan jangan menyerah.</p>
          </div>
        );
      default:
        return (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Clock className="text-amber-600" size={32} />
            </div>
            <h3 className="text-2xl font-bold text-amber-800 mb-2">Data Sedang Diproses</h3>
            <p className="text-amber-700">Berkas Anda sedang dalam tahap verifikasi panitia.</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full">
        <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft size={16} className="mr-1" /> Kembali ke Beranda
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-8 text-white text-center">
            <h2 className="text-2xl font-bold mb-2">Cek Status Kelulusan</h2>
            <p className="text-blue-100 text-sm">Masukkan nomor pendaftaran Anda untuk melihat hasil seleksi PPDB.</p>
          </div>

          <div className="p-8">
            <form onSubmit={handleSearch} className="mb-8">
              <label className="block text-sm font-medium text-slate-700 mb-2">Nomor Pendaftaran</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={noPendaftaran}
                  onChange={(e) => setNoPendaftaran(e.target.value)}
                  className="flex-grow px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Contoh: PPDB-2024-001"
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 flex items-center justify-center"
                >
                  {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                </button>
              </div>
            </form>

            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-4 rounded-xl text-sm text-center border border-red-100">
                {error}
              </motion.div>
            )}

            {result && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="block text-slate-500 mb-1">No. Pendaftaran</span>
                      <span className="font-semibold text-slate-900">{result.noPendaftaran}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 mb-1">Nama Lengkap</span>
                      <span className="font-semibold text-slate-900">{result.namaLengkap}</span>
                    </div>
                  </div>
                </div>
                
                {getStatusDisplay(result.status, result)}
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
