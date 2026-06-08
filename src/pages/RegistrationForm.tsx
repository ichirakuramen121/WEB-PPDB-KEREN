import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Upload, 
  AlertCircle, 
  FileText, 
  Image as ImageIcon, 
  Loader2, 
  MapPin, 
  User, 
  Users, 
  UserCheck, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle 
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { submitRegistration, RegistrationData, getScheduledStatus } from '../services/api';
import { useSettings } from '../context/SettingsContext';
import jsPDF from 'jspdf';
import MapPicker from '../components/MapPicker';
import { calculateDistance } from '../utils/distance';

export default function RegistrationForm() {
  const { settings } = useSettings();
  const scheduledStatus = getScheduledStatus(settings);
  const isClosed = scheduledStatus.status === 'Tutup';

  const [deviceRegistered, setDeviceRegistered] = useState(() => {
    return localStorage.getItem('has_registered') === 'true' || document.cookie.includes('has_registered=true');
  });
  const [registeredNo, setRegisteredNo] = useState(() => {
    return localStorage.getItem('registered_no') || '';
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);
  const [formData, setFormData] = useState<RegistrationData>(() => {
    // If the device has registered, we shouldn't cache form data
    if (localStorage.getItem('has_registered') === 'true' || document.cookie.includes('has_registered=true')) {
      return {};
    }
    const cached = localStorage.getItem('registration_form_data');
    return cached ? JSON.parse(cached) : {};
  });
  const [previews, setPreviews] = useState<Record<string, string>>(() => {
    const cached = localStorage.getItem('registration_form_previews');
    return cached ? JSON.parse(cached) : {};
  });
  const [mapLocation, setMapLocation] = useState<{lat: number, lng: number} | null>(() => {
    const cached = localStorage.getItem('registration_form_location');
    return cached ? JSON.parse(cached) : null;
  });
  const [distance, setDistance] = useState<number | null>(() => {
    const cached = localStorage.getItem('registration_form_distance');
    return cached ? JSON.parse(cached) : null;
  });

  // Save to localStorage when state changes
  React.useEffect(() => {
    try {
      localStorage.setItem('registration_form_data', JSON.stringify(formData));
    } catch (e) {
      console.warn('Could not save form data to localStorage, quota exceeded or private mode active.');
    }
  }, [formData]);

  React.useEffect(() => {
    try {
      localStorage.setItem('registration_form_previews', JSON.stringify(previews));
    } catch (e) {
      console.warn('Could not save previews to localStorage, quota exceeded or private mode active.');
    }
  }, [previews]);

  React.useEffect(() => {
    if (mapLocation) {
      localStorage.setItem('registration_form_location', JSON.stringify(mapLocation));
    } else {
      localStorage.removeItem('registration_form_location');
    }
  }, [mapLocation]);

  React.useEffect(() => {
    if (distance !== null) {
      localStorage.setItem('registration_form_distance', JSON.stringify(distance));
    } else {
      localStorage.removeItem('registration_form_distance');
    }
  }, [distance]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const compressImage = (file: File, maxWidth = 800): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', 0.8));
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({
        icon: 'error',
        title: 'File Terlalu Besar',
        text: 'Ukuran maksimal file adalah 2MB',
        confirmButtonColor: '#3b82f6'
      });
      e.target.value = '';
      return;
    }

    try {
      let base64String = '';
      if (file.type.startsWith('image/')) {
        // Compress images to save localStorage space and speed up upload
        base64String = await compressImage(file, 1024);
      } else {
        // For PDFs and other files, convert directly
        base64String = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      }
      
      setFormData(prev => ({ ...prev, [fieldId]: base64String }));
      setPreviews(prev => ({ ...prev, [fieldId]: base64String }));
    } catch (error) {
      console.error("Error processing file", error);
    }
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setMapLocation({ lat, lng });
    setFormData(prev => ({ ...prev, 'Koordinat Lokasi': `${lat}, ${lng}` }));
    
    if (settings?.koordinatSekolah) {
      const [schoolLat, schoolLng] = settings.koordinatSekolah.split(',').map(s => parseFloat(s.trim()));
      if (!isNaN(schoolLat) && !isNaN(schoolLng)) {
        const dist = calculateDistance(lat, lng, schoolLat, schoolLng);
        setDistance(dist);
        setFormData(prev => ({ ...prev, 'Jarak ke Sekolah (km)': dist.toFixed(2) }));
      }
    }
  };

  const printProof = (noPendaftaran: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFillColor(37, 99, 235); // blue-600
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont("helvetica", "bold");
    doc.text("BUKTI PENDAFTARAN SPMB", 105, 20, { align: "center" });
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(settings?.namaSekolah || "SDN Citapen", 105, 30, { align: "center" });

    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    
    let startY = 60;
    const lineHeight = 10;
    
    const formatDate = (dateString: string) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };
    
    doc.setFont("helvetica", "bold");
    doc.text("No. Pendaftaran", 20, startY);
    doc.text(":", 70, startY);
    doc.text(noPendaftaran, 75, startY);
    startY += lineHeight;

    doc.setFont("helvetica", "normal");
    
    settings?.formFields?.forEach(field => {
      if (field.type !== 'file') {
        if (startY > 260) {
          doc.addPage();
          startY = 20;
        }

        doc.text(field.label, 20, startY);
        doc.text(":", 70, startY);
        let value = formData[field.label] || '-';
        if (field.type === 'date') {
          value = formatDate(value);
        }
        
        // Handle long text
        const splitText = doc.splitTextToSize(value, 115);
        
        // check if splitText pushes startY over length, maybe rare to have super long single line though
        if (startY + (lineHeight * splitText.length) > 280) {
           doc.addPage();
           startY = 20;
        }
        
        doc.text(splitText, 75, startY);
        startY += lineHeight * splitText.length;
      }
    });

    // Footer
    if (startY > 270) {
      doc.addPage();
    }
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("Simpan bukti pendaftaran ini untuk mengecek status kelulusan.", 105, 280, { align: "center" });
    
    doc.save(`Bukti_Pendaftaran_${noPendaftaran}.pdf`);
  };

  const getFieldSession = (field: any): number => {
    if (field.session !== undefined) {
      return Number(field.session);
    }
    if (field.type === 'file') {
      return 4;
    }
    const idLower = String(field.id || '').toLowerCase();
    const labelLower = String(field.label || '').toLowerCase();
    
    if (idLower.includes('wali') || labelLower.includes('wali')) {
      return 3;
    }
    if (
      idLower.includes('orang tua') || labelLower.includes('orang tua') ||
      idLower.includes('ortu') || labelLower.includes('ortu') ||
      idLower.includes('bapak') || labelLower.includes('bapak') ||
      idLower.includes('ibu') || labelLower.includes('ibu') ||
      idLower.includes('hp') || labelLower.includes('hp') ||
      idLower.includes('telepon') || labelLower.includes('telepon') ||
      idLower.includes('whatsapp') || labelLower.includes('whatsapp')
    ) {
      return 2;
    }
    return 1;
  };

  const getFieldsForStep = (stepNum: number) => {
    return (settings?.formFields || []).filter(field => getFieldSession(field) === stepNum);
  };

  const handleNextStep = () => {
    // Validate current step fields
    const currentFields = getFieldsForStep(currentStep);
    const missingFields = currentFields.filter(f => f.required && !formData[f.label] && f.type !== 'file');
    
    if (missingFields.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulir Belum Lengkap',
        text: `Mohon lengkapi data wajib: ${missingFields.map(f => f.label).join(', ')}`,
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    // Step 1 extra validation: Map Location
    if (currentStep === 1 && !mapLocation) {
      Swal.fire({
        icon: 'warning',
        title: 'Lokasi Belum Ditandai',
        text: 'Mohon tandai lokasi rumah Anda pada peta terlebih dahulu.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setCurrentStep(prev => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentStep !== 4) {
      handleNextStep();
      return;
    }

    if (!isAgreed) {
      Swal.fire({
        icon: 'warning',
        title: 'Pernyataan Belum Disetujui',
        text: 'Anda harus menyetujui pernyataan kebenaran data sebelum mengirim formulir.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    // Comprehensive final verification of all required fields
    const allFields = settings?.formFields || [];
    const missingRequired = allFields.filter(f => f.required && !formData[f.label]);
    
    if (missingRequired.length > 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Pendaftaran Belum Lengkap',
        text: `Ada beberapa kolom atau berkas wajib yang belum diisi: ${missingRequired.map(f => f.label).join(', ')}`,
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    if (!mapLocation) {
      Swal.fire({
        icon: 'warning',
        title: 'Lokasi Belum Ditandai',
        text: 'Mohon tandai lokasi rumah Anda di peta.',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitRegistration(formData);
      
      if (response.status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Pendaftaran Berhasil!',
          html: `Nomor Pendaftaran Anda:<br><b style="font-size: 1.5rem; color: #2563eb;">${response.noPendaftaran}</b><br><br>Simpan nomor ini untuk mengecek status kelulusan.`,
          confirmButtonColor: '#3b82f6',
          confirmButtonText: 'Unduh Bukti Pendaftaran',
          showCancelButton: true,
          cancelButtonText: 'Tutup',
          allowOutsideClick: false
        }).then((result) => {
          if (result.isConfirmed) {
            printProof(response.noPendaftaran);
          }
          // Limit 1 device per applicant
          localStorage.setItem('has_registered', 'true');
          localStorage.setItem('registered_no', response.noPendaftaran);
          document.cookie = "has_registered=true; max-age=31536000; path=/";

          // Clear localStorage on success
          localStorage.removeItem('registration_form_data');
          localStorage.removeItem('registration_form_previews');
          localStorage.removeItem('registration_form_location');
          localStorage.removeItem('registration_form_distance');
          
          // Reset form
          window.location.href = '/';
        });
      } else {
        throw new Error(response.message || 'Terjadi kesalahan');
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Terjadi kesalahan saat mengirim data. Silakan coba lagi.',
        confirmButtonColor: '#3b82f6'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (deviceRegistered) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 text-center p-8">
          <div className="w-20 h-20 bg-amber-100 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserCheck size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Batas Pendaftaran Perangkat</h2>
          <p className="text-slate-600 mb-6 text-sm leading-relaxed">
            Mohon maaf, perangkat (device) ini sudah digunakan untuk mendaftarkan calon peserta didik. Setiap perangkat dibatasi hanya untuk satu kali pendaftaran guna mencegah duplikasi data pendaftar.
          </p>
          {registeredNo && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6 text-center">
              <span className="text-xs text-slate-500 block mb-1">Nomor Pendaftaran Terakhir dari Perangkat Ini:</span>
              <span className="text-lg font-bold text-blue-600 block">{registeredNo}</span>
            </div>
          )}
          <div className="flex flex-col gap-3">
            <Link
              to="/cek-status"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              Cek Status Kelulusan
            </Link>
            <Link
              to="/"
              className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium transition-colors text-sm"
            >
              Kembali ke Beranda
            </Link>
          </div>
          
          <button
            onClick={() => {
              localStorage.removeItem('has_registered');
              localStorage.removeItem('registered_no');
              document.cookie = "has_registered=; max-age=-99999999; path=/";
              setDeviceRegistered(false);
              setRegisteredNo('');
              Swal.fire({
                icon: 'success',
                title: 'Perangkat Direset',
                text: 'Status pendaftaran perangkat berhasil direset. Anda dapat mengisi formulir kembali.',
                timer: 1500,
                showConfirmButton: false
              });
            }}
            className="mt-8 text-xs text-slate-400 hover:text-slate-600 underline transition-colors"
          >
            Reset Perangkat (Uji Coba)
          </button>
        </div>
      </div>
    );
  }

  if (isClosed) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 text-center p-8">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Pendaftaran Ditutup</h2>
          <p className="text-slate-600 mb-8 font-medium leading-relaxed">
            {scheduledStatus.info}
          </p>
          <Link
            to="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    );
  }

  const renderField = (field: any) => {
    const commonClasses = "w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors";
    
    switch (field.type) {
      case 'textarea':
        return (
          <textarea
            name={field.label}
            required={field.required}
            rows={3}
            value={formData[field.label] || ''}
            onChange={handleChange}
            className={`${commonClasses} resize-none`}
            placeholder={field.label}
          />
        );
      case 'select':
        return (
          <select
            name={field.label}
            required={field.required}
            value={formData[field.label] || ''}
            onChange={handleChange}
            className={`${commonClasses} bg-white`}
          >
            <option value="">Pilih {field.label}</option>
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'file':
        return (
          <div className="relative flex-grow border-2 border-dashed border-slate-300 rounded-xl hover:border-blue-500 transition-colors bg-slate-50 group overflow-hidden h-40">
            <input
              type="file"
              accept="image/jpeg, image/png, application/pdf"
              required={field.required}
              onChange={(e) => handleFileChange(e, field.label)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            {previews[field.label] ? (
              <div className="absolute inset-0">
                {previews[field.label].startsWith('data:image') ? (
                  <img src={previews[field.label]} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center bg-blue-50">
                    <FileText className="w-12 h-12 text-blue-500 mb-2" />
                    <span className="text-sm text-blue-700 font-medium">File Terpilih</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-sm font-medium">Ubah File</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <Upload className="w-8 h-8 text-slate-400 mb-2 group-hover:text-blue-500 transition-colors" />
                <span className="text-sm text-slate-500 group-hover:text-blue-600">Klik atau Drag file</span>
              </div>
            )}
          </div>
        );
      default:
        return (
          <input
            type={field.type}
            name={field.label}
            required={field.required}
            value={formData[field.label] || ''}
            onChange={handleChange}
            className={commonClasses}
            placeholder={field.label}
          />
        );
    }
  };

  const steps = [
    { id: 1, title: 'Data Calon Siswa', desc: 'Siswa', icon: User },
    { id: 2, title: 'Nama Orang Tua', desc: 'Ortu', icon: Users },
    { id: 3, title: 'Nama Wali Siswa', desc: 'Wali', icon: UserCheck },
    { id: 4, title: 'Upload Berkas', desc: 'Berkas', icon: Upload }
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 mb-6"
        >
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-8 text-white text-center">
            <h2 className="text-3xl font-bold mb-1">Formulir Pendaftaran SPMB</h2>
            <p className="text-blue-100 text-sm">Lengkapi data diri calon peserta didik baru per sesi di bawah ini.</p>
          </div>

          {/* Stepper Indicator */}
          <div className="bg-slate-50/80 border-b border-slate-100 py-6 px-4 md:px-8">
            <div className="flex items-center justify-between relative max-w-lg mx-auto">
              
              {/* Connecting line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
              
              {/* Connecting fill line */}
              <div 
                className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step) => {
                const IconComponent = step.icon;
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;

                return (
                  <div key={step.id} className="flex flex-col items-center relative z-10">
                    <button
                      type="button"
                      onClick={() => {
                        // Allow navigation to previously completed steps or next directly adjacent step if current validated
                        if (isCompleted) {
                          setCurrentStep(step.id);
                        } else if (step.id === currentStep + 1) {
                          handleNextStep();
                        }
                      }}
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        isCompleted 
                          ? 'bg-blue-600 text-white shadow-md' 
                          : isActive 
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110 shadow-lg' 
                            : 'bg-white text-slate-400 border-2 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {isCompleted ? <CheckCircle size={18} className="text-white" /> : <IconComponent size={18} />}
                    </button>
                    <span className={`text-[11px] font-bold mt-2 transition-colors duration-300 ${isActive ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Step 1: Data Calon Siswa */}
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-6 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                    Data Calon Siswa
                  </h3>
                </div>
                
                {getFieldsForStep(1).length === 0 ? (
                  <p className="text-sm text-slate-500 italic">Tidak ada kolom data calon siswa diatur sekolah.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getFieldsForStep(1).map(field => (
                      <div key={field.id} className={field.type === 'textarea' ? 'col-span-1 md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {field.label} {field.required && '*'}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                )}

                {/* MapPicker stays in Step 1 (Locational analysis for Calon Siswa address) */}
                <div className="border-t pt-6 mt-6">
                  <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" />
                    Tandai Lokasi Rumah di Peta *
                  </label>
                  <p className="text-xs text-slate-500 mb-3">
                    Klik pada peta di bawah untuk menandai koordinat rumah Anda. Perhitungan jarak zonasi ke sekolah dilakukan otomatis.
                  </p>
                  <MapPicker onLocationSelect={handleLocationSelect} initialLocation={mapLocation || undefined} />
                  
                  {distance !== null && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-slate-700 font-medium">Perhitungan Jarak ke Sekolah:</span>
                      <span className="font-extrabold text-blue-700 bg-blue-100 px-3 py-1 rounded-full text-sm">{distance.toFixed(2)} km</span>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Step 2: Kontak & Orang Tua */}
            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-6 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                    Data Orang Tua Kandung
                  </h3>
                </div>

                {getFieldsForStep(2).length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <p className="text-sm text-slate-500 italic">Sesi ini tidak memiliki kolom khusus. Anda dapat langsung melanjutkan ke sesi berikutnya.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getFieldsForStep(2).map(field => (
                      <div key={field.id} className={field.type === 'textarea' ? 'col-span-1 md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {field.label} {field.required && '*'}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 3: Wali Siswa */}
            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-4 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                    Data Wali Siswa
                  </h3>
                  <p className="text-xs text-slate-500 mb-6 bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed">
                    Catatan: Sesi ini dapat diisi jika siswa diasuh oleh Wali/kerabat selain Orang Tua kandung. Kosongkan / lewati apabila tidak memiliki wali siswa khusus.
                  </p>
                </div>

                {getFieldsForStep(3).length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <p className="text-sm text-slate-500 italic">Sesi ini tidak memiliki kolom khusus. Anda dapat langsung melanjutkan ke sesi berikutnya.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {getFieldsForStep(3).map(field => (
                      <div key={field.id} className={field.type === 'textarea' ? 'col-span-1 md:col-span-2' : ''}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          {field.label} {field.required && '*'}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Step 4: Berkas & Upload */}
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-lg font-bold text-slate-900 border-b pb-2 mb-6 flex items-center gap-2">
                    <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                    Upload Berkas Syarat
                  </h3>
                  <p className="text-sm text-slate-500 mb-6 flex items-center gap-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                    <AlertCircle size={16} className="text-blue-500 shrink-0" />
                    Format file: JPG, PNG atau PDF. Ukuran maksimal: 2MB per file.
                  </p>
                </div>

                {getFieldsForStep(4).length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center">
                    <p className="text-sm text-slate-500 italic">Sesi ini tidak memiliki kolom unggah berkas khusus. Anda dapat langsung melanjutkan untuk kirim.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFieldsForStep(4).map(field => (
                      <div key={field.id} className="flex flex-col">
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          {field.label} {field.required && '*'}
                        </label>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pernyataan Kebenaran Data in Final Step */}
                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-6">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <div className="flex-shrink-0 mt-1">
                      <input
                        type="checkbox"
                        checked={isAgreed}
                        onChange={(e) => setIsAgreed(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                      />
                    </div>
                    <div className="text-sm text-slate-700">
                      <span className="font-semibold block mb-1">Pernyataan Kebenaran Data</span>
                      Saya menyatakan bahwa data yang saya isikan dalam formulir pendaftaran ini adalah benar dan dapat dipertanggungjawabkan. Apabila di kemudian hari ditemukan data yang tidak sesuai, saya bersedia menerima sanksi sesuai ketentuan yang berlaku.
                    </div>
                  </label>
                </div>
              </motion.div>
            )}

            {/* Step Wizard Action Buttons */}
            <div className="pt-6 border-t border-slate-100 flex justify-between items-center gap-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-all"
                >
                  <ChevronLeft size={18} />
                  Sebelumnya
                </button>
              ) : (
                <div /> // Dummy element to push the next/submit button right
              )}

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-md hover:shadow-lg transition-all"
                >
                  Selanjutnya
                  <ChevronRight size={18} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-70 flex items-center justify-center transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={18} />
                      Mengirim...
                    </>
                  ) : (
                    'Kirim Pendaftaran'
                  )}
                </button>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
