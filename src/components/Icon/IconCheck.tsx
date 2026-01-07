import { FC } from 'react';

interface IconCheckProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconCheck: FC<IconCheckProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {fill ? (
                // Filled version
                <path 
                    fillRule="evenodd" 
                    clipRule="evenodd" 
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM16.0303 8.96967C16.3232 9.26256 16.3232 9.73744 16.0303 10.0303L11.0303 15.0303C10.7374 15.3232 10.2626 15.3232 9.96967 15.0303L7.96967 13.0303C7.67678 12.7374 7.67678 12.2626 7.96967 11.9697C8.26256 11.6768 8.73744 11.6768 9.03033 11.9697L10.5 13.4393L14.9697 8.96967C15.2626 8.67678 15.7374 8.67678 16.0303 8.96967Z" 
                    fill="currentColor"
                />
            ) : duotone ? (
                // Duotone version (stroke with outline)
                <>
                    <circle 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        fill="none"
                    />
                    <path 
                        d="M8.5 12.5L10.5 14.5L15.5 9.5" 
                        stroke="currentColor" 
                        strokeWidth="1.5" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    />
                </>
            ) : (
                // Simple checkmark version
                <path 
                    d="M4 12.6111L8.92308 17.5L20 6.5" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                />
            )}
        </svg>
    );
};

export default IconCheck;