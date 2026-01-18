import crownImage from '@/assets/crown.png';

interface CrownAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

export function CrownAvatar({ size = 'md', name, className = '' }: CrownAvatarProps) {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-card border-2 border-gold flex items-center justify-center ${className}`}
      title={name}
    >
      <img
        src={crownImage}
        alt="Crown"
        className="w-2/3 h-2/3 object-contain"
      />
    </div>
  );
}
