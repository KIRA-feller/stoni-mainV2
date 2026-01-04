import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import AdminWangsa from './pages/AdminWangsa';
import AdminLogin from './pages/AdminLogin';
import { supabase } from "./lib/supabase";
import EquipmentPage from './components/EquipmentPage';
import BookingPage from './pages/BookingPage';
import StudioGallery from './components/StudioGallery';
import HistoryPage from './pages/HistoryPage';

function App() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: roomsData, error: roomsError } = await supabase
        .from('rooms')
        .select('id, name, price, image, description')
        .order('id');

      if (roomsError) throw roomsError;

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select('room_id, tanggal, jam, status')
        .in('status', ['booked', 'pending']);

      if (bookingsError) throw bookingsError;

      const updatedRooms = (roomsData || []).map(room => ({
        ...room,
        price: room.price?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") || "0",
        image: room.image || "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop",
        description: room.description || "Studio serbaguna dengan fasilitas lengkap.",
        bookedSlots: (bookingsData || [])
          .filter(b => Number(b.room_id) === Number(room.id))
          .map(b => ({
            date: b.tanggal,
            time: b.jam,
            status: b.status
          }))
      }));

      setRooms(updatedRooms);
    } catch (err) {
      console.error("Error fetching data:", err);
      
      // Fallback data lebih realistis untuk testing lokal
      setRooms([
        {
          id: 1,
          name: "Studio Utama",
          price: "250.000",
          image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&auto=format&fit=crop",
          description: "Studio serbaguna dengan fasilitas lengkap.",
          bookedSlots: []
        },
        {
          id: 2,
          name: "Ruang Podcast",
          price: "150.000",
          image: "https://images.unsplash.com/photo-1598387841452-7f4ae79e7e3b?w=800&auto=format&fit=crop",
          description: "Ruang khusus podcast dengan akustik premium.",
          bookedSlots: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel('realtime-bookings')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rooms' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const handleBookRoom = (room) => {
    navigate(`/booking/${room.id}`, { state: { room } });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <Routes>
        {/* Halaman Utama */}
        <Route
          path="/"
          element={
            <>
              <Hero />
              {loading ? (
                <div className="flex flex-col items-center justify-center py-40 px-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mb-6"></div>
                  <p className="text-zinc-500 uppercase tracking-widest text-sm font-bold">
                    Loading Spaces...
                  </p>
                </div>
              ) : (
                <StudioGallery rooms={rooms} onBookRoom={handleBookRoom} />
              )}
            </>
          }
        />

        {/* Halaman Booking - Dinamis untuk semua room */}
        <Route
          path="/booking/:roomId"
          element={<BookingPage rooms={rooms} refreshData={fetchData} />}
        />

        {/* Halaman Lain */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/equipment" element={<EquipmentPage />} />
        <Route path="/admin-wangsa-rahasia" element={<AdminWangsa />} />
        <Route path="/history" element={<HistoryPage />} />

        {/* Optional: 404 Route */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">404</h1>
            <p className="text-zinc-400 mb-8">Halaman tidak ditemukan</p>
            <button 
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Kembali ke Beranda
            </button>
          </div>
        } />
      </Routes>
    </div>
  );
}

export default App;