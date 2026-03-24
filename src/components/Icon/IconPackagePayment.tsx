import React from 'react';

const PackagePaymentIcon = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                // ===== OUTLINE VERSION =====
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={className}>
                    
                    {/* Coin */}
                    <circle
                        cx="17"
                        cy="7"
                        r="3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        opacity={duotone ? '0.5' : '1'}
                    />

                    {/* Hand */}
                    <path
                        d="M3 14.5H8.2C8.7 14.5 9.2 14.7 9.6 15.1L10.8 16.2C11.2 16.6 11.7 16.8 12.2 16.8H15.5C16.3 16.8 17 17.5 17 18.3C17 19.1 16.3 19.8 15.5 19.8H10.8C9.7 19.8 8.6 19.4 7.7 18.7L6.6 17.8H3"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Payment line */}
                    <path
                        d="M13 10.5H18.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />

                </svg>
            ) : duotone ? (
                // ===== DUOTONE FILLED =====
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>

                    <circle cx="17" cy="7" r="3.5" fill="currentColor" opacity="0.5" />

                    <path
                        d="M3 14.5H8.2C8.7 14.5 9.2 14.7 9.6 15.1L10.8 16.2C11.2 16.6 11.7 16.8 12.2 16.8H15.5C16.3 16.8 17 17.5 17 18.3C17 19.1 16.3 19.8 15.5 19.8H10.8C9.7 19.8 8.6 19.4 7.7 18.7L6.6 17.8H3V14.5Z"
                        fill="currentColor"
                    />

                </svg>
            ) : (
                // ===== SOLID VERSION =====
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className}>

                    <circle cx="17" cy="7" r="3.5" fill="currentColor" />

                    <path
                        d="M3 14.5H8.2C8.7 14.5 9.2 14.7 9.6 15.1L10.8 16.2C11.2 16.6 11.7 16.8 12.2 16.8H15.5C16.3 16.8 17 17.5 17 18.3C17 19.1 16.3 19.8 15.5 19.8H10.8C9.7 19.8 8.6 19.4 7.7 18.7L6.6 17.8H3V14.5Z"
                        fill="currentColor"
                    />

                </svg>
            )}
        </>
    );
};

export default PackagePaymentIcon;
