import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();

  const handleBookingClick = () => {
    navigate("/booking/1");
    window.scrollTo(0, 0);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background dengan efek overlay dan gradien */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-black z-0">
        <img 
          src="/assets/homepage.webp" 
          className="absolute inset-0 w-full h-full object-cover opacity-40" 
          alt="Studio Background" 
        />
        
        {/* Efek gradien overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40 z-10"></div>
        
        {/* Partikel efek */}
        <div className="absolute inset-0 z-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-red-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-red-600/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* Konten utama */}
      <div className="relative z-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center space-y-8 md:space-y-12">
          
          {/* Heading dengan animasi gradien */}
          <div className="space-y-4 md:space-y-6">
            <div className="inline-block relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-lg blur opacity-30"></div>
              <h1 className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white leading-tight tracking-tight">
                REKAM <span className="relative">
                  <span className="bg-gradient-to-r from-red-500 via-red-400 to-red-300 bg-clip-text text-transparent animate-pulse-slow">
                    KARYA
                  </span>
                  <div className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
                </span> TERBAIKMU
              </h1>
            </div>
            
            {/* Garis pemisah dekoratif */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-red-500/50"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <div className="w-16 h-0.5 bg-gradient-to-r from-red-500/50 to-transparent"></div>
            </div>
          </div>

          {/* Deskripsi */}
          <p className="text-gray-300 text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-light">
            Fasilitas premium dengan akustik profesional untuk 
            <span className="text-red-300 font-medium"> latihan band</span>, 
            <span className="text-red-300 font-medium"> rekaman</span>, hingga 
            <span className="text-red-300 font-medium"> mixing & mastering</span>.
          </p>

          {/* CTA Button dengan efek hover */}
          <div className="pt-4 md:pt-8">
            <button 
              onClick={handleBookingClick}
              className="group relative px-10 py-5 md:px-12 md:py-6 rounded-xl font-bold text-lg md:text-xl tracking-wide transition-all duration-300 transform hover:scale-105 active:scale-95"
            >
              {/* Background gradien dengan animasi */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Border glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-xl blur opacity-0 group-hover:opacity-50 transition-opacity duration-500"></div>
              
              {/* Inner shadow */}
              <div className="absolute inset-0 rounded-xl shadow-inner shadow-black/30"></div>
              
              {/* Text dengan efek */}
              <span className="relative z-10 text-white flex items-center justify-center gap-3">
                <span>Booking Studio</span>
                <svg 
                  className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              
              {/* Animated underline */}
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-white group-hover:w-24 transition-all duration-500"></div>
            </button>
            
            {/* Subtext di bawah button */}
            <p className="text-gray-400 text-sm mt-6 md:mt-8 font-medium">
              Mulai dari <span className="text-red-300 font-bold">Rp 150.000/jam</span> • 
              <span className="text-gray-300 ml-2">Equipment terbaru tersedia</span>
            </p>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-red-500 rounded-full mt-2"></div>
        </div>
      </div>

      {/* Decorative corner accents */}
      <div className="absolute top-10 left-10 w-32 h-32 border-t-2 border-l-2 border-red-500/30 rounded-tl-3xl z-10"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 border-b-2 border-r-2 border-red-500/30 rounded-br-3xl z-10"></div>
    </section>
  );
}