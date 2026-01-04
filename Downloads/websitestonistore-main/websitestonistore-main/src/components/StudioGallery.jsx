import { useState, useCallback } from "react";
import { ChevronRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Data gallery dengan tambahan roomId
const GALLERY_DATA = [
  {
    id: 1,
    name: "Marshall JCM800",
    image: "/public/assets/StudioE.webp",
    roomId: 1,
  },
  {
    id: 2,
    name: "Fender Twin Reverb",
    image: "/public/assets/StudioD.webp",
    roomId: 1,
  },
  {
    id: 3,
    name: "Pearl Export Series",
    image: "/public/assets/studioF.webp",
    roomId: 1,
  },
  {
    id: 4,
    name: "Neumann U87",
    image: "/public/assets/StudioH.webp",
    roomId: 1,
  },
];

export default function EquipmentPage({ rooms = [] }) {
  const [selectedItem, setSelectedItem] = useState(null);
  const navigate = useNavigate();

  const mainRoom = rooms.find((r) => r.id === 1) || rooms[0];

  const handleItemClick = (item) => {
    const room = rooms.find((r) => r.id === item.roomId);
    if (room) {
      navigate(`/booking/${item.roomId}`, { state: { room } });
    } else {
      navigate(`/booking/${item.roomId}`);
    }
    setSelectedItem(null);
  };

  const handleBookNow = () => {
    if (mainRoom) {
      navigate(`/booking/${mainRoom.id}`, { state: { room: mainRoom } });
    } else {
      navigate("/booking/1");
    }
  };

  // Fungsi untuk menutup modal detail
  const closeModal = useCallback(() => {
    setSelectedItem(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white pt-24 pb-20 px-4 sm:px-8 font-sans overflow-hidden">
      
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-red-600/5 to-red-400/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-red-600/3 rounded-full blur-3xl"></div>
      </div>

      {/* MODAL DETAIL */}
      {selectedItem && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Background overlay untuk close */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/90 to-black/95 backdrop-blur-xl cursor-pointer" 
            onClick={closeModal}
          />
          
          <div className="relative w-full max-w-lg bg-gradient-to-b from-zinc-950 to-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-red-600/20 backdrop-blur-sm z-[201]">
            {/* Close Button - SUDAH ADA FUNGSI */}
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 z-[202] p-2.5 bg-black/50 hover:bg-red-600 rounded-lg text-white transition-all duration-300 border border-white/10 hover:scale-110 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              aria-label="Tutup modal"
            >
              <X size={20} />
            </button>

            {/* Image - Ukuran diperkecil */}
            <div className="w-full h-[250px] sm:h-[300px] relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent z-10"></div>
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content */}
            <div className="p-6 bg-gradient-to-t from-zinc-950/90 to-black/90 border-t border-white/5">
              <div className="text-center mb-4">
                <div className="inline-block px-3 py-1 bg-gradient-to-r from-red-600/20 to-red-500/10 border border-red-600/30 rounded-lg mb-3">
                  <span className="text-red-400 text-xs font-bold uppercase tracking-widest">
                    Studio Preview
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight mb-3 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  {selectedItem.name}
                </h2>
                <div className="h-px w-20 bg-gradient-to-r from-transparent via-red-500 to-transparent mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-16 text-center px-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-[2px] w-12 bg-gradient-to-r from-red-600 to-red-400"></div>
          <span className="text-red-500 font-black uppercase tracking-[0.4em] text-xs">Studio Gallery</span>
          <div className="h-[2px] w-12 bg-gradient-to-r from-red-400 to-red-600"></div>
        </div>
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase mb-6 leading-tight">
          <span className="bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent block">
            STONI
          </span>
          <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 bg-clip-text text-transparent block">
            GALLERY
          </span>
        </h1>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg leading-relaxed">
          Koleksi instrumen premium dengan standar recording profesional.
        </p>
      </div>

      {/* GALLERY GRID - BENTO LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[280px] md:auto-rows-[320px]">
          {GALLERY_DATA.map((item, index) => {
            const size =
              index === 0
                ? "large"
                : index === 1
                ? "wide"
                : index === 4
                ? "large"
                : "standard";

            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`
                  group relative overflow-hidden rounded-2xl border border-white/10
                  cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-600/20
                  ${size === "large" ? "md:col-span-2 md:row-span-2" : 
                    size === "wide" ? "md:col-span-2" : ""}
                `}
              >
                {/* Background with gradient overlay */}
                <div className="absolute inset-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:brightness-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-red-600/0 via-red-600/0 to-red-600/0 group-hover:via-red-600/10 group-hover:to-red-600/20 transition-all duration-500"></div>
                </div>

                {/* Content */}
                <div className="relative h-full p-6 flex flex-col justify-end">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="mb-3">
                      <div className="h-px w-12 bg-gradient-to-r from-red-600 to-transparent mb-3 group-hover:w-16 transition-all duration-300"></div>
                      <h3 className="text-xl md:text-2xl lg:text-3xl font-black uppercase tracking-tighter leading-tight text-white drop-shadow-lg">
                        {item.name}
                      </h3>
                    </div>
                    <p className="text-zinc-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center gap-2">
                      <span className="bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent font-semibold">
                        Lihat Detail
                      </span>
                      <ChevronRight size={16} className="text-red-400 group-hover:translate-x-1 transition-transform" />
                    </p>
                  </div>
                </div>

                {/* Corner accent */}
                <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-red-600/30 rounded-tr-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Hover border effect */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500/40 rounded-2xl transition-all duration-500 pointer-events-none"></div>
              </button>
            );
          })}
        </div>
      </div>

      {/* CTA SECTION */}
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative p-8 md:p-10 rounded-3xl bg-gradient-to-br from-black/50 to-zinc-900/50 border border-white/10 backdrop-blur-sm">
          <h2 className="text-3xl md:text-4xl font-black mb-6 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
            Siap Membuat Karya Terbaik?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-2xl mx-auto text-lg">
            Booking studio profesional kami yang dilengkapi dengan peralatan premium untuk sesi rekaman Anda berikutnya.
          </p>
          
          <button
            onClick={handleBookNow}
            className="group relative px-12 py-6 rounded-2xl font-bold uppercase tracking-widest text-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <div className="relative z-10 flex items-center justify-center gap-4">
              <span className="text-white">Booking Studio Sekarang</span>
              <ChevronRight className="text-white group-hover:translate-x-2 transition-transform duration-300" />
            </div>
          </button>
          
          {/* Additional Info */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-white mb-1">24/7</div>
              <div className="text-xs text-zinc-400">Akses Studio</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white mb-1">4.9</div>
              <div className="text-xs text-zinc-400">Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-white mb-1">100+</div>
              <div className="text-xs text-zinc-400">Artis</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}