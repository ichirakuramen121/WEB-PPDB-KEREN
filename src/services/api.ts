// Service to interact with Google Apps Script Backend

// To use the real backend, replace this URL with your deployed Google Apps Script Web App URL
const GAS_WEB_APP_URL = ""; 

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'file' | 'textarea';
  options?: string[];
  required: boolean;
  session?: 1 | 2 | 3 | 4;
  _tempKey?: string;
  _rawOptions?: string;
}

export interface PanduanDokumen {
  id: string;
  icon: 'FileDigit' | 'FileBadge' | 'FileImage' | 'FileText';
  title: string;
  description: string;
}

export interface AppSettings {
  namaSekolah: string;
  alamat: string;
  telepon: string;
  email: string;
  deskripsi: string;
  statusPendaftaran: 'Buka' | 'Tutup' | 'Otomatis';
  formFields: FormField[];
  persyaratanDaftarUlang?: string;
  tanggalDaftarUlang?: string;
  tanggalPengumuman?: string;
  logoSekolah?: string;
  kopSurat?: string;
  namaKepalaSekolah?: string;
  tandaTanganKepalaSekolah?: string;
  stempelSekolah?: string;
  tahunPendaftaran?: string;
  nomorSurat?: string;
  tempatSurat?: string;
  tanggalSurat?: string;
  nipKepalaSekolah?: string;
  catatanTambahan?: string;
  gambarHeaderBeranda?: string;
  koordinatSekolah?: string;
  tanggalCutoffUsia?: string;
  sambutanKepalaSekolah?: string;
  fotoKepalaSekolah?: string;
  visiSekolah?: string;
  misiSekolah?: string;
  panduanJudul?: string;
  panduanDeskripsi?: string;
  panduanPeringatan?: string;
  panduanDokumen?: PanduanDokumen[];
  panduanAlur?: string[];
  isMaintenance?: boolean;
  maintenanceMessage?: string;
}

export interface RegistrationData {
  [key: string]: any;
}

export interface AdminData extends RegistrationData {
  Timestamp: string;
  'No Pendaftaran': string;
  Status: 'Proses' | 'Lulus' | 'Tidak Lulus';
  'Alasan Penolakan'?: string;
}

