import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ekaterina from '@/assets/ekaterina-hero.png';
import leopardPattern from '@/assets/leopard-pattern.jpg';

export default function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEnterSpace = () => {
    if (user) {
      if (user.role === 'admin' || user.role === 'assistant') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } else {
      navigate('/login');
    }
  };

  const handleCircleClick = (target: string) => {
    if (target === 'intensive') {
      navigate('/login');
    } else if (target === 'practices') {
      if (user) {
        navigate('/app/meditations');
      } else {
        navigate('/login');
      }
    } else if (target === 'test') {
      // Placeholder for test
      alert('Тест скоро будет доступен');
    }
  };

  return (
    <div className="min-h-screen bg-[#1a0f0f] overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-6 md:px-12 py-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <span className="font-display text-xl md:text-2xl text-[#f5f0e8] tracking-[0.15em]">
            Екатерина Вольпер
          </span>
          
          <nav className="hidden md:flex items-center gap-10">
            <Link 
              to="/philosophy" 
              className="text-[11px] tracking-[0.2em] text-[#c9a96e]/90 hover:text-[#c9a96e] transition-colors uppercase"
            >
              Философия
            </Link>
            <Link 
              to="/contacts" 
              className="text-[11px] tracking-[0.2em] text-[#c9a96e]/90 hover:text-[#c9a96e] transition-colors uppercase"
            >
              Контакты
            </Link>
            <button
              onClick={handleEnterSpace}
              className="px-5 py-2 rounded-sm border border-[#c9a96e]/50 text-[11px] tracking-[0.15em] text-[#c9a96e]/90 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all uppercase leading-tight"
            >
              Войти в<br />пространство
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-[65vh] flex items-center pt-28 pb-12 px-8 md:px-16 lg:px-24">
        <div className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Portrait with gold circle */}
          <div className="flex-shrink-0">
            <div className="relative">
              {/* Outer dark ring */}
              <div className="w-[280px] h-[280px] md:w-[320px] md:h-[320px] rounded-full bg-[#2a1a1a] p-[6px]">
                {/* Gold ring */}
                <div 
                  className="w-full h-full rounded-full p-[2px]"
                  style={{
                    background: 'linear-gradient(135deg, #c9a96e 0%, #b8956a 50%, #c9a96e 100%)',
                  }}
                >
                  {/* Inner dark ring */}
                  <div className="w-full h-full rounded-full bg-[#2a1a1a] p-[6px]">
                    {/* Photo container */}
                    <div className="w-full h-full rounded-full overflow-hidden">
                      <img
                        src={ekaterina}
                        alt="Екатерина Вольпер"
                        className="w-full h-full object-cover object-center scale-[1.0]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-[4.5rem] text-[#c9a96e] leading-[1.05] tracking-[0.02em]">
              ЭСТЕТИКА
              <br />
              ЧУВСТВЕННОЙ
              <br />
              БЛИЗОСТИ
            </h1>
            <p className="mt-10 text-[11px] md:text-xs text-[#c9a96e]/60 tracking-[0.35em] uppercase font-light">
              Образовательная среда нового поколения
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Section with Pattern */}
      <section 
        className="min-h-[40vh] relative flex flex-col items-center justify-center py-16"
        style={{
          backgroundImage: `url(${leopardPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-[#1a0f0f]/30" />
        
        {/* Circles */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-8 md:gap-12 px-8">
          {/* Test Circle */}
          <button
            onClick={() => handleCircleClick('test')}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-[#c9a96e]/60 flex items-center justify-center hover:border-[#c9a96e] transition-colors bg-transparent"
          >
            <span className="text-[#f5f0e8] text-xs md:text-sm tracking-[0.2em] uppercase">Тест</span>
          </button>

          {/* Intensive Circle */}
          <button
            onClick={() => handleCircleClick('intensive')}
            className="w-36 h-36 md:w-44 md:h-44 rounded-full border border-[#c9a96e]/60 flex items-center justify-center hover:border-[#c9a96e] transition-colors bg-transparent"
          >
            <span className="text-[#f5f0e8] text-xs md:text-sm tracking-[0.15em] uppercase text-center leading-relaxed px-4">
              7-дневный
              <br />
              онлайн-
              <br />
              интенсив
            </span>
          </button>

          {/* Practices Circle */}
          <button
            onClick={() => handleCircleClick('practices')}
            className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-[#c9a96e]/60 flex items-center justify-center hover:border-[#c9a96e] transition-colors bg-transparent"
          >
            <span className="text-[#f5f0e8] text-xs md:text-sm tracking-[0.2em] uppercase">Практики</span>
          </button>
        </div>

        {/* Footer */}
        <div className="relative z-10 mt-16 text-center">
          <p className="text-[#f5f0e8]/50 text-xs tracking-wider">
            © 2025 Екатерина Вольпер. Все права защищены.
          </p>
        </div>
      </section>
    </div>
  );
}
