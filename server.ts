import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Support base64 file uploads (KK/Akta can be up to 2MB as base64 string)
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  const DATA_DIR = path.join(process.cwd(), "data");
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const SETTINGS_PATH = path.join(DATA_DIR, "settings.json");
  const REGISTRATIONS_PATH = path.join(DATA_DIR, "registrations.json");

  // Initial default settings matching SDN Citapen
  const defaultSettings = {
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
    faviconSekolah: "",
    tahunPendaftaran: "2026",
    koordinatSekolah: "-7.3259441, 108.2205556",
    tanggalCutoffUsia: "",
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
      { id: "1", icon: "FileDigit", title: "KK (Kartu Keluarga)", description: "Scan KK Asli. Pastikan NIK dan nama calon siswa tercantum dengan benar." },
      { id: "2", icon: "FileBadge", title: "Akta Kelahiran", description: "Scan Akta Kelahiran Asli. Pastikan data nama dan tanggal lahir terbaca dengan jelas." },
      { id: "3", icon: "Home", title: "Surat Keterangan Domisili (Opsional)", description: "Scan Surat Keterangan Domisili Asli bagi siswa yang mendaftar jalur zonasi jika alamat KK berbeda." },
      { id: "4", icon: "School", title: "Ijazah TK/RA (Opsional)", description: "Scan Ijazah atau Surat Keterangan Lulus (SKL) asli dari TK/RA asal." },
      { id: "5", icon: "FileDigit", title: "NISN (Nomor Induk Siswa Nasional)", description: "Bukti cetak lembar NISN resmi pendaftar dari situs Kemendikbud." },
      { id: "6", icon: "Award", title: "Piagam Prestasi (Opsional)", description: "Scan Piagam Penghargaan atau Sertifikat kejuaraan asli jika mendaftar jalur prestasi." },
      { id: "7", icon: "UserCheck", title: "Surat Mutasi Orang Tua (Opsional)", description: "Scan surat keputusan penugasan mutasi perpindahan tugas orang tua asli dari instansi." }
    ],
    panduanAlur: [
      "Siapkan seluruh dokumen persyaratan dalam bentuk file digital (foto/scan).",
      "Klik tombol 'Mulai Pendaftaran' di bawah atau menu 'Pendaftaran' di navigasi.",
      "Isi seluruh kolom formulir dengan data yang valid dan sesuai dengan dokumen asli.",
      "Tandai lokasi rumah pendaftar di peta yang disediakan untuk perhitungan jarak otomatis.",
      "Unggah berkas dokumen persyaratan pada kolom yang disediakan.",
      "Kirim formulir pendaftaran dan cetak atau simpan Nomor Pendaftaran SPMB Anda."
    ],
    googleDriveDaftarUlang: "https://drive.google.com",
    isRapatAktif: true,
    rapatJudul: "Pengumuman Rapat Orang Tua / Wali Calon Siswa Baru",
    rapatTanggal: "Sabtu, 11 Juli 2026",
    rapatWaktu: "08:00 WIB s.d Selesai",
    rapatTempat: "Aula Serbaguna SDN Citapen Tasikmalaya",
    rapatDeskripsi: "Diharapkan kehadiran Bapak/Ibu Orang Tua/Wali Calon Siswa yang telah dinyatakan Diterima/Lulus untuk menghadiri Rapat Koordinasi Awal Tahun Pelajaran menjelang pelaksanaan Kegiatan Belajar Mengajar (KBM). Kehadiran bersifat penting.",
    tanggalPembukaanPendaftaran: "2026-06-29T08:00"
  };

  const loadSettings = async () => {
    if (fs.existsSync(SETTINGS_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
      } catch (e) {
        console.error("Error reading settings.json", e);
      }
    }
    // Write initial settings
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(defaultSettings, null, 2));
    return defaultSettings;
  };

  const saveSettings = async (newSettings: any) => {
    try {
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(newSettings, null, 2));
    } catch (e) {
      console.error("Error saving settings.json", e);
    }
  };

  const loadRegistrations = async () => {
    if (fs.existsSync(REGISTRATIONS_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(REGISTRATIONS_PATH, "utf-8"));
      } catch (e) {
        console.error("Error reading registrations.json", e);
      }
    }
    const initialRegistrations = [
      {
        Timestamp: new Date().toISOString(),
        "No Pendaftaran": "SPMB-2026-001",
        "Nama Lengkap": "Budi Santoso",
        "NIK": "1234567890123456",
        "Tempat Lahir": "Tasikmalaya",
        "Tanggal Lahir": "2019-05-10",
        "Jenis Kelamin": "Laki-laki",
        "Alamat Lengkap": "Jl. Citapen No. 45, Tasikmalaya",
        "Nama Orang Tua": "Agus Santoso",
        "No. WhatsApp Aktif": "081234567890",
        "Jarak ke Sekolah (km)": "0.55",
        Status: "Proses"
      }
    ];
    fs.writeFileSync(REGISTRATIONS_PATH, JSON.stringify(initialRegistrations, null, 2));
    return initialRegistrations;
  };

  const saveRegistrations = async (regs: any[]) => {
    try {
      fs.writeFileSync(REGISTRATIONS_PATH, JSON.stringify(regs, null, 2));
    } catch (e) {
      console.error("Error saving backup registrations.json", e);
    }
  };

  // API - Get Settings
  app.get("/api/settings", async (req, res) => {
    const settings = await loadSettings();
    res.json({ status: "success", data: settings });
  });

  // API - Update Settings
  app.post("/api/settings", async (req, res) => {
    const current = await loadSettings();
    const updated = { ...current, ...req.body };
    await saveSettings(updated);
    res.json({ status: "success", data: updated });
  });

  // API - Get Registrations
  app.get("/api/registrations", async (req, res) => {
    const registrations = await loadRegistrations();
    res.json({ status: "success", data: registrations });
  });

  // API - New Registration
  app.post("/api/registrations", async (req, res) => {
    const settings = await loadSettings();
    const registrations = await loadRegistrations();

    const data = req.body;
    let year = settings.tahunPendaftaran || new Date().getFullYear().toString();

    // Helper to generate a 4-character random alphanumeric string
    const generateRandomCode = (length = 4): string => {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    let noPendaftaran = "";
    let isUnique = false;
    while (!isUnique) {
      const code = generateRandomCode(4);
      noPendaftaran = `SPMB-${year}-${code}`;
      isUnique = !registrations.some((r: any) => r["No Pendaftaran"] === noPendaftaran);
    }

    const newEntry: any = {
      ...data,
      Timestamp: new Date().toISOString(),
      "No Pendaftaran": noPendaftaran,
      Status: "Proses"
    };

    registrations.push(newEntry);
    await saveRegistrations(registrations);

    res.json({ status: "success", noPendaftaran });
  });

  // API - Update Status
  app.post("/api/registrations/status", async (req, res) => {
    const { noPendaftaran, newStatus, alasan } = req.body;
    const registrations = await loadRegistrations();
    const index = registrations.findIndex((r: any) => r["No Pendaftaran"] === noPendaftaran);

    if (index !== -1) {
      registrations[index].Status = newStatus;
      if (alasan !== undefined) {
        registrations[index]["Alasan Penolakan"] = alasan;
      }
      
      await saveRegistrations(registrations);
      return res.json({ status: "success" });
    }

    res.status(404).json({ status: "error", message: "Data tidak ditemukan" });
  });

  // API - Check Status
  app.post("/api/registrations/check", async (req, res) => {
    const { noPendaftaran } = req.body;
    const registrations = await loadRegistrations();
    const student = registrations.find((r: any) => r["No Pendaftaran"] === noPendaftaran);

    if (student) {
      const namaKey = Object.keys(student).find(k => k.toLowerCase().includes("nama")) || "Nama Lengkap";
      return res.json({
        status: "success",
        data: {
          noPendaftaran: student["No Pendaftaran"],
          namaLengkap: student[namaKey] || "Siswa",
          status: student.Status,
          alasanPenolakan: student["Alasan Penolakan"]
        }
      });
    }

    res.json({ status: "error", message: "Data tidak ditemukan" });
  });

  // API - Administrative Login
  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "admin" && password === "ajayhungkul") {
      res.json({ status: "success" });
    } else {
      res.json({ status: "error", message: "Username atau password salah" });
    }
  });

  // API - Download ZIP safely (to prevent browser preview text corruption)
  app.get("/download-zip", (req, res) => {
    const zipPath = path.join(process.cwd(), "website-siap-upload.zip");
    if (fs.existsSync(zipPath)) {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", "attachment; filename=website-siap-upload.zip");
      const filestream = fs.createReadStream(zipPath);
      filestream.pipe(res);
    } else {
      res.status(404).send("File website-siap-upload.zip tidak ditemukan di server. Silakan hubungi AI.");
    }
  });

  // Vite Developer middleware or Production build static file server
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
