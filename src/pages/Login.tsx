import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CrownAvatar } from '@/components/CrownAvatar';
import { ArrowLeft, MessageCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = login(email, password);
    
    if (result.success) {
      // Determine where to redirect based on role
      const storedUser = JSON.parse(localStorage.getItem('estetika_current_user') || '{}');
      if (storedUser.role === 'admin' || storedUser.role === 'assistant') {
        navigate('/admin');
      } else {
        navigate('/app');
      }
    } else {
      setError(result.error || 'Ошибка входа');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">На главную</span>
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 pb-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <CrownAvatar size="xl" />
            </div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              Войти в пространство
            </h1>
            <p className="text-base text-muted-foreground mt-2">
              Эстетика чувственной близости
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="bg-input border-border text-base h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">Пароль</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="bg-input border-border text-base h-12"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                className="h-5 w-5"
              />
              <Label htmlFor="remember" className="text-base text-foreground cursor-pointer">
                Запомнить меня
              </Label>
            </div>

            <Button type="submit" className="w-full bg-gold hover:bg-gold-dark text-primary-foreground h-12 text-base">
              Войти
            </Button>

            {/* Telegram Login - Placeholder */}
            <Button
              type="button"
              variant="outline"
              className="w-full border-border text-foreground h-12 text-base"
              disabled
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Войти через Telegram (скоро)
            </Button>
          </form>

          {/* Register Link */}
          <p className="text-center text-base text-muted-foreground mt-6">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-gold hover:text-gold-light transition-colors">
              Зарегистрироваться
            </Link>
          </p>

          {/* Demo credentials */}
          <div className="mt-8 p-5 bg-muted rounded-lg">
            <p className="text-sm text-foreground mb-3 font-medium">Тестовые аккаунты:</p>
            <div className="space-y-2 text-sm text-foreground">
              <p>👑 Админ: ekaterina@estetika.ru / admin123</p>
              <p>🤝 Ассистент: assistant@estetika.ru / assistant123</p>
              <p>📚 Ученица: elena@mail.ru / student123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
