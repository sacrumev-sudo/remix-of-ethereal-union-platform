import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import ekaterina from '@/assets/ekaterina-portrait.jpg';
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
          
          <nav className="hidden md:flex items-center gap-12">
            <Link 
              to="/philosophy" 
              className="text-xs tracking-[0.25em] text-[#f5f0e8]/80 hover:text-[#f5f0e8] transition-colors uppercase"
            >
              Философия
            </Link>
            <Link 
              to="/contacts" 
              className="text-xs tracking-[0.25em] text-[#f5f0e8]/80 hover:text-[#f5f0e8] transition-colors uppercase"
            >
              Контакты
            </Link>
            <button
              onClick={handleEnterSpace}
              className="px-5 py-2.5 rounded-sm border border-[#c9a96e]/60 text-xs tracking-[0.2em] text-[#f5f0e8]/90 hover:border-[#c9a96e] hover:text-[#f5f0e8] transition-all uppercase"
            >
              Войти в пространство
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-[60vh] flex items-center pt-24 pb-8 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto w-full grid lg:grid-cols-[auto_1fr] gap-16 lg:gap-24 items-center">
          {/* Portrait with gold circle */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              {/* Outer gold ring */}
              <div 
                className="w-64 h-64 md:w-80 md:h-80 rounded-full p-[3px]"
                style={{
                  background: 'linear-gradient(135deg, #c9a96e 0%, #d4b87a 50%, #c9a96e 100%)',
                }}
              >
                {/* Dark inner ring */}
                <div className="w-full h-full rounded-full bg-[#1a0f0f] p-[4px]">
                  {/* Photo container */}
                  <div className="w-full h-full rounded-full overflow-hidden">
                    <img
                      src={ekaterina}
                      alt="Екатерина Вольпер"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: '50% 25%', transform: 'scale(1.3)' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-[#c9a96e] leading-[1.1] tracking-wide">
              ЭСТЕТИКА
              <br />
              ЧУВСТВЕННОЙ
              <br />
              БЛИЗОСТИ
            </h1>
            <p className="mt-8 text-xs md:text-sm text-[#c9a96e]/70 tracking-[0.3em] uppercase">
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
