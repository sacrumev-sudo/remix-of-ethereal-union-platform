import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="p-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">На главную</span>
        </Link>
      </header>
      
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="font-display text-3xl text-foreground mb-4">{title}</h1>
          <p className="text-muted-foreground">
            {description || 'Страница в разработке'}
          </p>
        </div>
      </div>
    </div>
  );
}

export function PhilosophyPage() {
  return <PlaceholderPage title="Философия" description="Раздел скоро будет доступен" />;
}

export function ContactsPage() {
  return <PlaceholderPage title="Контакты" description="Раздел скоро будет доступен" />;
}

export function PrivacyPage() {
  return <PlaceholderPage title="Политика конфиденциальности" description="Документ в разработке" />;
}

export function OfferPage() {
  return <PlaceholderPage title="Договор оферты" description="Документ в разработке" />;
}