// Mock data for preview if GAS URL is not set
const getInitialMockSettings = (): AppSettings => {
  const defaultSettings: AppSettings = {
    namaSekolah: "SDN Citapen",
    isMaintenance: false,
    maintenanceMessage: "Maaf, server sedang mengalami overload penonton/pendaftar yang sangat tinggi. Sistem SPMB SDN Citapen sementara sedang mengalami maintenance untuk optimalisasi kuota server agar tidak down. Silakan coba kembali beberapa menit lagi secara berkala.",
    alamat: "Jl. Otto Iskandardinata No.12, Citapen, Kec. Tawang, Kota Tasikmalaya, Jawa Barat 46115",
    telepon: "(0265) 331422",
    email: "info@sdncitapen.sch.id",
    deskripsi: "Mencetak generasi penerus bangsa yang cerdas, berakhlak mulia, dan siap menghadapi tantangan masa depan dengan pendidikan berkualitas di SDN Citapen Tasikmalaya.",
    statusPendaftaran: "Otomatis",
    persyaratanDaftarUlang: "1. Membawa Bukti Kelulusan / Kelulusan SPMB (dicetak)\n2. Membawa Dokumen Daftar Ulang Resmi yang diunduh dari website (telah diisi dan ditandatangani)\n3. Fotokopi Kartu Keluarga (2 lembar)\n4. Fotokopi Akta Kelahiran (2 lembar)\n5. Pas Foto Calon Siswa berwarna ukuran 3x4 (4 lembar)\n6. Fotokopi KTP Orang Tua/Wali (masing-masing 2 lembar)\n7. Materai Rp 10.000 (1 lembar) untuk Surat Pernyataan",
    tanggalDaftarUlang: "2026-07-06",
    tanggalPengumuman: "2026-07-03",
    logoSekolah: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop",
    tahunPendaftaran: "2026",
    koordinatSekolah: "-7.3259441, 108.2205556", // Real coordinates of SDN Citapen Tasikmalaya
    tanggalCutoffUsia: "", // Tanggal ditetapkan cutoff usia
    sambutanKepalaSekolah: "Selamat datang di website resmi SPMB SDN Citapen. Kami berkomitmen untuk memberikan pelayanan pendidikan terbaik bagi putra-putri Anda. Mari bergabung bersama kami untuk mencetak generasi penerus bangsa yang cerdas, berakhlak mulia, dan berprestasi.",
    fotoKepalaSekolah: "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=200&auto=format&fit=crop",
    visiSekolah: "Menjadi sekolah dasar unggulan yang menghasilkan lulusan berakhlak mulia, cerdas, terampil, dan berwawasan lingkungan menuju masa depan gemilang.",
    misiSekolah: "1. Menyelenggarakan pembelajaran yang aktif, inovatif, kreatif, efektif, dan menyenangkan (PAIKEM).\n2. Menanamkan nilai-nilai keagamaan dan budi pekerti luhur dalam kehidupan sehari-hari.\n3. Mengembangkan potensi, bakat, dan minat siswa melalui berbagai kegiatan ekstrakurikuler.\n4. Menciptakan lingkungan belajar yang bersih, sehat, rindang, aman, dan kondusif.",
    formFields: [
      { id: "Nama Lengkap", label: "Nama Lengkap", type: "text", required: true, session: 1 },
      { id: "NIK", label: "NIK", type: "text", required: true, session: 1 },
      { id: "Tempat Lahir", label: "Tempat Lahir", type: "text", required: true, session: 1 },
      { id: "Tanggal Lahir", label: "Tanggal Lahir", type: "date", required: true, session: 1 },
      { id: "Jenis Kelamin", label: "Jenis Kelamin", type: "select", options: ["Laki-laki", "Perempuan"], required: true, session: 1 },
      { id: "Alamat", label: "Alamat Lengkap", type: "textarea", required: true, session: 1 },
      { id: "Nama Orang Tua", label: "Nama Orang Tua", type: "text", required: true, session: 2 },
      { id: "No HP", label: "No. WhatsApp Aktif", type: "text", required: true, session: 2 },
      { id: "Nama Wali", label: "Nama Wali Siswa (Opsional)", type: "text", required: false, session: 3 },
      { id: "Foto Siswa", label: "Pas Foto 3x4", type: "file", required: true, session: 4 },
      { id: "Kartu Keluarga", label: "Kartu Keluarga", type: "file", required: true, session: 4 },
      { id: "Akta Kelahiran", label: "Akta Kelahiran", type: "file", required: true, session: 4 }
    ],
    panduanJudul: "Panduan Pendaftaran SPMB",
    panduanDeskripsi: "Persiapkan berkas dokumen pribadi sebelum mulai mengisi formulir pendaftaran SPMB online.",
    panduanPeringatan: "Pastikan semua dokumen di-scan atau difoto dengan jelas dan dapat terbaca. Format file yang disarankan adalah JPG, PNG, atau PDF dengan ukuran maksimal 2MB per file.",
    panduanDokumen: [
      { id: "1", icon: "FileDigit", title: "Kartu Keluarga (KK)", description: "Asli atau fotokopi yang dilegalisir. Pastikan NIK dan nama calon siswa tercantum dengan benar." },
      { id: "2", icon: "FileBadge", title: "Akta Kelahiran", description: "Dokumen asli atau fotokopi legalisir untuk verifikasi usia dan data diri calon siswa." },
      { id: "3", icon: "FileImage", title: "Pas Foto Terbaru", description: "Pas foto berwarna ukuran 3x4 dengan latar belakang merah atau biru." },
      { id: "4", icon: "FileText", title: "Ijazah / SKHUN (Jika Ada)", description: "Surat Keterangan Lulus atau Ijazah dari jenjang pendidikan sebelumnya (TK/PAUD)." }
    ],
    panduanAlur: [
      "Siapkan seluruh dokumen persyaratan dalam bentuk file digital (foto/scan).",
      "Klik tombol 'Mulai Pendaftaran' di bawah atau menu 'Pendaftaran' di navigasi.",
      "Isi seluruh kolom formulir dengan data yang valid dan sesuai dengan dokumen asli.",
      "Tandai lokasi rumah pendaftar di peta yang disediakan untuk perhitungan jarak otomatis.",
      "Unggah berkas dokumen persyaratan pada kolom yang disediakan.",
      "Kirim formulir pendaftaran dan cetak atau simpan Nomor Pendaftaran SPMB Anda."
    ]
  };

  const stored = localStorage.getItem('mockSettings');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      // Force change to SDN Citapen and new schedule dates if it's the old defaults or contains PPDB strings
      if (
        parsed.namaSekolah === "SDN Harapan Bangsa" || 
        !parsed.namaSekolah || 
        parsed.panduanJudul?.includes("PPDB") || 
        !parsed.tanggalDaftarUlang || 
        parsed.tanggalDaftarUlang === "2024-07-15"
      ) {
        localStorage.removeItem('app_settings_cache');
        try {
          localStorage.setItem('mockSettings', JSON.stringify(defaultSettings));
        } catch (inner) {}
        return defaultSettings;
      }
      return { ...defaultSettings, ...parsed }; // Merge default settings with parsed local settings
    } catch (e) {
      console.error("Failed to parse mock settings from localStorage", e);
    }
  }
  return defaultSettings;
};

