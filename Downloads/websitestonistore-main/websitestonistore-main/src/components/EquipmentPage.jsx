import { useState } from "react";
import { Mic, Guitar, Speaker, Disc, ChevronRight, X, ChevronLeft } from "lucide-react";
// Import Swiper components
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Keyboard } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const EQUIPMENT_DATA = [
  // AMPS 1-4
  {
    id: 1,
    name: "Marshall JCM800",
    category: "Amps",
    brand: "Marshall",
    image: "/assets/Amps.webp",
    gallery: [
      "/assets/Amps.webp",
    ],
    desc: "Legendary tube amplifier known for its iconic rock tone."
  },{
    id: 2,
    name: "Marshall JCM800",
    category: "Amps",
    brand: "Marshall",
    image: "/assets/Amps.webp",
    gallery: [
      "/assets/Amps.webp",
    ],
    desc: "Legendary tube amplifier known for its iconic rock tone."
  },{
    id: 3,
    name: "Marshall JCM800",
    category: "Amps",
    brand: "Marshall",
    image: "/assets/Amps.webp",
    gallery: [
      "/assets/Amps.webp",
    ],
    desc: "Legendary tube amplifier known for its iconic rock tone."
  },{
    id: 4,
    name: "Marshall JCM800",
    category: "Amps",
    brand: "Marshall",
    image: "/assets/Amps.webp",
    gallery: [
      "/assets/Amps.webp",
    ],
    desc: "Legendary tube amplifier known for its iconic rock tone."
  },
  // Drums 5-8
  {
    id: 5,
    name: "Pearl Export Series",
    category: "Drums",
    brand: "Pearl",
    image: "/assets/DrumEquipment.webp",
    gallery: [
      "/assets/DrumEquipment.webp",
    ],
    desc: "High-quality shells for punchy and clear percussion."
  },{
    id: 6,
    name: "Pearl Export Series",
    category: "Drums",
    brand: "Pearl",
    image: "/assets/DrumEquipment.webp",
    gallery: [
      "/assets/DrumEquipment.webp",
    ],
    desc: "High-quality shells for punchy and clear percussion."
  },{
    id: 7,
    name: "Pearl Export Series",
    category: "Drums",
    brand: "Pearl",
    image: "/assets/DrumEquipment.webp",
    gallery: [
      "/assets/DrumEquipment.webp",
    ],
    desc: "High-quality shells for punchy and clear percussion."
  },{
    id: 8,
    name: "Pearl Export Series",
    category: "Drums",
    brand: "Pearl",
    image: "/assets/DrumEquipment.webp",
    gallery: [
      "/assets/DrumEquipment.webp",
    ],
    desc: "High-quality shells for punchy and clear percussion."
  },
  // Microphones 9-12
  {
    id: 9,
    name: "aggap aja mic",
    category: "Microphones",
    brand: "gk tau alat musik bang/anggap aja ini mic",
    image: "/assets/micDemo.webp",
    gallery: [
      "/assets/micDemo.webp",
    ],
    desc: "khusus muslim."
  },{
    id: 10,
    name: "aggap aja mic",
    category: "Microphones",
    brand: "gk tau alat musik bang/anggap aja ini mic",
    image: "/assets/micDemo.webp",
    gallery: [
      "/assets/micDemo.webp",
    ],
    desc: "khusus muslim."
  },{
    id: 11,
    name: "aggap aja mic",
    category: "Microphones",
    brand: "gk tau alat musik bang/anggap aja ini mic",
    image: "/assets/micDemo.webp",
    gallery: [
      "/assets/micDemo.webp",
    ],
    desc: "khusus muslim."
  },{
    id: 12,
    name: "aggap aja mic",
    category: "Microphones",
    brand: "gk tau alat musik bang/anggap aja ini mic",
    image: "/assets/micDemo.webp",
    gallery: [
      "/assets/micDemo.webp",
    ],
    desc: "khusus muslim."
  },
  // gitar 13-15
  {
    id: 13,
    name: "Guitars",
    category: "Guitars",
    brand: "gk tau alat musik bang",
    image: "/assets/gitar.webp",
    gallery: [
      "/assets/gitar.webp",
    ],
    desc: "gk tau gk ngerti band."
  },{
    id: 14,
    name: "Guitars",
    category: "Guitars",
    brand: "gk tau alat musik bang",
    image: "/assets/gitar.webp",
    gallery: [
      "/assets/gitar.webp",
    ],
    desc: "gk tau gk ngerti band."
  },{
    id: 15,
    name: "Guitars",
    category: "Guitars",
    brand: "gk tau alat musik bang",
    image: "/assets/gitar.webp",
    gallery: [
      "/assets/gitar.webp",
    ],
    desc: "gk tau gk ngerti band."
  }
  // Data lainnya...
];

const CATEGORIES = ["All", "Amps", "Microphones", "Drums", "Guitars"];

