import { Calendar, Clock, Phone, AlertCircle, Music, XCircle, Search, History, CheckCircle, Ban } from "lucide-react";
import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function HistoryPage() {
  const [whatsapp, setWhatsapp] = useState("");
  const [activeBookings, setActiveBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);

  const handleSearch = async () => {
    if (!whatsapp.trim()) {
      setError("Masukkan nomor WhatsApp terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setSearched(true);
    setActiveBookings([]);
    setCancelledBookings([]);

    try {
      // 1. Ambil booking aktif (pending & booked)
      const { data: activeData, error: activeError } = await supabase
        .from("bookings")
        .select("id, nama, whatsapp, tanggal, jam, status, created_at, room_id, durasi_sewa")
        .eq("whatsapp", whatsapp.trim())
        .order("tanggal", { ascending: false });

      if (activeError) throw activeError;
      setActiveBookings(activeData || []);

      // 2. Ambil riwayat dibatalkan
      const { data: cancelledData, error: cancelledError } = await supabase
        .from("cancelled_bookings")
        .select("id, nama, whatsapp, tanggal, jam, created_at, room_id, cancelled_at")
        .eq("whatsapp", whatsapp.trim())
        .order("cancelled_at", { ascending: false });

      if (cancelledError) throw cancelledError;
      setCancelledBookings(cancelledData || []);

      // Jika tidak ada data sama sekali
      if ((activeData || []).length === 0 && (cancelledData || []).length === 0) {
        setError("Tidak ada riwayat booking untuk nomor WhatsApp ini.");
      }
    } catch (err) {
      console.error(err);
      setError("Gagal memuat riwayat. Pastikan nomor WhatsApp benar.");
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk kembali ke beranda dengan window.location
  const handleBackToHome = () => {
    window.location.href = "/";
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "booked":
        return (
          <div className="relative">
            <span className="px-4 py-2 bg-gradient-to-r from-green-900/70 to-green-800/50 text-green-300 border border-green-600 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-sm shadow-lg shadow-green-900/30">
              <CheckCircle size={14} />
              Dikonfirmasi
            </span>
            <div className="absolute -inset-1 bg-green-500/10 blur-sm rounded-full"></div>
          </div>
        );
      case "pending":
        return (
          <div className="relative">
            <span className="px-4 py-2 bg-gradient-to-r from-amber-900/70 to-amber-800/50 text-amber-300 border border-amber-600 rounded-full text-xs font-bold flex items-center gap-2 backdrop-blur-sm shadow-lg shadow-amber-900/30 animate-pulse">
              <Clock size={14} />
              Menunggu DP
            </span>
            <div className="absolute -inset-1 bg-amber-500/10 blur-sm rounded-full animate-pulse"></div>
          </div>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white flex flex-col overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-600/5 to-red-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/5 to-purple-400/5 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-blue-600/5 to-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header dengan efek gradient */}
      <header className="relative py-10 text-center border-b border-zinc-800/50 backdrop-blur-sm bg-gradient-to-b from-black/80 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-transparent to-purple-600/10 opacity-50"></div>
        <div className="relative">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-red-600 to-purple-600 rounded-xl flex items-center justify-center shadow-xl shadow-red-600/30">
              <Music size={28} className="text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-wider bg-gradient-to-r from-white via-red-100 to-white bg-clip-text text-transparent">
              Stoni Music Store
            </h1>
          </div>
          <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-gradient-to-r from-red-900/30 to-purple-900/30 border border-red-800/50 backdrop-blur-sm">
            <History size={18} className="text-red-400" />
            <p className="text-sm uppercase tracking-[0.3em] opacity-80">Riwayat Booking Studio</p>
          </div>
        </div>
      </header>

      <main className="relative flex-grow flex items-start justify-center px-4 sm:px-6 py-12">
        <div className="max-w-4xl w-full">
          {/* Card Utama dengan efek glassmorphism */}
          <div className="relative bg-gradient-to-br from-zinc-900/80 to-black/90 rounded-3xl shadow-2xl p-6 md:p-10 border border-zinc-800/70 backdrop-blur-xl">
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 via-transparent to-purple-600/20 rounded-3xl blur-lg opacity-30"></div>
            
            {/* Header Card */}
            <div className="relative mb-10">
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-1 w-12 bg-gradient-to-r from-red-600 to-transparent rounded-full"></div>
                <h2 className="text-2xl md:text-3xl font-bold text-center uppercase tracking-tight italic bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  Cek Riwayat Booking Kamu
                </h2>
                <div className="h-1 w-12 bg-gradient-to-r from-transparent to-purple-600 rounded-full"></div>
              </div>
              <p className="text-center text-zinc-400 max-w-2xl mx-auto text-sm">
                Masukkan nomor WhatsApp yang digunakan saat booking untuk melihat status dan riwayat pemesanan studio
              </p>
            </div>

            {/* Input WhatsApp dengan styling premium */}
            <div className="relative mb-12">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-xl blur opacity-50"></div>
              <div className="relative bg-gradient-to-br from-zinc-900 to-black rounded-xl p-1">
                <label className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest mb-4 opacity-80">
                  <div className="p-2 bg-gradient-to-br from-red-700/30 to-red-900/30 rounded-lg">
                    <Phone size={18} className="text-red-400" />
                  </div>
                  Nomor WhatsApp yang Dipakai Saat Booking
                </label>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                      className="w-full px-5 py-4 bg-zinc-900/50 border border-zinc-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition text-lg placeholder:text-zinc-500 backdrop-blur-sm"
                      placeholder="6281234567890"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={loading}
                    className="group relative px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-zinc-800 disabled:to-zinc-900 rounded-xl font-black uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 disabled:shadow-none disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    {loading ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>Mencari...</span>
                      </>
                    ) : (
                      <>
                        <Search size={20} />
                        <span>Cari Riwayat</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Error Message dengan efek */}
            {error && (
              <div className="relative mb-10">
                <div className="absolute -inset-1 bg-gradient-to-r from-red-600/20 to-red-900/10 rounded-xl blur"></div>
                <div className="relative p-5 bg-gradient-to-r from-red-900/40 to-red-800/20 border border-red-700/50 rounded-xl flex items-center gap-4 backdrop-blur-sm">
                  <div className="p-2 bg-red-900/50 rounded-lg">
                    <AlertCircle size={24} className="text-red-300" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium text-red-100">{error}</span>
                    <p className="text-sm text-red-300/70 mt-1">Pastikan nomor yang dimasukkan sesuai dengan saat booking</p>
                  </div>
                </div>
              </div>
            )}

            {/* Hasil Pencarian */}
            {searched && !error && (
              <div className="space-y-12">
                {/* Booking Aktif */}
                {activeBookings.length > 0 && (
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-10 w-10 bg-gradient-to-br from-green-700/30 to-green-900/30 rounded-xl flex items-center justify-center">
                        <CheckCircle size={22} className="text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold uppercase tracking-wider text-green-400">
                          Booking Aktif
                        </h3>
                        <p className="text-sm text-zinc-400">{activeBookings.length} booking ditemukan</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {activeBookings.map((b) => {
                        const durasi = b.durasi_sewa || 2;
                        return (
                          <div
                            key={b.id}
                            className="group relative bg-gradient-to-br from-zinc-900/60 to-zinc-800/40 border border-zinc-700/50 rounded-2xl p-6 space-y-5 hover:border-green-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-green-900/20"
                          >
                            {/* Background glow on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-900/0 via-green-900/0 to-green-900/0 group-hover:from-green-900/10 group-hover:via-green-900/5 group-hover:to-green-900/10 rounded-2xl transition-all duration-500"></div>
                            
                            <div className="relative">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <p className="font-black text-2xl text-white mb-1">{b.nama}</p>
                                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-zinc-800/50 to-zinc-900/30 rounded-lg border border-zinc-700/50">
                                    <span className="text-lg font-bold text-red-400">Studio Wangsa</span>
                                    <span className="text-zinc-300">• Room {b.room_id}</span>
                                  </div>
                                </div>
                                {getStatusBadge(b.status)}
                              </div>

                              <div className="grid grid-cols-1 gap-3 text-sm mb-4">
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-zinc-900/50 to-zinc-800/30 rounded-lg border border-zinc-700/30">
                                  <Calendar size={18} className="text-red-400" />
                                  <span className="font-medium">{formatDate(b.tanggal)}</span>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-zinc-900/50 to-zinc-800/30 rounded-lg border border-zinc-700/30">
                                  <Clock size={18} className="text-red-400" />
                                  <span className="font-medium">{b.jam} WIB • {durasi} jam</span>
                                </div>
                              </div>

                              <div className="pt-4 border-t border-zinc-700/30">
                                <p className="text-xs opacity-70">
                                  Dibuat pada: <span className="opacity-90">{formatDate(b.created_at)} pukul {formatTime(b.created_at)}</span>
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Riwayat Dibatalkan */}
                {cancelledBookings.length > 0 && (
                  <div className="relative">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="h-10 w-10 bg-gradient-to-br from-red-700/30 to-red-900/30 rounded-xl flex items-center justify-center">
                        <Ban size={22} className="text-red-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold uppercase tracking-wider text-red-400">
                          Riwayat Dibatalkan
                        </h3>
                        <p className="text-sm text-zinc-400">{cancelledBookings.length} booking dibatalkan</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6">
                      {cancelledBookings.map((c) => (
                        <div
                          key={c.id}
                          className="group relative bg-gradient-to-br from-red-900/20 to-red-900/10 border border-red-800/30 rounded-2xl p-6 space-y-5 backdrop-blur-sm"
                        >
                          <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/10 to-red-800/5 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className="relative">
                            <div className="flex items-center gap-3 mb-4">
                              <XCircle size={24} className="text-red-500" />
                              <p className="font-black text-xl text-red-300">[DIBATALKAN] {c.nama}</p>
                            </div>
                            
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-lg border border-red-800/50 mb-4">
                              <span className="text-lg font-bold text-red-200">Studio Wangsa</span>
                              <span className="text-red-300">• Room {c.room_id}</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4">
                              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-lg border border-red-800/30">
                                <Calendar size={18} className="text-red-400" />
                                <span className="font-medium text-red-100">{formatDate(c.tanggal)}</span>
                              </div>
                              <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-lg border border-red-800/30">
                                <Clock size={18} className="text-red-400" />
                                <span className="font-medium text-red-100">{c.jam} WIB</span>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-red-800/30">
                              <p className="text-xs opacity-70">
                                Dibatalkan pada: <span className="opacity-90">
                                  {c.cancelled_at ? formatDate(c.cancelled_at) + " pukul " + formatTime(c.cancelled_at) : "Tanggal tidak tersedia"}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Tombol Kembali - SIMPLE VERSION */}
          <div className="mt-10 text-center">
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center gap-3 px-6 py-3 rounded-lg bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 hover:border-red-500 hover:bg-gradient-to-r hover:from-red-900/30 hover:to-zinc-900 transition-all duration-300 text-white font-medium text-sm uppercase tracking-wider cursor-pointer"
            >
              <span className="text-red-400">←</span>
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </main>

      {/* Footer dengan efek glow */}
      <footer className="relative py-8 text-center border-t border-zinc-800/50 backdrop-blur-sm bg-gradient-to-t from-black/90 to-transparent">
        <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-transparent to-purple-600/5 opacity-30"></div>
        <div className="relative">
          <p className="text-xs font-black uppercase tracking-[0.5em] opacity-60 mb-2">Stoni Music Store</p>
          <p className="text-[10px] opacity-40">Premium Recording Studio Experience</p>
        </div>
      </footer>
    </div>
  );
}