let mockSettings: AppSettings = getInitialMockSettings();

const saveMockSettings = (settings: AppSettings) => {
  mockSettings = settings;
  try {
    localStorage.setItem('mockSettings', JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save mock settings to localStorage", e);
  }
};

const getInitialMockData = (): AdminData[] => {
  const stored = localStorage.getItem('mockData');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse mock data from localStorage", e);
    }
  }
  const defaultMockData: AdminData[] = [
    {
      Timestamp: new Date().toISOString(),
      'No Pendaftaran': "SPMB-2026-001",
      'Nama Lengkap': "Budi Santoso",
      'NIK': "1234567890123456",
      'Tempat Lahir': "Tasikmalaya",
      'Tanggal Lahir': "2019-05-10",
      'Jenis Kelamin': "Laki-laki",
      'Alamat': "Jl. Citapen No. 45, Tasikmalaya",
      'Nama Orang Tua': "Agus Santoso",
      'No HP': "081234567890",
      'Jarak ke Sekolah (km)': "0.55",
      Status: "Proses"
    }
  ];
  return defaultMockData;
};

let mockData: AdminData[] = getInitialMockData();

const saveMockData = (data: AdminData[]) => {
  mockData = data;
  try {
    localStorage.setItem('mockData', JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save mock data to localStorage", e);
  }
};

export interface ScheduledStatus {
  status: 'Buka' | 'Tutup';
  info: string;
}

export function getScheduledStatus(settings: AppSettings | null, currentDate: Date = new Date()): ScheduledStatus {
  if (!settings) {
    return { status: 'Tutup', info: 'Memuat data...' };
  }

  // If status is set to manual Buka/Tutup, respect it
  if (settings.statusPendaftaran === 'Buka') {
    return { status: 'Buka', info: 'Pendaftaran SPMB sedang dibuka.' };
  }
  if (settings.statusPendaftaran === 'Tutup') {
    return { status: 'Tutup', info: 'Pendaftaran SPMB saat ini ditutup.' };
  }

  // Otherwise, default/automatic schedule: June 29-30, 2026 09.00 - 12.00 WIB
  const t = currentDate.getTime(); // System ISO UTC timestamp
  
  // Define timezone target ISO timestamps
  // June 29, 2026 09:00 WIB is 2026-06-29 02:00:00 UTC
  // June 29, 2026 12:00 WIB is 2026-06-29 05:00:00 UTC
  // June 30, 2026 09:00 WIB is 2026-06-30 02:00:00 UTC
  // June 30, 2026 12:00 WIB is 2026-06-30 05:00:00 UTC
  const msDay1Start = Date.UTC(2026, 5, 29, 2, 0, 0); // 5 = June
  const msDay1End = Date.UTC(2026, 5, 29, 5, 0, 0);
  const msDay2Start = Date.UTC(2026, 5, 30, 2, 0, 0);
  const msDay2End = Date.UTC(2026, 5, 30, 5, 0, 0);

  if (t < msDay1Start) {
    return {
      status: 'Tutup',
      info: 'Pendaftaran belum dibuka. Pendaftaran akan dibuka secara otomatis pada tanggal 29-30 Juni 2026 pukul 09.00 - 12.00 WIB.'
    };
  } else if (t >= msDay1Start && t < msDay1End) {
    return {
      status: 'Buka',
      info: 'Pendaftaran Hari Pertama Sedang Berlangsung (Pukul 09.00 - 12.00 WIB).'
    };
  } else if (t >= msDay1End && t < msDay2Start) {
    return {
      status: 'Tutup',
      info: 'Pendaftaran dibuka esok hari tanggal 30 Juni pukul 09.00-12.00.'
    };
  } else if (t >= msDay2Start && t < msDay2End) {
    return {
      status: 'Buka',
      info: 'Pendaftaran Hari Kedua Sedang Berlangsung (Pukul 09.00 - 12.00 WIB).'
    };
  } else {
    return {
      status: 'Tutup',
      info: 'Maaf pendaftaran sudah ditutup sampai jumpa tahun depan dan tetap semangat.'
    };
  }
}

function safeParseJSON(val: any, fallback: any) {
  if (val === null || val === undefined) return fallback;
  if (typeof val !== 'string') return val;
  try {
    return JSON.parse(val);
  } catch (e) {
    console.error("Failed to parse JSON string:", val, e);
    return fallback;
  }
}

export const getSettings = async (): Promise<AppSettings> => {
  if (!GAS_WEB_APP_URL) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockSettings };
  }
  try {
    const response = await fetch(`${GAS_WEB_APP_URL}?action=getSettings&t=${Date.now()}`);
    const result = await response.json();
    if (result.status === "success") {
      const data = result.data;
      return {
        ...data,
        formFields: safeParseJSON(data.formFields, data.formFields),
        panduanAlur: safeParseJSON(data.panduanAlur, data.panduanAlur),
        panduanDokumen: safeParseJSON(data.panduanDokumen, data.panduanDokumen),
      };
    }
    throw new Error(result.message);
  } catch (error) {
    console.error("Error fetching settings:", error);
    throw error;
  }
};