export default function EquipmentPage() {
  const [filter, setFilter] = useState("All");
  const [selectedItem, setSelectedItem] = useState(null);

  const filteredData = EQUIPMENT_DATA.filter(item => 
    filter === "All" ? true : item.category === filter
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-zinc-950 to-black text-white pt-24 pb-20 px-6 sm:px-12 font-sans">
      
      {/* MODAL DETAIL SLIDER */}
      {selectedItem && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md" onClick={() => setSelectedItem(null)}></div>
          
          <div className="relative w-full max-w-6xl bg-gradient-to-b from-zinc-950 to-black rounded-xl overflow-hidden border border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-5 right-5 z-[160] p-2 bg-black/50 hover:bg-red-600 rounded-lg text-white transition-all border border-white/10 hover:scale-110"
            >
              <X size={24} />
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2">
              {/* Slider Section */}
              <div className="h-[350px] md:h-[500px] lg:h-[600px] relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
                <Swiper
                  modules={[Navigation, Pagination, Keyboard]}
                  navigation
                  pagination={{ clickable: true }}
                  keyboard={{ enabled: true }}
                  className="h-full w-full"
                >
                  {selectedItem.gallery?.map((img, idx) => (
                    <SwiperSlide key={idx}>
                      <img src={img} className="w-full h-full object-cover" alt={`Detail ${idx}`} />
                    </SwiperSlide>
                  )) || (
                    <SwiperSlide>
                      <img src={selectedItem.image} className="w-full h-full object-cover" alt="Main" />
                    </SwiperSlide>
                  )}
                </Swiper>
              </div>

              {/* Info Section */}
              <div className="p-8 md:p-12 flex flex-col justify-center border-l border-white/5 bg-gradient-to-b from-zinc-950/80 to-black/80">
                <div className="inline-block px-3 py-1 bg-gradient-to-r from-red-600/20 to-red-500/10 border border-red-600/30 text-red-400 text-[10px] font-black uppercase tracking-widest mb-6 w-fit rounded-lg">
                  {selectedItem.brand}
                </div>
                <h2 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter mb-6 bg-gradient-to-r from-white to-zinc-300 bg-clip-text text-transparent">
                  {selectedItem.name}
                </h2>
                <div className="h-1 w-20 bg-gradient-to-r from-red-600 to-red-400 mb-8"></div>
                <p className="text-zinc-300 text-lg leading-relaxed mb-8">
                  {selectedItem.desc}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="max-w-7xl mx-auto mb-16">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-[2px] w-12 bg-gradient-to-r from-red-600 to-red-400"></div>
          <span className="text-red-500 font-black uppercase tracking-[0.4em] text-xs">Professional Gear</span>
        </div>
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic mb-8">
          Stoni <span className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 bg-clip-text text-transparent">Music Equipment.</span>
        </h1>
        <p className="text-zinc-400 max-w-2xl text-lg">
          Koleksi instrumen pilihan dengan standar recording profesional.
        </p>
      </div>

      {/* FILTER TABS (Less Rounded) - Hanya style yang diubah */}
      <div className="max-w-7xl mx-auto mb-12 flex flex-wrap gap-3">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-6 py-2.5 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all duration-300 border relative overflow-hidden group ${
              filter === cat 
              ? "bg-gradient-to-r from-red-600 to-red-500 border-red-600 text-white shadow-lg shadow-red-600/30" 
              : "bg-zinc-900/50 border-white/10 text-zinc-400 hover:text-white hover:border-white/30 hover:bg-zinc-800/50"
            }`}
          >
            <span className="relative z-10">{cat}</span>
            {filter === cat && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            )}
          </button>
        ))}
      </div>

      {/* EQUIPMENT GRID (Less Rounded) - Hanya style yang diubah */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((item, index) => (
          <div 
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="group relative h-[450px] rounded-2xl overflow-hidden border border-white/5 bg-gradient-to-b from-zinc-900 to-zinc-950 cursor-pointer animate-in fade-in duration-500 hover:scale-[1.02] transition-transform"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <img 
              src={item.image} 
              alt={item.name}
              className="w-full h-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0 group-hover:scale-110"
            />
            
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 group-hover:opacity-70 transition-opacity"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-red-600/0 via-red-600/0 to-red-600/0 group-hover:via-red-600/5 group-hover:to-red-600/10 transition-all duration-500"></div>
            
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <p className="text-red-400 font-black text-[10px] uppercase tracking-widest mb-1">{item.brand}</p>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">{item.name}</h3>
                {/* VIEW DETAIL TETAP SAMA SEPERTI SEBELUMNYA */}
                <p className="text-zinc-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                  View Detail <ChevronRight size={12} />
                </p>
              </div>
            </div>

            <div className="absolute top-6 left-6 p-3 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg group-hover:border-red-500/30 transition-all">
              {item.category === "Amps" && <Speaker size={18} className="text-red-500 group-hover:scale-110 transition-transform" />}
              {item.category === "Microphones" && <Mic size={18} className="text-red-500 group-hover:scale-110 transition-transform" />}
              {item.category === "Drums" && <Disc size={18} className="text-red-500 group-hover:scale-110 transition-transform" />}
              {item.category === "Guitars" && <Guitar size={18} className="text-red-500 group-hover:scale-110 transition-transform" />}
              {item.category === "key" && <KeyboardMusic size={18} className="text-red-500 group-hover:scale-110 transition-transform" />}
              {item.category === "land" && <Landmark size={18} className="text-red-500 group-hover:scale-110 transition-transform" />}
            </div>

            {/* Hover border effect */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500/30 rounded-2xl transition-all duration-300 pointer-events-none"></div>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <button className="group relative inline-flex items-center gap-4 px-10 py-5 rounded-lg font-black uppercase tracking-widest text-sm overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-600 opacity-90 group-hover:opacity-100 transition-opacity"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
          <span className="relative z-10 text-white">
            Sewa Studio Sekarang
          </span>
          <ChevronRight className="relative z-10 text-white group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}