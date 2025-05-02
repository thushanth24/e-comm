import { forwardRef } from 'react';
import styles from '@/styles/Button.module.scss';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'default',
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClass = styles[variant] || '';
    const sizeClass = styles[size] || '';
    const loadingClass = isLoading ? styles.loading : '';
    const combinedClassName = `${styles.button} ${variantClass} ${sizeClass} ${loadingClass} ${className || ''}`.trim();

    return (
      <button
        ref={ref}
        className={combinedClassName}
        disabled={isLoading || disabled}
        {...props}
      >
        {isLoading && (
          <svg
            className={styles.spinner}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className={styles.spinnerTrack}
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className={styles.spinnerPath}
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
