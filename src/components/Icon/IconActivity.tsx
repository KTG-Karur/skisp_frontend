import React from 'react';

interface IconActivityProps {
  className?: string;
  strokeWidth?: number;
  [key: string]: any;
}

const IconActivity: React.FC<IconActivityProps> = ({ 
  className = 'w-6 h-6', 
  strokeWidth = 1.5, 
  ...props 
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941"
      />
    </svg>
  );
};

export default IconActivity;