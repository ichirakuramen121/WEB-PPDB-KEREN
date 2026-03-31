// Service to interact with Google Apps Script Backend

// To use the real backend, replace this URL with your deployed Google Apps Script Web App URL
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycby_fg0Hu34NjMtOq5zeF0ZyMvCA41JFnw75RhNQyUKRotkUwIceet8Xu-vZ2ddDaaeh/exec"; 

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'date' | 'file' | 'textarea';
  options?: string[];
  required: boolean;
}

export interface AppSettings {
  namaSekolah: string;
  alamat: string;
  telepon: string;
  email: string;
  deskripsi: string;
  statusPendaftaran: 'Buka' | 'Tutup';
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
  const stored = localStorage.getItem('mockSettings');
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse mock settings from localStorage", e);
    }
  }
  return {
    namaSekolah: "SDN Harapan Bangsa",
    alamat: "Jl. Pendidikan No. 123, Kota Pelajar, Indonesia 12345",
    telepon: "(021) 1234-5678",
    email: "info@sdnharapanbangsa.sch.id",
    deskripsi: "Mencetak generasi penerus bangsa yang cerdas, berakhlak mulia, dan siap menghadapi tantangan masa depan dengan pendidikan berkualitas.",
    statusPendaftaran: "Buka",
    persyaratanDaftarUlang: "1. Membawa Bukti Kelulusan yang dicetak\n2. Membawa Fotokopi Akta Kelahiran (2 lembar)\n3. Membawa Fotokopi Kartu Keluarga (2 lembar)\n4. Membawa Pas Foto 3x4 (4 lembar)\n5. Melakukan pembayaran administrasi awal",
    tanggalDaftarUlang: "2024-07-15",
    tanggalPengumuman: "",
    logoSekolah: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop",
    tahunPendaftaran: new Date().getFullYear().toString(),
    formFields: [
      { id: "Nama Lengkap", label: "Nama Lengkap", type: "text", required: true },
      { id: "NIK", label: "NIK", type: "text", required: true },
      { id: "Tempat Lahir", label: "Tempat Lahir", type: "text", required: true },
      { id: "Tanggal Lahir", label: "Tanggal Lahir", type: "date", required: true },
      { id: "Jenis Kelamin", label: "Jenis Kelamin", type: "select", options: ["Laki-laki", "Perempuan"], required: true },
      { id: "Alamat", label: "Alamat Lengkap", type: "textarea", required: true },
      { id: "Nama Orang Tua", label: "Nama Orang Tua/Wali", type: "text", required: true },
      { id: "No HP", label: "No. WhatsApp Aktif", type: "text", required: true },
      { id: "Foto Siswa", label: "Pas Foto 3x4", type: "file", required: true },
      { id: "Kartu Keluarga", label: "Kartu Keluarga", type: "file", required: true },
      { id: "Akta Kelahiran", label: "Akta Kelahiran", type: "file", required: true }
    ]
  };
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
  return [
    {
      Timestamp: new Date().toISOString(),
      'No Pendaftaran': "PPDB-2024-001",
      'Nama Lengkap': "Budi Santoso",
      'NIK': "1234567890123456",
      'Tempat Lahir': "Jakarta",
      'Tanggal Lahir': "2015-05-10",
      'Jenis Kelamin': "Laki-laki",
      'Alamat': "Jl. Sudirman No. 1",
      'Nama Orang Tua': "Agus Santoso",
      'No HP': "081234567890",
      Status: "Proses"
    }
  ];
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

export const getSettings = async (): Promise<AppSettings> => {
  if (!GAS_WEB_APP_URL) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockSettings };
  }
  try {
    const response = await fetch(`${GAS_WEB_APP_URL}?action=getSettings&t=${Date.now()}`);
    const result = await response.json();
    if (result.status === "success") {
      return {
        ...result.data,
        formFields: typeof result.data.formFields === 'string' ? JSON.parse(result.data.formFields) : result.data.formFields
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
    if (mockSettings.statusPendaftaran === 'Tutup') {
      return { status: "error", message: "Pendaftaran sedang ditutup." };
    }
    const year = mockSettings.tahunPendaftaran || new Date().getFullYear().toString();
    const newEntry: AdminData = {
      ...data,
      Timestamp: new Date().toISOString(),
      'No Pendaftaran': `PPDB-${year}-${String(mockData.length + 1).padStart(3, '0')}`,
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
    if (username === 'admin' && password === 'admin123') {
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
