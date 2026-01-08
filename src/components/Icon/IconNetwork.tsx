import React from 'react';

interface IconNetworkProps {
  className?: string;
  strokeWidth?: number;
  [key: string]: any;
}

const IconNetwork: React.FC<IconNetworkProps> = ({ 
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
        d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0"
      />
    </svg>
  );
};

export default IconNetwork;