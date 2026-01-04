import { Calendar, Clock, Loader2, Phone, User, X, AlertCircle, Music, ShoppingCart } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { supabase } from "../lib/supabase";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";

function useCurrentTime() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

export default function BookingPage({ rooms = [], refreshData }) {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const location = useLocation();
  const currentTime = useCurrentTime();

  const roomFromState = location.state?.room;
  const room = roomFromState || rooms.find((r) => r.id === parseInt(roomId));

  const [formData, setFormData] = useState({
    nama: "",
    whatsapp: "",
    tanggal: "",
    jamMulai: "",
    durasi: 2,
  });

  const [settings, setSettings] = useState({ jam_buka: "10:00", jam_tutup: "00:00" });
  const [warning, setWarning] = useState("");
  const [loading, setLoading] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);
  // State untuk alert tengah layar
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  const DURASI_OPTIONS = [2, 3, 4, 5];

  // Fungsi untuk menampilkan alert tengah layar
  const showCenterAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // Fungsi untuk menutup alert
  const closeAlert = () => {
    setShowAlert(false);
  };

  // Fungsi untuk memformat nomor WhatsApp
  const formatWhatsApp = (value) => {
    // Hapus semua karakter non-digit
    const cleaned = value.replace(/\D/g, '');
    
    // Jika kosong, return kosong
    if (cleaned === '') return '';
    
    // Jika dimulai dengan '62', format menjadi '+62'
    if (cleaned.startsWith('62')) {
      return `+${cleaned}`;
    }
    
    // Jika dimulai dengan '0', format menjadi '0'
    if (cleaned.startsWith('0')) {
      return `0${cleaned.substring(1)}`;
    }
    
    // Jika dimulai dengan '+' dan '62', biarkan seperti itu
    if (value.startsWith('+62')) {
      return value;
    }
    
    // Default: tambahkan '0' di depan
    return `0${cleaned}`;
  };

  // Fungsi untuk validasi nomor WhatsApp
  const validateWhatsApp = (value) => {
    if (!value) return "⚠️ Mohon isi nomor WhatsApp";
    
    const cleaned = value.replace(/\D/g, '');
    
    // Cek jika dimulai dengan 0 atau 62
    if (cleaned.startsWith('0')) {
      // Validasi panjang nomor Indonesia (10-13 digit setelah 0)
      const lengthAfterZero = cleaned.length - 1;
      if (lengthAfterZero < 9 || lengthAfterZero > 12) {
        return "❌ Nomor WhatsApp tidak valid. Contoh: 081234567890";
      }
      return null; // Valid
    }
    
    if (cleaned.startsWith('62')) {
      // Validasi panjang nomor Indonesia dengan kode negara (10-13 digit setelah 62)
      const lengthAfterCountry = cleaned.length - 2;
      if (lengthAfterCountry < 9 || lengthAfterCountry > 12) {
        return "❌ Nomor WhatsApp tidak valid. Contoh: +6281234567890";
      }
      return null; // Valid
    }
    
    if (value.startsWith('+62')) {
      return null; // Valid
    }
    
    return "❌ Nomor WhatsApp harus diawali dengan 0 atau +62";
  };

  // Logic useEffects dan Handler (Tetap sama)
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("studio_settings").select("jam_buka, jam_tutup").single();
      if (data) setSettings({ jam_buka: data.jam_buka || "10:00", jam_tutup: data.jam_tutup || "00:00" });
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    if (!formData.tanggal) { setBookedSlots([]); return; }
    const fetchBooked = async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from("bookings").select("jam, durasi_sewa").eq("tanggal", formData.tanggal).eq("room_id", room?.id).in("status", ["pending", "booked"]);
        const parsed = (data || []).map((b) => ({ jamMulai: b.jam.split(" - ")[0].trim(), durasi: b.durasi_sewa || 2 }));
        setBookedSlots(parsed);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchBooked();
  }, [formData.tanggal, room?.id]);

  const isSlotConflicting = (jamMulai, durasi) => {
    const start = parseInt(jamMulai.split(":")[0]);
    const end = start + durasi;
    return bookedSlots.some((b) => {
      const bStart = parseInt(b.jamMulai.split(":")[0]);
      const bEnd = bStart + b.durasi;
      return start < bEnd && end > bStart;
    });
  };

  const availableStarts = useMemo(() => {
    const buka = parseInt(settings.jam_buka.split(":")[0]);
    const tutup = settings.jam_tutup === "00:00" ? 24 : parseInt(settings.jam_tutup.split(":")[0]);
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const jams = [];
    for (let h = buka; h <= tutup - formData.durasi; h++) {
      const jamStr = `${h.toString().padStart(2, "0")}:00`;
      if (formData.tanggal === todayStr) {
        const target = new Date(today);
        target.setHours(h, 0, 0, 0);
        if (currentTime.getTime() >= target.getTime()) continue;
      }
      if (!isSlotConflicting(jamStr, formData.durasi)) jams.push(jamStr);
    }
    return jams;
  }, [settings, formData.durasi, formData.tanggal, bookedSlots, currentTime]);

  const getDisplayEndTime = (jamMulai, durasi) => {
    const endHour = parseInt(jamMulai.split(":")[0]) + durasi;
    return `${(endHour > 24 ? endHour - 24 : endHour).toString().padStart(2, "0")}:00`;
  };

  const handleSubmit = async () => {
    // Validasi dengan alert tengah layar
    if (!formData.nama) {
      showCenterAlert("⚠️ Mohon isi nama lengkap Anda");
      return;
    }

    // Validasi nomor WhatsApp
    const whatsappError = validateWhatsApp(formData.whatsapp);
    if (whatsappError) {
      showCenterAlert(whatsappError);
      return;
    }

    if (!formData.tanggal) {
      showCenterAlert("⚠️ Mohon pilih tanggal booking");
      return;
    }

    if (!formData.jamMulai) {
      showCenterAlert("⚠️ Mohon pilih jam mulai booking");
      return;
    }

    setLoading(true);
    const jamSelesaiDb = `${(parseInt(formData.jamMulai.split(":")[0]) + formData.durasi).toString().padStart(2, "0")}:00`;
    
    // Format nomor WhatsApp untuk disimpan ke database
    let formattedWhatsapp = formData.whatsapp;
    const cleaned = formData.whatsapp.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      // Ubah 0 menjadi 62 untuk format internasional
      formattedWhatsapp = `62${cleaned.substring(1)}`;
    } else if (cleaned.startsWith('62')) {
      formattedWhatsapp = cleaned;
    }
    
    try {
      const { error } = await supabase.from("bookings").insert({
        nama: formData.nama.trim(), 
        whatsapp: formattedWhatsapp, 
        tanggal: formData.tanggal,
        jam: `${formData.jamMulai} - ${jamSelesaiDb}`, 
        status: "pending", 
        room_id: room.id, 
        durasi_sewa: formData.durasi,
      });
      if (error) throw error;
      
      // Format untuk WhatsApp API
      const whatsappForAPI = formattedWhatsapp.startsWith('62') ? 
        formattedWhatsapp : `62${formattedWhatsapp.substring(1)}`;
      
      window.open(`https://wa.me/${whatsappForAPI}?text=${encodeURIComponent(`*BOOKING BARU*\nStudio: *${room.name}*\nNama: ${formData.nama}\nTanggal: ${formData.tanggal}\nJam: ${formData.jamMulai} - ${getDisplayEndTime(formData.jamMulai, formData.durasi)}`)}`, "_blank");
      
      if (refreshData) refreshData();
      navigate("/");
    } catch (err) { 
      showCenterAlert("❌ Gagal melakukan booking. Coba lagi."); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleWhatsappChange = (e) => {
    const formattedValue = formatWhatsApp(e.target.value);
    setFormData({ ...formData, whatsapp: formattedValue });
  };

  if (!room) return <div className="min-h-screen bg-black flex items-center justify-center text-white font-black uppercase tracking-widest">Studio Not Found</div>;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* ALERT TENGAH LAYAR */}
      {showAlert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={closeAlert}
          />
          
          <div className="relative z-[111] w-full max-w-md animate-in slide-in-from-bottom duration-300">
            <div className="mx-auto max-w-sm">
              <div className="relative bg-gradient-to-br from-red-900/90 to-red-800/80 border border-red-700/50 rounded-2xl p-6 text-center shadow-2xl shadow-red-900/30 backdrop-blur-xl">
                {/* Tombol Close di pojok kanan atas */}
                <button
                  onClick={closeAlert}
                  className="absolute top-3 right-3 p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                  aria-label="Tutup alert"
                >
                  <X size={18} />
                </button>

                {/* Icon Alert di tengah atas */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="p-3 bg-gradient-to-br from-red-600 to-red-500 rounded-full border border-red-400">
                    <AlertCircle size={24} className="text-white" />
                  </div>
                </div>
                
                <div className="pt-8">
                  <h3 className="text-xl font-bold text-white mb-3">
                    {alertMessage.includes("❌") ? "Validasi Gagal" : "Data Belum Lengkap"}
                  </h3>
                  <p className="text-red-100 mb-6">{alertMessage}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-red-300/70 mb-6">
                    <Phone size={14} />
                    <span>Format: 0xxxxxxxxxx atau +62xxxxxxxxxx</span>
                  </div>
                  
                  <button
                    onClick={closeAlert}
                    className="w-full py-3 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Oke, Saya Mengerti
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FORM CONTAINER - Dibuat Center */}
      <main className="flex-grow flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl w-full">
          <div className="bg-zinc-900 rounded-2xl shadow-2xl p-8 md:p-12 border border-zinc-800 relative">
            
            {/* Nama Studio Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-red-600 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
              Booking {room.name}
            </div>

            <h2 className="text-3xl font-bold mb-8 text-center uppercase tracking-tighter italic">Form Booking</h2>

            {warning && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center gap-3">
                <AlertCircle size={20} />
                <span>{warning}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Nama */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 opacity-60">
                  <User size={14} /> Nama Lengkap
                </label>
                <input
                  type="text"
                  value={formData.nama}
                  onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 transition"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              {/* WhatsApp */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 opacity-60">
                  <Phone size={16} /> Nomor WhatsApp
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={handleWhatsappChange}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 transition"
                    placeholder="Contoh: 081234567890"
                  />
                  {formData.whatsapp && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {validateWhatsApp(formData.whatsapp) ? (
                        <AlertCircle size={16} className="text-red-500" />
                      ) : (
                        <Phone size={16} className="text-green-500" />
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-zinc-500">
                  <span className={`px-2 py-1 rounded ${formData.whatsapp.startsWith('0') ? 'bg-green-900/30 text-green-400' : 'bg-zinc-800/50'}`}>
                    0xxxxxxxxxx
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Tanggal */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 opacity-60">
                    <Calendar size={14} /> Tanggal
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={formData.tanggal}
                    onChange={(e) => setFormData({ ...formData, tanggal: e.target.value, jamMulai: "" })}
                    className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-red-500 transition"
                  />
                </div>

                {/* Durasi */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 opacity-60">
                    <Clock size={14} /> Durasi
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {DURASI_OPTIONS.map((d) => (
                      <button
                        key={d}
                        onClick={() => setFormData({ ...formData, durasi: d, jamMulai: "" })}
                        className={`py-3 rounded-lg text-xs font-black transition ${
                          formData.durasi === d ? "bg-red-600 text-white" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"
                        }`}
                      >
                        {d}H
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Jam Mulai */}
              {formData.tanggal && (
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-2 opacity-60">
                    <Clock size={14} /> Jam Mulai
                  </label>
                  {loading ? (
                    <div className="text-center py-4"><Loader2 className="animate-spin mx-auto text-red-500" /></div>
                  ) : availableStarts.length === 0 ? (
                    <p className="text-red-400 text-center text-xs font-bold">Tidak ada slot tersedia.</p>
                  ) : (
                    <div className="grid grid-cols-4 gap-2">
                      {availableStarts.map((jam) => (
                        <button
                          key={jam}
                          onClick={() => setFormData({ ...formData, jamMulai: jam })}
                          className={`py-2 rounded-lg text-xs font-medium transition ${
                            formData.jamMulai === jam ? "bg-red-600 text-white" : "bg-zinc-800 hover:bg-zinc-700"
                          }`}
                        >
                          {jam}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Ringkasan & Submit */}
              <div className="pt-8">
                {formData.jamMulai && (
                  <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 mb-6 text-center">
                    <p className="text-xs uppercase tracking-widest opacity-60 mb-1">Total Sesi</p>
                    <p className="font-black text-red-500 text-lg uppercase italic">
                      {formData.tanggal} | {formData.jamMulai} - {getDisplayEndTime(formData.jamMulai, formData.durasi)}
                    </p>
                  </div>
                )}

                {/* NOMOR REKENING */}
                <div className="mt-0 p-4 bg-zinc-800/70 border border-zinc-700 rounded-lg text-center">
                    <p className="text-xs uppercase tracking-widest opacity-60 mb-2">Pembayaran via Transfer</p>
                    <p className="font-black text-lg text-red-500">BCA 1234567890</p>
                    <p className="text-xs opacity-80 mt-1">a.n. STONI MUSIC STORE</p>
                </div>

                {/* CATATAN PENTING */}
                <div className="mt-6 p-4 bg-zinc-800/50 border border-zinc-600 rounded-lg text-xs">
                    <p className="font-bold uppercase tracking-wider text-red-400 mb-2">Catatan Penting:</p>
                    <p className="opacity-90 leading-relaxed">
                      • Nomor WhatsApp harus diawali dengan <span className="font-bold text-green-400">0</span> atau <span className="font-bold text-green-400">+62</span><br />
                      • Jam yang <span className="text-green-400 font-bold">terlihat dan bisa dipilih</span> berarti studio <span className="font-bold">masih tersedia</span><br />
                      • Jika jam tertentu <span className="text-red-400 font-bold">tidak muncul</span>, artinya <span className="font-bold">sudah dibooking orang lain</span>
                    </p>
                  </div>

                {/* Tombol Submit */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.jamMulai || validateWhatsApp(formData.whatsapp)}
                  className="w-full py-5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg font-black uppercase tracking-widest text-lg transition flex items-center justify-center gap-3 shadow-lg shadow-red-600/30"
                >
                  {loading ? <Loader2 className="animate-spin" size={26} /> : "Booking Sekarang →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer minimalis agar tetap seimbang */}
      <footer className="py-6 text-center opacity-20">
        <p className="text-[10px] font-black uppercase tracking-[0.5em]">Stoni Music Store</p>
      </footer>
    </div>
  );
}