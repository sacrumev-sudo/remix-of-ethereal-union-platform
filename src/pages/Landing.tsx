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
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-10 px-8 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-display text-xl text-logo-shimmer tracking-wide">
            Екатерина Вольпер
          </span>
          
          <nav className="hidden md:flex items-center gap-10">
            <Link 
              to="/philosophy" 
              className="text-sm tracking-widest text-foreground/80 hover:text-foreground transition-colors uppercase"
            >
              Философия
            </Link>
            <Link 
              to="/contacts" 
              className="text-sm tracking-widest text-foreground/80 hover:text-foreground transition-colors uppercase"
            >
              Контакты
            </Link>
            <button
              onClick={handleEnterSpace}
              className="px-6 py-2.5 rounded-full border border-gold/60 text-sm tracking-wider text-foreground/90 hover:border-gold hover:text-foreground transition-all uppercase"
            >
              Войти в пространство
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="min-h-[65vh] flex items-center justify-center pt-24 pb-8 px-8">
        <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Portrait */}
          <div className="flex justify-center lg:justify-start">
            <div className="relative">
              {/* Gold circle frame */}
              <div className="w-72 h-72 md:w-96 md:h-96 rounded-full border-2 border-gold/60 p-2">
                <div className="w-full h-full rounded-full overflow-hidden bg-background">
                  <img
                    src={ekaterina}
                    alt="Екатерина Вольпер"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center lg:text-left">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl text-foreground leading-tight tracking-wide">
              ЭСТЕТИКА
              <br />
              ЧУВСТВЕННОЙ
              <br />
              БЛИЗОСТИ
            </h1>
            <p className="mt-6 text-sm md:text-base text-muted-foreground tracking-widest uppercase">
              Образовательная среда нового поколения
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Section with Pattern */}
      <section 
        className="min-h-[35vh] relative flex items-center justify-center py-16"
        style={{
          backgroundImage: `url(${leopardPattern})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for better contrast */}
        <div className="absolute inset-0 bg-background/20" />
        
        {/* Circles */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-8 md:gap-16 px-8">
          {/* Test Circle */}
          <button
            onClick={() => handleCircleClick('test')}
            className="circle-button"
          >
            <span className="circle-button-text">ТЕСТ</span>
          </button>

          {/* Intensive Circle */}
          <button
            onClick={() => handleCircleClick('intensive')}
            className="circle-button scale-110"
          >
            <span className="circle-button-text">
              7-ДНЕВНЫЙ
              <br />
              ОНЛАЙН-
              <br />
              ИНТЕНСИВ
            </span>
          </button>

          {/* Practices Circle */}
          <button
            onClick={() => handleCircleClick('practices')}
            className="circle-button"
          >
            <span className="circle-button-text">ПРАКТИКИ</span>
          </button>
        </div>
      </section>
    </div>
  );
}
