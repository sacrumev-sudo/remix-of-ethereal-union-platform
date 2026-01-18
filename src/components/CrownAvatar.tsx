import crownImage from '@/assets/crown.png';

interface CrownAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  name?: string;
  className?: string;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-12 h-12',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

export function CrownAvatar({ size = 'md', name, className = '' }: CrownAvatarProps) {
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-amber-50 to-amber-100 border-2 border-gold shadow-md flex items-center justify-center ${className}`}
      title={name}
    >
      <img
        src={crownImage}
        alt="Crown"
        className="w-3/4 h-3/4 object-contain drop-shadow-sm"
      />
    </div>
  );
}