export const updateSettings = async (settings: Partial<AppSettings>) => {
  if (!GAS_WEB_APP_URL) {
    await new Promise(resolve => setTimeout(resolve, 800));
    saveMockSettings({ ...mockSettings, ...settings });
    return { status: "success" };
  }
  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "updateSettings",
        settings
      }),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
};

export const submitRegistration = async (data: RegistrationData) => {
  if (!GAS_WEB_APP_URL) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const scheduled = getScheduledStatus(mockSettings);
    if (scheduled.status === 'Tutup') {
      return { status: "error", message: scheduled.info };
    }
    let year = mockSettings.tahunPendaftaran || new Date().getFullYear().toString();
    year = year.replace(/\//g, '-');
    const newEntry: AdminData = {
      ...data,
      Timestamp: new Date().toISOString(),
      'No Pendaftaran': `SPMB-${year}-${String(mockData.length + 1).padStart(3, '0')}`,
      Status: 'Proses'
    };
    saveMockData([...mockData, newEntry]);
    return { status: "success", noPendaftaran: newEntry['No Pendaftaran'] };
  }
  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify(data),
      headers: { "Content-Type": "text/plain;charset=utf-8" },
    });
    return await response.json();
  } catch (error) {
    console.error("Error submitting registration:", error);
    throw error;
  }
};

export const getRegistrations = async (): Promise<AdminData[]> => {
  if (!GAS_WEB_APP_URL) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return [...mockData];
  }

  try {
    const response = await fetch(`${GAS_WEB_APP_URL}?t=${Date.now()}`);
    const result = await response.json();
    if (result.status === "success") {
      return result.data;
    }
    throw new Error(result.message);
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error;
  }
};

export const updateStatus = async (noPendaftaran: string, newStatus: string, alasan?: string) => {
  if (!GAS_WEB_APP_URL) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const index = mockData.findIndex(d => d['No Pendaftaran'] === noPendaftaran);
    if (index !== -1) {
      const newData = [...mockData];
      newData[index] = { ...newData[index], Status: newStatus as any };
      if (alasan !== undefined) {
        newData[index]['Alasan Penolakan'] = alasan;
      }
      saveMockData(newData);
      return { status: "success" };
    }
    throw new Error("Data not found");
  }

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "updateStatus",
        noPendaftaran,
        newStatus,
        alasan
      }),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};

export const checkStatus = async (noPendaftaran: string) => {
  if (!GAS_WEB_APP_URL) {
    await new Promise(resolve => setTimeout(resolve, 800));
    const student = mockData.find(d => d['No Pendaftaran'] === noPendaftaran);
    if (student) {
      const namaKey = Object.keys(student).find(k => k.toLowerCase().includes('nama')) || 'Nama Lengkap';
      return { 
        status: "success", 
        data: {
          noPendaftaran: student['No Pendaftaran'],
          namaLengkap: student[namaKey] || 'Siswa',
          status: student.Status,
          alasanPenolakan: student['Alasan Penolakan']
        }
      };
    }
    return { status: "error", message: "Data tidak ditemukan" };
  }

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "checkStatus",
        noPendaftaran
      }),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error checking status:", error);
    throw error;
  }
};

export const loginAdmin = async (username: string, password: string) => {
  if (!GAS_WEB_APP_URL) {
    await new Promise(resolve => setTimeout(resolve, 800));
    if (username === 'admin' && password === 'ajayhungkul') {
      return { status: "success" };
    }
    return { status: "error", message: "Username atau password salah" };
  }

  try {
    const response = await fetch(GAS_WEB_APP_URL, {
      method: "POST",
      body: JSON.stringify({
        action: "login",
        username,
        password
      }),
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
    });
    return await response.json();
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};
