import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hover = false,
  clickable = false,
  padding = 'default',
  rounded = 'default',
  shadow = 'default',
  onClick,
  ...props 
}) {
  const baseClasses = `
    bg-white border border-gray-100 transition-all duration-300 ease-out
    relative overflow-hidden
  `;

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8',
    xl: 'p-10'
  };

  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-lg',
    default: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-3xl'
  };

  const shadowClasses = {
    none: 'shadow-none',
    sm: 'shadow-sm',
    default: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  const variantClasses = {
    default: 'bg-white border-gray-100',
    glass: 'bg-white/80 backdrop-blur-xl border-white/20',
    gradient: 'bg-gradient-to-br from-white to-gray-50 border-gray-200',
    dark: 'bg-gray-900 border-gray-800 text-white',
    colored: 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100'
  };

  const hoverClasses = hover ? `
    hover:shadow-xl hover:-translate-y-1 hover:border-gray-200
    hover:bg-gradient-to-br hover:from-white hover:to-gray-50
  ` : '';

  const clickableClasses = clickable || onClick ? `
    cursor-pointer select-none
    hover:shadow-xl hover:-translate-y-2 hover:border-gray-200
    active:transform active:translate-y-0 active:shadow-lg
    hover:bg-gradient-to-br hover:from-white hover:to-gray-50
  ` : '';

  const cardClasses = `
    ${baseClasses}
    ${paddingClasses[padding]}
    ${roundedClasses[rounded]}
    ${shadowClasses[shadow]}
    ${variantClasses[variant]}
    ${hoverClasses}
    ${clickableClasses}
    ${className}
  `.replace(/\s+/g, ' ').trim();

  const CardWrapper = ({ children, ...wrapperProps }) => {
    if (onClick || clickable) {
      return (
        <div
          className={cardClasses}
          onClick={onClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && onClick) {
              e.preventDefault();
              onClick(e);
            }
          }}
          {...wrapperProps}
        >
          {/* Subtle gradient overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          
          {/* Border highlight effect */}
          <div className="absolute inset-0 rounded-[inherit] bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300 hover:opacity-100 pointer-events-none" />
          
          <div className="relative z-10">
            {children}
          </div>
        </div>
      );
    }

    return (
      <div className={cardClasses} {...wrapperProps}>
        {/* Subtle gradient overlay for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          {children}
        </div>
      </div>
    );
  };

  return <CardWrapper {...props}>{children}</CardWrapper>;
}

// Additional Card Components for specific use cases
export function StatCard({ title, value, subtitle, icon, trend, className = '', ...props }) {
  return (
    <Card className={`text-center ${className}`} hover {...props}>
      <div className="flex flex-col items-center">
        {icon && (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-4">
            {icon}
          </div>
        )}
        
        <div className="text-3xl font-bold text-gray-900 mb-1">
          {value}
        </div>
        
        <div className="text-lg font-semibold text-gray-700 mb-2">
          {title}
        </div>
        
        {subtitle && (
          <div className="text-sm text-gray-500">
            {subtitle}
          </div>
        )}
        
        {trend && (
          <div className={`text-xs font-medium mt-2 flex items-center gap-1 ${
            trend.type === 'up' ? 'text-green-600' : 
            trend.type === 'down' ? 'text-red-600' : 'text-gray-600'
          }`}>
            {trend.type === 'up' && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            )}
            {trend.type === 'down' && (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1V9a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586 3.707 5.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
              </svg>
            )}
            {trend.value}
          </div>
        )}
      </div>
    </Card>
  );
}

export function FeatureCard({ title, description, icon, action, className = '', ...props }) {
  return (
    <Card className={`group ${className}`} clickable {...props}>
      <div className="flex items-start gap-4">
        {icon && (
          <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:from-blue-200 group-hover:to-blue-300 transition-all duration-300">
            {icon}
          </div>
        )}
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-200">
            {title}
          </h3>
          
          {description && (
            <p className="text-gray-600 text-sm mb-3">
              {description}
            </p>
          )}
          
          {action && (
            <div className="flex items-center text-blue-600 text-sm font-medium group-hover:text-blue-700 transition-colors duration-200">
              {action}
              <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}