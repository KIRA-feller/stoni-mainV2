import { CheckCircle2 } from "lucide-react";

export default function RoomCard({ name, price, image, description, features }) {
  return (
    <div className="group relative bg-gradient-to-b from-zinc-900 to-zinc-950 border border-white/10 rounded-2xl overflow-hidden hover:border-red-500/50 transition-all duration-300 cursor-pointer hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-600/10">
      {/* Glow effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-red-600/0 to-red-600/0 group-hover:via-red-600/5 group-hover:to-red-600/10 transition-all duration-500 rounded-2xl pointer-events-none"></div>
      
      {/* Area Gambar */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10"></div>
        <img 
          src={image} 
          alt={name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
        <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
          <p className="text-red-400 font-bold text-sm">
            Rp {price}<span className="text-zinc-400 text-xs"> / jam</span>
          </p>
        </div>
      </div>

      {/* Area Informasi */}
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-400 transition-colors duration-300">
            {name}
          </h3>
          <p className="text-zinc-400 text-sm line-clamp-2 leading-relaxed">
            {description || "Klik untuk melihat detail fasilitas dan jadwal tersedia."}
          </p>
        </div>

        {/* Daftar Fitur/Fasilitas Kecil */}
        {features && features.length > 0 && (
          <div className="mb-6 space-y-2.5">
            {features.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 text-[11px] uppercase tracking-wider group/feature"
              >
                <div className="relative">
                  <CheckCircle2 
                    size={14} 
                    className="text-red-500 group-hover/feature:text-red-400 transition-colors duration-300" 
                  />
                  <div className="absolute inset-0 bg-red-500/20 rounded-full scale-0 group-hover/feature:scale-100 transition-transform duration-300"></div>
                </div>
                <span className="text-zinc-500 group-hover/feature:text-zinc-300 transition-colors duration-300">
                  {item}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Button */}
        <button className="w-full relative overflow-hidden bg-gradient-to-b from-zinc-800 to-zinc-900 group-hover:from-red-600 group-hover:to-red-500 text-white py-3.5 rounded-xl font-bold text-sm transition-all duration-300 border border-white/5 group-hover:border-red-500/30">
          <div className="relative z-10 flex items-center justify-center gap-2">
            <span>Lihat Detail & Booking</span>
          </div>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
        </button>
      </div>

      {/* Border hover effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-red-500/30 rounded-2xl transition-all duration-300 pointer-events-none"></div>
    </div>
  );
}