import React, { useState, useEffect } from 'react';
import { ServerCrash, RefreshCw, AlertTriangle, Activity, WifiOff, ShieldAlert, Cpu } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export default function MaintenancePage() {
  const { settings } = useSettings();
  const [activeUsers, setActiveUsers] = useState(14852);
  const [serverLoad, setServerLoad] = useState(99.6);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [reconnectMessage, setReconnectMessage] = useState<string | null>(null);

  // Simulate dynamically fluctuating ultra-high traffic metrics
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveUsers(prev => {
        const change = Math.floor(Math.random() * 120) - 50;
        const next = prev + change;
        return next > 14000 ? next : 14001;
      });
      setServerLoad(prev => {
        const change = Number((Math.random() * 0.4 - 0.2).toFixed(2));
        const next = Number((prev + change).toFixed(2));
        return next > 98.5 && next < 100.0 ? next : 99.4;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleReconnect = () => {
    setIsReconnecting(true);
    setReconnectMessage(null);
    
    setTimeout(() => {
      setIsReconnecting(false);
      const counts = reconnectCount + 1;
      setReconnectCount(counts);
      
      const errors = [
        "Server Connection Timed Out. Gateway tidak merespon dalam batas waktu.",
        "Error 503: Layanan tidak tersedia karena antrean pendaftaran melebihi batas maksimal server.",
        "Sistem mendeteksi 14,000+ koneksi dari IP Tasikmalaya dan sekitarnya. Server masih dikunci sementara untuk mencegah kerusakan basis data.",
        "Koneksi gagal. Kapasitas RAM dan Core CPU server saat ini terpakai 100%. Tolong tunggu beberapa menit lagi."
      ];
      setReconnectMessage(errors[Math.floor(Math.random() * errors.length)]);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between font-sans relative overflow-hidden">
      
      {/* Decorative Network Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-25"></div>
      
      {/* Top Warning Ribbon */}
      <div className="bg-amber-500 text-slate-950 px-4 py-2 text-center text-xs sm:text-sm font-semibold tracking-wider flex items-center justify-center gap-2 relative z-10 animate-pulse">
        <ShieldAlert size={16} />
        DILUAR KAPASITAS: ANTRENAN MASUK SPMB PENUH & MEMBLUDAK (MOHON MENUNGGU)
      </div>

      {/* Main Content Area */}
      <div className="max-w-2xl mx-auto px-4 py-12 flex-grow flex flex-col justify-center items-center relative z-10 w-full">
        
        {/* Portal Header Card */}
        <div className="w-full bg-slate-950/70 border border-slate-800/80 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl space-y-6">
          
          {/* Logo & Portal Identity */}
          <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-800 pb-5">
            {settings?.logoSekolah ? (
              <img 
                src={settings.logoSekolah} 
                alt="Logo Sekolah" 
                className="w-16 h-16 object-cover rounded-xl border border-slate-700 bg-slate-800"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-blue-900/30 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xl">
                SPMB
              </div>
            )}
            <div className="text-center sm:text-left">
              <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">SISTEM PENERIMAAN PESERTA DIDIK BARU</span>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">{settings?.namaSekolah || 'SDN CITAPEN'}</h1>
              <p className="text-xs text-slate-500 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <span>Tahun Ajaran {settings?.tahunPendaftaran || '2026'}/{Number(settings?.tahunPendaftaran || '2026') + 1}</span>
              </p>
            </div>
          </div>

          {/* Epic Error Visual */}
          <div className="flex flex-col items-center py-4 space-y-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-red-500/20 blur-lg animate-ping"></div>
              <div className="w-20 h-20 bg-red-950/50 border border-red-500/40 text-red-500 rounded-full flex items-center justify-center relative">
                <ServerCrash size={40} className="animate-bounce" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <div className="text-sm font-mono text-red-400 font-bold tracking-widest">HTTP STATUS CODE 503</div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight">SERVER OVERLOAD / DOWN</h2>
            </div>
          </div>

          {/* User Message Block */}
          <div className="bg-red-950/20 border border-red-900/30 rounded-xl p-5 text-slate-300 text-sm leading-relaxed space-y-3">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="text-red-400 shrink-0 mt-0.5" size={18} />
              <p className="font-medium text-slate-200">
                {settings?.maintenanceMessage || "Maaf, sistem pendaftaran saat ini sedang mengalami overload kapasitas pendaftar (High Server Load). Server sedang diistirahatkan sejenak untuk pemeliharaan rutin dan peningkatan kuota basis data agar data berkas tidak korup."}
              </p>
            </div>
            <div className="text-xs text-slate-400 pl-7 leading-relaxed font-mono">
              Silakan periksa kembali halaman ini beberapa menit lagi secara berkala. Tombol pendaftaran akan muncul otomatis kembali ketika beban pendaftaran di bawah 95%.
            </div>
          </div>

          {/* Live System Diagnostics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            
            {/* Metric 1 */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 font-mono">
                  <Activity size={14} className="text-slate-400 animate-pulse" />
                  USER ONLINE
                </span>
                <span className="bg-emerald-500/15 text-emerald-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">REALTIME</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-black text-rose-500 antialiased animate-pulse">
                  {activeUsers.toLocaleString('id-ID')}
                </span>
                <span className="text-[11px] text-slate-500 font-medium">pendaftar aktif</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full animate-pulse" style={{ width: '92%' }}></div>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-slate-900/80 border border-slate-800/80 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
                <span className="flex items-center gap-1.5 font-mono">
                  <Cpu size={14} className="text-slate-400" />
                  SERVER LOAD
                </span>
                <span className="bg-red-500/15 text-red-400 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded">CRITICAL</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-black text-red-500">
                  {serverLoad}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium">Kapasitas Core CPU</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${serverLoad}%` }}></div>
              </div>
            </div>

          </div>

          {/* Action Buttons & Feedback */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <button
              onClick={handleReconnect}
              disabled={isReconnecting}
              className="w-full py-3.5 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 disabled:from-slate-800 disabled:to-slate-800 text-white rounded-xl font-bold transition-all shadow-xl font-mono text-sm tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-blue-500/25 active:scale-[0.98]"
            >
              <RefreshCw size={16} className={isReconnecting ? "animate-spin" : ""} />
              {isReconnecting ? "MENGHUBUNGKAN KEMBALI KURSOR..." : "MUAT ULANG & COBA LAGI"}
            </button>

            {reconnectMessage && (
              <div className="p-3.5 bg-rose-950/35 border border-rose-800/30 rounded-lg text-rose-300 text-xs text-center font-mono animate-fadeIn leading-relaxed">
                <span className="font-bold block uppercase tracking-wider mb-1">🔌 Kegagalan Sistem Re-koneksi:</span>
                {reconnectMessage}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Footer Area */}
      <footer className="border-t border-slate-800/60 bg-slate-950/40 py-6 text-center text-xs text-slate-500 relative z-10">
        <div className="max-w-2xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p>© {new Date().getFullYear()} {settings?.namaSekolah || 'SDN Citapen'}. Sistem Antrean Overload SPMB Berbasi Cloud Server.</p>
          <a
            href="/admin/login"
            className="text-slate-600 hover:text-slate-400 transition-colors font-mono tracking-wider flex items-center gap-1 border border-slate-800/80 px-2 py-1 rounded"
          >
            PANITIA ADMIN LOGIN
          </a>
        </div>
      </footer>

    </div>
  );
}
