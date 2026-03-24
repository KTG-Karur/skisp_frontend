import React from 'react';

const IconCarMoving = ({ className = 'w-5 h-5' }) => {
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
            {/* Motion lines */}
            <path d="M2 12h3" />
            <path d="M1 9h4" />
            <path d="M3 15h2" />

            {/* Car body */}
            <path d="M5 13l2-5h8l2 5" />
            <rect x="4" y="13" width="16" height="4" rx="1.5" />

            {/* Windows */}
            <path d="M8 8h8" />

            {/* Wheels */}
            <circle cx="8" cy="18" r="1.8" />
            <circle cx="16" cy="18" r="1.8" />
        </svg>
    );
};

export default IconCarMoving;
