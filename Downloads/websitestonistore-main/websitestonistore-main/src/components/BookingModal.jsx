import { X, Calendar, Clock, User, Phone, AlertCircle, CheckCircle, Lock, Send, DollarSign } from "lucide-react";
import { useState } from "react";

export default function BookingModal({ room, isOpen, onClose }) {
  const [formData, setFormData] = useState({
    nama: "",
    whatsapp: "",
    tanggal: "",
    jam: "",
  });

  // State untuk menyimpan pesan peringatan
  const [warning, setWarning] = useState("");
  // State untuk alert tengah layar
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

  if (!isOpen) return null;

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "20:00", "21:00", "22:00"];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setWarning("");
  };

  const isDateFull = (date) => {
    if (!date || !room.bookedSlots) return false
    const slotsOnDate = room.bookedSlots.filter(s => s.date === date && (s.status === 'booked' || s.status === 'used'))
    return slotsOnDate.length >= timeSlots.length
  }

  const dateStatus = isDateFull(formData.tanggal)
  
  const checkStatus = (date, time) => {
    if (!room.bookedSlots) return null;
    const slot = room.bookedSlots.find((s) => s.date === date && s.time === time);
    return slot ? slot.status : null;
  };
  
  const currentStatus = checkStatus(formData.tanggal, formData.jam);
  const isBlocked = currentStatus === "booked" || currentStatus === "used";

  // Fungsi untuk menampilkan alert tengah layar
  const showCenterAlert = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  // Fungsi untuk menutup alert
  const closeAlert = () => {
    setShowAlert(false);
  };

  const handleWhatsapp = () => {
    // Validasi data
    if (!formData.nama) {
      showCenterAlert("⚠️ Mohon isi nama band/penyanyi");
      return;
    }

    if (!formData.whatsapp) {
      showCenterAlert("⚠️ Mohon isi nomor WhatsApp");
      return;
    }

    if (!formData.tanggal) {
      showCenterAlert("⚠️ Mohon pilih tanggal booking");
      return;
    }

    if (!formData.jam) {
      showCenterAlert("⚠️ Mohon pilih jam booking");
      return;
    }

    if (isBlocked) {
      setWarning("❌ Jadwal ini sudah di-lock oleh admin. Silakan pilih jam/tanggal lain.");
      return;
    }

    const nomorAdmin = "6285886933826";
    const pesan = `*NOTIFIKASI BOOKING & LOCK JADWAL*
------------------------------------
Halo Admin Wangsa Studio, saya ingin konfirmasi DP untuk LOCK jadwal:

*Ruangan:* ${room.name}
*Atas Nama:* ${formData.nama}
*Tanggal:* ${formData.tanggal}
*Jam:* ${formData.jam}
*Status:* 🔒 Menunggu Bukti Transfer`;

    const url = `https://wa.me/${nomorAdmin}?text=${encodeURIComponent(pesan)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* alert tengah layar */}
      {showAlert && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
            onClick={closeAlert}
          />
          
          <div className="relative z-[111] w-full max-w-md animate-in slide-in-from-bottom duration-300">
            <div className="mx-auto max-w-sm">
              <div className="relative bg-gradient-to-br from-red-900/90 to-red-800/80 border border-red-700/50 rounded-2xl p-6 text-center shadow-2xl shadow-red-900/30 backdrop-blur-xl">
                {/* TOMBOL CLOSE DI POJOK KANAN ATAS */}
                <button
                  onClick={closeAlert}
                  className="absolute top-3 right-3 p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-all duration-200"
                  aria-label="Tutup alert"
                >
                  <X size={16} />
                </button>

                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="p-3 bg-gradient-to-br from-red-600 to-red-500 rounded-full border border-red-400">
                    <AlertCircle size={24} className="text-white" />
                  </div>
                </div>
                
                <div className="pt-6">
                  <h3 className="text-xl font-bold text-white mb-3">Data Belum Lengkap</h3>
                  <p className="text-red-100 mb-6">{alertMessage}</p>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-red-300/70 mb-4">
                    <CheckCircle size={14} />
                    <span>Mohon lengkapi semua data terlebih dahulu</span>
                  </div>
                  
                  <button
                    onClick={closeAlert}
                    className="w-full py-3 bg-gradient-to-r from-white/10 to-white/5 border border-white/20 rounded-xl text-white font-medium hover:bg-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Oke, Saya Mengerti
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-gradient-to-b from-zinc-950 to-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-red-600/20 backdrop-blur-sm">
        
        {/* Header dengan Gambar Room */}
        <div className="relative h-32 w-full overflow-hidden">
          <img src={room.image} className="w-full h-full object-cover opacity-40 grayscale" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>
          
          {/* Close Button */}
          <button onClick={onClose} className="absolute top-4 right-4 p-2.5 bg-black/50 hover:bg-red-600 rounded-full text-white transition-all duration-300 border border-white/10 hover:scale-110">
            <X size={20} />
          </button>
          
          {/* Room Info */}
          <div className="absolute bottom-4 left-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-6 bg-gradient-to-r from-red-600 to-red-400 rounded-full"></div>
              <span className="text-xs font-bold uppercase tracking-widest text-red-400">Studio Room</span>
            </div>
            <h2 className="text-2xl font-black text-white drop-shadow-lg">{room.name}</h2>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-6">
          {/* Form Title */}
          <div className="text-center mb-2">
            <h3 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
              Booking Form
            </h3>
            <p className="text-xs text-zinc-400 mt-1">Isi data untuk mengunci jadwal Anda</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Nama Field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <User size={18} className="text-zinc-500" />
              </div>
              <input 
                type="text" 
                name="nama" 
                value={formData.nama}
                onChange={handleChange} 
                placeholder="Nama Band / Penyanyi" 
                className="w-full bg-gradient-to-r from-zinc-900/80 to-black/80 border border-zinc-800/50 p-4 pl-12 rounded-xl text-white outline-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all placeholder:text-zinc-500"
              />
            </div>

            {/* WhatsApp Field */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Phone size={18} className="text-zinc-500" />
              </div>
              <input 
                type="tel" 
                name="whatsapp" 
                value={formData.whatsapp}
                onChange={handleChange} 
                placeholder="Nomor WhatsApp" 
                className="w-full bg-gradient-to-r from-zinc-900/80 to-black/80 border border-zinc-800/50 p-4 pl-12 rounded-xl text-white outline-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all placeholder:text-zinc-500"
              />
            </div>

            {/* Tanggal Field */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={16} className="text-red-500" />
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pilih Tanggal</label>
              </div>
              <div className="relative">
                <input 
                  type="date" 
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleChange} 
                  className="w-full bg-gradient-to-r from-zinc-900/80 to-black/80 border border-zinc-800/50 p-4 rounded-xl text-white outline-none focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all"
                  required
                />
              </div>
              
              {dateStatus && (
                <div className="mt-2 p-3 bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-800/40 rounded-lg flex items-center gap-2 animate-pulse">
                  <AlertCircle size={14} className="text-red-400" />
                  <p className="text-xs text-red-300">
                    Maaf, semua jadwal di tanggal ini sudah penuh
                  </p>
                </div>
              )}
            </div>

            {/* Jam Selection */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-red-500" />
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Pilih Jam</label>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((time) => {
                  const status = checkStatus(formData.tanggal, time);
                  const isLocked = status === "booked";
                  const isUsed = status === "used";
                  const isSelected = formData.jam === time;

                  return (
                    <button
                      key={time}
                      type="button"
                      disabled={isLocked || isUsed}
                      onClick={() => {
                        setFormData({ ...formData, jam: time });
                        setWarning("");
                      }}
                      className={`relative py-3 rounded-xl text-xs font-bold border transition-all duration-300 group overflow-hidden
                        ${isUsed 
                          ? "bg-zinc-900/50 border-zinc-700 text-zinc-600 cursor-not-allowed" 
                          : isLocked 
                            ? "bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-800 text-red-400 cursor-not-allowed" 
                            : isSelected 
                              ? "bg-gradient-to-br from-red-600 to-red-500 border-red-500 text-white shadow-lg shadow-red-600/30" 
                              : "bg-gradient-to-br from-zinc-900/80 to-black/80 border-zinc-800 text-zinc-400 hover:border-red-500 hover:text-white"
                        }`}
                    >
                      {/* Hover Effect */}
                      <div className={`absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ${
                        isLocked || isUsed ? 'hidden' : ''
                      }`}></div>
                      
                      {time}
                      
                      {/* Status Icons */}
                      {isLocked && (
                        <div className="absolute -top-1 -right-1">
                          <Lock size={12} className="text-red-400" />
                        </div>
                      )}
                      {isUsed && (
                        <div className="absolute -top-1 -right-1">
                          <CheckCircle size={12} className="text-zinc-500" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Warning Message */}
            {warning && (
              <div className="animate-in slide-in-from-top duration-300">
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-700/50 rounded-xl">
                  <div className="p-2 bg-red-900/50 rounded-lg">
                    <AlertCircle size={18} className="text-red-300" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-medium text-red-100">{warning}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Info */}
            <div className="p-4 bg-gradient-to-br from-zinc-900/50 to-black/50 border border-zinc-800/50 rounded-2xl text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign size={16} className="text-green-500" />
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Transfer DP ke BCA</p>
              </div>
              <p className="font-mono font-bold text-white text-lg tracking-widest">123-456-7890</p>
              <p className="text-[10px] text-zinc-500 mt-2">*Konfirmasi via WhatsApp setelah transfer</p>
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleWhatsapp} 
              disabled={isBlocked || !formData.jam || !formData.nama || !formData.whatsapp || !formData.tanggal}
              className={`group relative w-full py-4 rounded-2xl font-bold transition-all duration-300 overflow-hidden
                ${isBlocked || !formData.jam || !formData.nama || !formData.whatsapp || !formData.tanggal
                  ? "bg-gradient-to-r from-zinc-800 to-zinc-900 text-zinc-500 cursor-not-allowed border border-zinc-700" 
                  : "bg-gradient-to-r from-red-600 via-red-500 to-red-600 hover:from-red-500 hover:via-red-400 hover:to-red-500 text-white shadow-xl shadow-red-600/30 hover:shadow-red-600/50"
                }`}
            >
              {/* Shimmer Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isBlocked ? (
                  <>
                    <Lock size={18} />
                    <span>Jadwal Sudah Terisi</span>
                  </>
                ) : (
                  <>
                    <Send size={18} className="group-hover:translate-x-1 transition-transform" />
                    <span>Konfirmasi & Lock Jadwal</span>
                  </>
                )}
              </div>
            </button>

            {/* Additional Info */}
            <div className="text-center pt-2">
              <p className="text-[10px] text-zinc-500">
                Anda akan diarahkan ke WhatsApp untuk konfirmasi booking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}