import React from 'react';

interface IconMoreVerticalProps {
  className?: string;
  strokeWidth?: number;
  [key: string]: any;
}

const IconMoreVertical: React.FC<IconMoreVerticalProps> = ({ 
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
        d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"
      />
    </svg>
  );
};

export default IconMoreVertical;