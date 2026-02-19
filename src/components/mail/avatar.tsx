'use client';

import { cn } from '@/lib/utils';

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

function getAvatarColor(email: string): string {
  const hash = Math.abs(hashString(email));
  const hue = hash % 360;
  return `hsl(${hue}, 55%, 55%)`;
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
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-10 w-10 text-sm',
};

export function MailAvatar({ email, name, size = 'md', className }: MailAvatarProps) {
  const displayName = name || email.split('@')[0] || email;
  const initials = getInitials(displayName);
  const color = getAvatarColor(email);

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-medium text-white',
        sizeClasses[size],
        className,
      )}
      style={{ backgroundColor: color }}
    >
      {initials}
    </div>
  );
}
