'use client';

import { cn } from '@/lib/utils';

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

const avatarGradients = [
  'from-blue-500 to-cyan-400',
  'from-violet-500 to-purple-400',
  'from-pink-500 to-rose-400',
  'from-amber-500 to-orange-400',
  'from-emerald-500 to-teal-400',
  'from-indigo-500 to-blue-400',
  'from-fuchsia-500 to-pink-400',
  'from-cyan-500 to-sky-400',
];

function getAvatarGradient(email: string): string {
  const hash = Math.abs(hashString(email));
  return avatarGradients[hash % avatarGradients.length];
}

function getInitials(name: string): string {
  const parts = name.replace(/<.*>/, '').trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (parts[0]?.[0] || '?').toUpperCase();
}

interface MailAvatarProps {
  email: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-[11px]',
  md: 'h-9 w-9 text-[12px]',
  lg: 'h-10 w-10 text-[13px]',
};

export function MailAvatar({ email, name, size = 'md', className }: MailAvatarProps) {
  const displayName = name || email.split('@')[0] || email;
  const initials = getInitials(displayName);
  const gradient = getAvatarGradient(email);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold text-white bg-gradient-to-br shadow-sm ring-1 ring-white/10',
        gradient,
        sizeClasses[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
