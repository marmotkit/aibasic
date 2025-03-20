import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'px-4 py-2 rounded-lg transition-colors',
          variant === 'default'
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'border border-gray-300 hover:bg-gray-100',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
); 