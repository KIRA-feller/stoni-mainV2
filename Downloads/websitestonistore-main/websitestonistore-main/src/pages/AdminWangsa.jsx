import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Calendar, Clock, User, Phone, Settings, AlertCircle, CheckCircle, XCircle, BarChart3, Shield, Lock, Trash2, Save, RefreshCw, EyeOff, Eye } from 'lucide-react';

export default function AdminWangsa() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [cancelledBookings, setCancelledBookings] = useState([]);
  const [settings, setSettings] = useState({
    jam_buka: "10:00",
    jam_tutup: "00:00",
    durasi_sewa: 2,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Fungsi untuk Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin-login');
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Proteksi Tambahan: Cek sesi sebelum ambil data
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/admin-login'); 
        return;
      }

      // Ambil booking aktif + durasi_sewa
      const { data: activeData, error: activeError } = await supabase
        .from('bookings')
        .select('id, nama, whatsapp, tanggal, jam, status, created_at, room_id, durasi_sewa')
        .order('created_at', { ascending: false });

      if (activeError) throw activeError;
      setBookings(activeData || []);

      // Ambil riwayat cancelled
      const { data: cancelledData, error: cancelledError } = await supabase
        .from('cancelled_bookings')
        .select('id, nama, whatsapp, tanggal, jam, created_at, room_id, cancelled_at')
        .order('cancelled_at', { ascending: false });

      if (cancelledError && cancelledError.code !== 'PGRST116') throw cancelledError;
      setCancelledBookings(cancelledData || []);

      // Ambil pengaturan jam
      const { data: settingsData, error: settingsError } = await supabase
        .from('studio_settings')
        .select('jam_buka, jam_tutup, durasi_sewa')
        .single();

      if (settingsError && settingsError.code !== 'PGRST116') console.error(settingsError);

      if (settingsData) {
        setSettings({
          jam_buka: settingsData.jam_buka || "10:00",
          jam_tutup: settingsData.jam_tutup || "00:00",
          durasi_sewa: settingsData.durasi_sewa || 2,
        });
      }
    } catch (err) {
      console.error("Error memuat data:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('admin-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => fetchData())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cancelled_bookings' }, () => fetchData())
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [fetchData]);

  const handleConfirm = async (id) => {
    if (!confirm("Yakin ingin mengkonfirmasi & lock jadwal ini?")) return;

    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'booked' } : b));

    const { error } = await supabase
      .from('bookings')
      .update({ status: 'booked' })
      .eq('id', id);

    if (error) {
      alert("Gagal konfirmasi: " + error.message);
      fetchData();
    } else {
      alert("✅ Jadwal berhasil di-lock permanen!");
    }
  };

  const handleCancel = async (id, nama, tanggal, jam) => {
    const konfirmasi = `Yakin ingin MEMBATALKAN booking ini?\n\nNama: ${nama}\nTanggal: ${tanggal}\nJam: ${jam}\n\nSlot akan langsung tersedia lagi untuk customer.\nRiwayat pembatalan akan disimpan permanen di arsip.`;

    if (!confirm(konfirmasi)) return;

    const bookingToCancel = bookings.find(b => b.id === id);

    setBookings(prev => prev.filter(b => b.id !== id));

    const { error: archiveError } = await supabase
      .from('cancelled_bookings')
      .insert({
        nama: bookingToCancel.nama,
        whatsapp: bookingToCancel.whatsapp,
        tanggal: bookingToCancel.tanggal,
        jam: bookingToCancel.jam,
        room_id: bookingToCancel.room_id,
      });

    if (archiveError) {
      alert("Gagal menyimpan riwayat pembatalan: " + archiveError.message);
      fetchData();
      return;
    }

    const { error: deleteError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id);

    if (deleteError) {
      alert("Gagal menghapus booking: " + deleteError.message);
      fetchData();
    } else {
      alert(`❌ Booking "${nama}" berhasil dibatalkan!\nSlot sudah tersedia lagi & riwayat tersimpan di arsip.`);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('studio_settings')
        .upsert({
          id: 1,
          jam_buka: settings.jam_buka,
          jam_tutup: settings.jam_tutup,
          durasi_sewa: parseInt(settings.durasi_sewa),
        });

      if (error) throw error;
      alert("✅ Pengaturan jam berhasil disimpan!");
    } catch (err) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const formatTanggal = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getJamSelesai = (jamMulai, durasi) => {
    const [hour] = jamMulai.split(':').map(Number);
    const selesai = hour + durasi;
    return `${selesai.toString().padStart(2, '0')}:00`;
  };

  // Filter booking berdasarkan search
  const filteredBookings = bookings.filter(b =>
    b.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.whatsapp.includes(searchTerm) ||
    b.tanggal.includes(searchTerm)
  );

  // Hitung booking hari ini
  const today = new Date().toISOString().split('T')[0];
  const todayBookingsCount = bookings.filter(b => b.tanggal === today).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="h-16 w-16 border-4 border-red-600/30 border-t-red-600 rounded-full animate-spin mx-auto mb-6"></div>
            <Shield size={24} className="text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-xl font-medium mt-4">Checking Authorization...</p>
          <p className="text-sm text-zinc-400 mt-2">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black text-white p-4 md:p-8 lg:p-12">
      {/* Animated Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-red-600/5 to-red-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto">
        {/* Header dengan efek glass */}
        <div className="sticky top-4 z-50 mb-10">
          <div className="bg-gradient-to-br from-zinc-900/80 to-black/90 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-3 bg-gradient-to-br from-red-700/30 to-red-900/30 rounded-xl border border-red-800/50">
                    <Shield size={24} className="text-red-400" />
                  </div>
                  <div>
                    <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                      Panel Admin Wangsa Studio
                    </h1>
                    <p className="text-zinc-400 text-sm mt-1 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse"></span>
                      Admin Dashboard - Realtime Monitoring
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowSettings(!showSettings)}
                  className="group px-4 py-2.5 bg-gradient-to-r from-zinc-800/50 to-zinc-900/30 border border-zinc-700/50 rounded-xl hover:border-red-500/50 transition-all duration-300 flex items-center gap-2"
                >
                  <Settings size={18} className="text-zinc-400 group-hover:text-red-400 transition-colors" />
                  <span className="text-sm font-medium">Settings</span>
                </button>
                <button 
                  onClick={handleLogout}
                  className="group px-5 py-2.5 bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-800/50 rounded-xl hover:border-red-600 hover:from-red-800/40 hover:to-red-700/30 transition-all duration-300 flex items-center gap-2"
                >
                  <LogOut size={18} className="text-red-400 group-hover:rotate-180 transition-transform" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* STATISTIK HARI INI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="group relative bg-gradient-to-br from-zinc-900/60 to-black/80 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm hover:border-green-500/30 transition-all duration-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-green-600/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 size={24} className="text-green-500" />
                <div className="text-xs px-3 py-1 bg-green-900/30 border border-green-700/50 rounded-full text-green-400">
                  Active
                </div>
              </div>
              <p className="text-zinc-400 text-sm mb-2">Total Booking Aktif</p>
              <p className="text-4xl md:text-5xl font-black text-white">{bookings.length}</p>
              <div className="h-1 w-16 bg-gradient-to-r from-green-600 to-green-400 rounded-full mt-4"></div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-red-900/20 to-black/80 border border-red-800/30 rounded-2xl p-6 backdrop-blur-sm hover:border-red-500/30 transition-all duration-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-600/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <Calendar size={24} className="text-red-500" />
                <div className="text-xs px-3 py-1 bg-red-900/30 border border-red-700/50 rounded-full text-red-400">
                  Today
                </div>
              </div>
              <p className="text-zinc-400 text-sm mb-2">Booking Hari Ini</p>
              <p className="text-4xl md:text-5xl font-black text-red-400">{todayBookingsCount}</p>
              <div className="h-1 w-16 bg-gradient-to-r from-red-600 to-red-400 rounded-full mt-4"></div>
            </div>
          </div>

          <div className="group relative bg-gradient-to-br from-zinc-900/60 to-black/80 border border-zinc-800/50 rounded-2xl p-6 backdrop-blur-sm hover:border-amber-500/30 transition-all duration-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <EyeOff size={24} className="text-amber-500" />
                <div className="text-xs px-3 py-1 bg-amber-900/30 border border-amber-700/50 rounded-full text-amber-400">
                  Archive
                </div>
              </div>
              <p className="text-zinc-400 text-sm mb-2">Riwayat Dibatalkan</p>
              <p className="text-4xl md:text-5xl font-black text-amber-400">{cancelledBookings.length}</p>
              <div className="h-1 w-16 bg-gradient-to-r from-amber-600 to-amber-400 rounded-full mt-4"></div>
            </div>
          </div>
        </div>

        {/* PENGATURAN JAM (Collapsible) */}
        {showSettings && (
          <div className="relative mb-12 animate-in fade-in duration-300">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/20 to-purple-600/20 rounded-2xl blur opacity-30"></div>
            <div className="relative bg-gradient-to-br from-zinc-900/80 to-black/90 border border-zinc-800/70 rounded-2xl p-6 md:p-8 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-red-700/30 to-red-900/30 rounded-lg">
                    <Settings size={20} className="text-red-400" />
                  </div>
                  Pengaturan Jam Operasional
                </h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="p-2 bg-zinc-800/50 hover:bg-zinc-700/50 rounded-lg border border-zinc-700/50"
                >
                  <XCircle size={18} className="text-zinc-400" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Clock size={16} className="text-red-400" />
                    Jam Buka
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={settings.jam_buka}
                      onChange={(e) => setSettings({ ...settings, jam_buka: e.target.value })}
                      className="w-full bg-gradient-to-r from-zinc-900/80 to-black/80 border border-zinc-700/50 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all backdrop-blur-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Clock size={16} className="text-red-400" />
                    Jam Tutup
                  </label>
                  <div className="relative">
                    <input
                      type="time"
                      value={settings.jam_tutup}
                      onChange={(e) => setSettings({ ...settings, jam_tutup: e.target.value })}
                      className="w-full bg-gradient-to-r from-zinc-900/80 to-black/80 border border-zinc-700/50 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all backdrop-blur-sm"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-zinc-300 flex items-center gap-2">
                    <Calendar size={16} className="text-red-400" />
                    Durasi Minimal Sewa
                  </label>
                  <div className="relative">
                    <select
                      value={settings.durasi_sewa}
                      onChange={(e) => setSettings({ ...settings, durasi_sewa: parseInt(e.target.value) })}
                      className="w-full bg-gradient-to-r from-zinc-900/80 to-black/80 border border-zinc-700/50 rounded-xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all backdrop-blur-sm appearance-none"
                    >
                      <option value="2">2 Jam</option>
                      <option value="3">3 Jam</option>
                      <option value="4">4 Jam</option>
                      <option value="5">5 Jam</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <ChevronDown size={16} className="text-zinc-500" />
                    </div>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleSaveSettings}
                disabled={saving}
                className="group relative px-10 py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-2xl font-bold text-lg shadow-xl shadow-red-600/30 hover:shadow-red-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                <div className="relative z-10 flex items-center justify-center gap-3">
                  {saving ? (
                    <>
                      <RefreshCw size={20} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      <span>Simpan Pengaturan</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </div>
        )}

        {/* BOOKING AKTIF */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-2">
                <div className="p-2 bg-gradient-to-br from-green-700/30 to-green-900/30 rounded-lg">
                  <Calendar size={20} className="text-green-400" />
                </div>
                Booking Aktif
              </h2>
              <p className="text-zinc-400 text-sm">Kelola dan monitor semua booking aktif</p>
            </div>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                <Search size={18} className="text-zinc-500" />
              </div>
              <input
                type="text"
                placeholder="🔍 Cari nama, nomor WA, atau tanggal..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-96 bg-gradient-to-r from-zinc-900/80 to-black/80 border border-zinc-700/50 rounded-xl pl-12 pr-5 py-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all backdrop-blur-sm"
              />
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-gradient-to-br from-zinc-900/30 to-black/50 border border-zinc-800/30 rounded-2xl backdrop-blur-sm">
              <Search size={48} className="text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-500 text-lg">Tidak ada booking yang sesuai dengan pencarian.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((b) => {
                const durasi = b.durasi_sewa || settings.durasi_sewa || 2;

                return (
                  <div
                    key={b.id}
                    className="group relative bg-gradient-to-br from-zinc-900/60 to-black/80 border border-zinc-800/50 rounded-2xl p-6 hover:border-zinc-700/70 transition-all duration-500 backdrop-blur-sm"
                  >
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/5 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    
                    <div className="relative">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                        {/* Left Section */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="font-black text-2xl md:text-3xl text-white mb-2">{b.nama}</p>
                              <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="px-4 py-1.5 bg-gradient-to-r from-zinc-800/50 to-zinc-900/30 border border-zinc-700/50 rounded-lg text-sm font-bold">
                                  Studio ID {b.room_id}
                                </span>
                                <span className="px-4 py-1.5 bg-gradient-to-r from-purple-800/30 to-purple-900/20 border border-purple-700/50 rounded-lg text-sm font-medium flex items-center gap-2">
                                  <Calendar size={14} />
                                  {b.tanggal}
                                </span>
                              </div>
                            </div>
                            
                            {/* Status Badge */}
                            <div className="flex-shrink-0">
                              {b.status === 'pending' ? (
                                <div className="relative">
                                  <span className="px-4 py-2 bg-gradient-to-r from-amber-900/50 to-amber-800/40 text-amber-300 border border-amber-700 rounded-full text-xs font-bold flex items-center gap-2 animate-pulse">
                                    <Clock size={14} />
                                    Menunggu DP
                                  </span>
                                  <div className="absolute -inset-1 bg-amber-500/10 blur-sm rounded-full animate-pulse"></div>
                                </div>
                              ) : (
                                <div className="relative">
                                  <span className="px-4 py-2 bg-gradient-to-r from-green-900/50 to-green-800/40 text-green-300 border border-green-700 rounded-full text-xs font-bold flex items-center gap-2">
                                    <CheckCircle size={14} />
                                    Terkonfirmasi
                                  </span>
                                  <div className="absolute -inset-1 bg-green-500/10 blur-sm rounded-full"></div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-zinc-900/50 to-zinc-800/30 rounded-xl border border-zinc-700/30">
                              <Clock size={18} className="text-red-400" />
                              <div>
                                <p className="text-sm text-zinc-400">Jam Booking</p>
                                <p className="font-bold text-white">{b.jam} WIB ({durasi} jam)</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-zinc-900/50 to-zinc-800/30 rounded-xl border border-zinc-700/30">
                              <Phone size={18} className="text-green-400" />
                              <div>
                                <p className="text-sm text-zinc-400">WhatsApp</p>
                                <a 
                                  href={`https://wa.me/${b.whatsapp}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="font-bold text-green-400 hover:text-green-300 transition-colors"
                                >
                                  {b.whatsapp}
                                </a>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-zinc-900/50 to-zinc-800/30 rounded-xl border border-zinc-700/30">
                              <User size={18} className="text-blue-400" />
                              <div>
                                <p className="text-sm text-zinc-400">Dibuat Pada</p>
                                <p className="font-medium text-white text-sm">{formatTanggal(b.created_at)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
                          {b.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleConfirm(b.id)}
                                className="group relative px-6 py-3 bg-gradient-to-r from-green-700 to-green-600 hover:from-green-600 hover:to-green-500 rounded-xl font-bold text-sm text-white transition-all duration-300 flex items-center justify-center gap-2 min-w-[160px]"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <CheckCircle size={16} />
                                <span>Konfirmasi DP</span>
                              </button>
                              <button
                                onClick={() => handleCancel(b.id, b.nama, b.tanggal, b.jam)}
                                className="group relative px-6 py-3 bg-gradient-to-r from-zinc-800 to-zinc-900 hover:from-red-900 hover:to-red-800 rounded-xl font-bold text-sm text-zinc-300 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 min-w-[160px]"
                              >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                                <XCircle size={16} />
                                <span>Batalkan</span>
                              </button>
                            </>
                          )}
                          {b.status === 'booked' && (
                            <button
                              onClick={() => handleCancel(b.id, b.nama, b.tanggal, b.jam)}
                              className="group relative px-6 py-3 bg-gradient-to-r from-red-900/70 to-red-800/60 hover:from-red-800 hover:to-red-700 rounded-xl font-bold text-sm text-red-300 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 min-w-[160px] border border-red-800/50"
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                              <Trash2 size={16} />
                              <span>Batalkan (Sudah DP)</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIWAYAT PEMBATALAN */}
        {cancelledBookings.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-gradient-to-br from-red-700/30 to-red-900/30 rounded-lg">
                <EyeOff size={20} className="text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-red-400">Riwayat Pembatalan</h2>
              <span className="px-3 py-1 bg-red-900/30 border border-red-800/50 rounded-full text-xs font-bold text-red-400">
                {cancelledBookings.length} entries
              </span>
            </div>
            
            <div className="space-y-6">
              {cancelledBookings.map((c) => (
                <div 
                  key={c.id} 
                  className="group relative bg-gradient-to-br from-red-900/20 to-black/80 border border-red-800/30 rounded-2xl p-6 backdrop-blur-sm hover:border-red-700/50 transition-all duration-300"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600/10 to-transparent rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <XCircle size={20} className="text-red-500" />
                          <p className="font-bold text-xl text-red-300">[DIBATALKAN] {c.nama}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                          <span className="px-3 py-1 bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-800/50 rounded-lg text-sm">
                            Studio ID {c.room_id}
                          </span>
                          <span className="px-3 py-1 bg-gradient-to-r from-red-900/30 to-red-800/20 border border-red-800/50 rounded-lg text-sm">
                            {c.tanggal} • {c.jam} WIB
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-xl border border-red-800/30">
                        <Phone size={18} className="text-red-400" />
                        <div>
                          <p className="text-sm text-red-300/70">WhatsApp</p>
                          <p className="font-medium text-red-200">{c.whatsapp}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-xl border border-red-800/30">
                        <Calendar size={18} className="text-red-400" />
                        <div>
                          <p className="text-sm text-red-300/70">Dibatalkan Pada</p>
                          <p className="font-medium text-red-200 text-sm">
                            {formatTanggal(c.cancelled_at || c.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Tambahkan komponen ChevronDown yang diperlukan
const ChevronDown = ({ size, className }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);