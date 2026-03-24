import React from 'react';

const IconMenuDashboards = ({ className = "w-6 h-6" }) => {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Top Left */}
      <rect x="3" y="3" width="8" height="8" rx="2" />
      
      {/* Top Right */}
      <rect x="13" y="3" width="8" height="5" rx="2" />
      
      {/* Bottom Left */}
      <rect x="3" y="13" width="5" height="8" rx="2" />
      
      {/* Bottom Right */}
      <rect x="10" y="10" width="11" height="11" rx="2" />
    </svg>
  );
};

export default IconMenuDashboards;
