import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CrownAvatar } from '@/components/CrownAvatar';
import { ArrowLeft, AtSign } from 'lucide-react';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [telegramUsername, setTelegramUsername] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedOffer, setAcceptedOffer] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    if (!acceptedPrivacy || !acceptedOffer) {
      setError('Необходимо принять условия');
      return;
    }

    // Validate DOB format
    const dobRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!dobRegex.test(dob)) {
      setError('Введите дату в формате ДД.ММ.ГГГГ');
      return;
    }

    const result = register({
      email,
      password,
      name: name || undefined,
      dob,
      telegramUsername: telegramUsername || undefined,
    });

    if (result.success) {
      navigate('/app');
    } else {
      setError(result.error || 'Ошибка регистрации');
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
            <h1 className="font-display text-2xl text-foreground">
              Регистрация
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              Создайте аккаунт в пространстве
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="bg-input border-border"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Пароль *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-input border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Повтор *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="bg-input border-border"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Имя (необязательно)</Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Как к вам обращаться"
                className="bg-input border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dob">Дата рождения *</Label>
              <Input
                id="dob"
                type="text"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                placeholder="ДД.ММ.ГГГГ"
                required
                className="bg-input border-border"
              />
              <p className="text-xs text-muted-foreground">
                Регистрация доступна только для лиц старше 18 лет
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="telegram">Telegram (необязательно)</Label>
              <div className="relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="telegram"
                  type="text"
                  value={telegramUsername}
                  onChange={(e) => setTelegramUsername(e.target.value.replace('@', ''))}
                  placeholder="username"
                  className="bg-input border-border pl-9"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="privacy"
                  checked={acceptedPrivacy}
                  onCheckedChange={(checked) => setAcceptedPrivacy(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="privacy" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                  Я ознакомлен(а) с{' '}
                  <Link to="/docs/privacy" className="text-gold hover:underline">
                    Политикой конфиденциальности
                  </Link>
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="offer"
                  checked={acceptedOffer}
                  onCheckedChange={(checked) => setAcceptedOffer(checked as boolean)}
                  className="mt-0.5"
                />
                <Label htmlFor="offer" className="text-sm text-muted-foreground cursor-pointer leading-relaxed">
                  Я принимаю{' '}
                  <Link to="/docs/offer" className="text-gold hover:underline">
                    Договор оферты
                  </Link>
                </Label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gold hover:bg-gold-dark text-primary-foreground mt-4"
              disabled={!acceptedPrivacy || !acceptedOffer}
            >
              Создать аккаунт
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-gold hover:text-gold-light transition-colors">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
