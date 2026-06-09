import React, { useState } from 'react';
import { Mail, Globe, MapPin, Phone, MessageSquare, AlertCircle, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
const underConstructionImg = new URL('../assets/images/maintenance_illustration_1781025042672.png', import.meta.url).href;

export default function MaintenancePage() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [clickCount, setClickCount] = useState(0);

  // Secret admin login handler
  const handleSecretClick = () => {
    // Hidden mechanism: clicking the Copyright symbol redirect directly
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[#EAEFF1] text-[#2C3E50] flex flex-col justify-between font-sans antialiased relative">
      
      {/* Decorative Top Accent Page border line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500"></div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 py-12 flex-grow flex flex-col justify-center items-center text-center">
        
        {/* Header Block */}
        <div className="space-y-2 mt-4">
          <h1 className="text-4xl md:text-5xl font-light tracking-[0.25em] text-[#2C3E50] uppercase">
            UNDER CONSTRUCTION
          </h1>
          <p className="text-xs md:text-sm font-bold tracking-[0.2em] text-[#00BCD4] uppercase">
            WE'LL BE BACK SOON!
          </p>
        </div>

        {/* Central Illustration matching the crane & desk visual */}
        <div className="w-full max-w-xl mx-auto my-8 flex justify-center items-center">
          <img 
            src={underConstructionImg} 
            alt="Sistem SPMB SDN Citapen Sedang Pemeliharaan" 
            className="w-full h-auto object-contain max-h-[300px] select-none mix-blend-multiply drop-shadow-sm transition-transform duration-700 hover:scale-[1.02]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Heartfelt Apology & Explanation */}
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="bg-white/40 border border-slate-300/50 rounded-2xl p-6 md:p-8 backdrop-blur-sm shadow-sm space-y-3">
            <h3 className="font-extrabold text-lg text-slate-800 flex items-center justify-center gap-2">
              <AlertCircle size={20} className="text-[#00BCD4]" />
              Permohonan Maaf Tim SPMB SDN Citapen
            </h3>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-normal">
              {settings?.maintenanceMessage || "Kami memohon maaf yang sebesar-besarnya kepada seluruh calon pendaftar dan wali murid atas ketidaknyamanan ini. Saat ini server sistem pendaftaran online sedang mengalami lonjakan trafik yang luar biasa tinggi (overload). Kami sementara menutup akses formulir umum untuk optimalisasi sirkuit server dan perlindungan basis data pendaftar agar data tidak tumpang tindih atau korup."}
            </p>
            <p className="text-xs text-slate-500 font-medium italic mt-2">
              Tim Teknis SPMB SDN Citapen sedang berupaya maksimal melakukan penataan sistem. Silakan muat ulang halaman ini secara berkala dalam beberapa menit ke depan.
            </p>
          </div>
        </div>

        {/* Action button to quickly check for online/loaded status */}
        <div className="mt-8">
          <button
            onClick={() => window.location.reload()}
            className="inline-flex items-center gap-2 bg-[#2C3E50] hover:bg-slate-800 text-white font-semibold px-6 py-2.5 rounded-full text-xs tracking-wider transition-all shadow-md active:scale-95 uppercase"
          >
            <RefreshCw size={14} className="animate-spin-slow" style={{ animationDuration: '6s' }} /> PERIKSA KONEKSI SERVER
          </button>
        </div>

        {/* Social Connection Icons (Minimalist Flat style looking like mockup) */}
        <div className="mt-10 flex justify-center items-center gap-4">
          <a 
            href={`mailto:${settings?.email || 'info@sdncitapen.sch.id'}`}
            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-600 bg-white shadow-xs transition-all"
            title="Hubungi Email"
          >
            <Mail size={14} />
          </a>
          <a 
            href={settings?.alamat ? `https://maps.google.com/?q=${encodeURIComponent(settings.alamat)}` : '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:text-red-500 hover:border-red-500 bg-white shadow-xs transition-all"
            title="Peta Lokasi"
          >
            <MapPin size={14} />
          </a>
          <a 
            href={`tel:${settings?.telepon || '0265331422'}`} 
            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:text-green-600 hover:border-green-600 bg-white shadow-xs transition-all"
            title="Hubungi Sekolah"
          >
            <Phone size={14} />
          </a>
          <a 
            href="/" 
            onClick={(e) => { e.preventDefault(); window.location.reload(); }}
            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-500 hover:text-blue-500 hover:border-blue-500 bg-white shadow-xs transition-all"
            title="Website Resmi"
          >
            <Globe size={14} />
          </a>
        </div>

      </div>

      {/* Footer Area with completely hidden admin login trigger */}
      <footer className="border-t border-slate-300/40 py-6 text-center text-xs text-slate-400 relative z-10 w-full select-none">
        <div className="max-w-2xl mx-auto px-6 flex flex-col sm:flex-row justify-center items-center gap-2">
          <p>
            {/* The copyright sign '©' acts as the hidden button to enter administrative panel */}
            <span 
              onClick={handleSecretClick} 
              className="hover:text-slate-600 cursor-default font-extrabold pr-1 transition-colors select-none"
              title="Sistem Admin"
              style={{ paddingRight: '2px' }}
            >
              ©
            </span>{" "}
            {new Date().getFullYear()} {settings?.namaSekolah || 'SDN Citapen'}. Hak Cipta Dilindungi Tim Panitia SPMB.
          </p>
        </div>
      </footer>

    </div>
  );
}
