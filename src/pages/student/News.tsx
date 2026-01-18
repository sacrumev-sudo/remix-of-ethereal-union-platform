import { getNews } from '@/lib/storage';

export default function StudentNews() {
  const news = getNews();

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-display text-3xl text-foreground mb-8">Новости</h1>

      <div className="space-y-6">
        {news.map((item) => (
          <article key={item.id} className="premium-card">
            <div className="flex items-center gap-3 mb-4">
              <time className="text-sm text-gold">{item.date}</time>
            </div>
            <h2 className="font-display text-xl text-foreground mb-3">
              {item.title}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              {item.text}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
