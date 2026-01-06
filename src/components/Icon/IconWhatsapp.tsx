import { FC } from 'react';

interface IconWhatsAppProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconWhatsApp: FC<IconWhatsAppProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    {/* Outer circle */}
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.3789 2.27913 14.6925 2.78356 15.8869L2 22L8.11311 21.2164C9.30753 21.7209 10.6211 22 12 22Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                    />
                    {/* WhatsApp speech bubble */}
                    <path
                        d="M7 9.5C7 7.567 8.567 6 10.5 6H13.5C15.433 6 17 7.567 17 9.5C17 11.433 15.433 13 13.5 13H13C12.4477 13 12 13.4477 12 14V14.5C12 15.0523 12.4477 15.5 13 15.5H13.5C16.5376 15.5 19 13.0376 19 10C19 6.96243 16.5376 4.5 13.5 4.5H10.5C7.46243 4.5 5 6.96243 5 10C5 10.5523 5.44772 11 6 11C6.55228 11 7 10.5523 7 10V9.5Z"
                        fill="currentColor"
                    />
                    {/* Dots */}
                    <circle cx="9.5" cy="9.5" r="1" fill="currentColor" />
                    <circle cx="12.5" cy="9.5" r="1" fill="currentColor" />
                    <circle cx="15.5" cy="9.5" r="1" fill="currentColor" />
                </svg>
            ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    {/* Outer circle - filled */}
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.3789 2.27913 14.6925 2.78356 15.8869L2 22L8.11311 21.2164C9.30753 21.7209 10.6211 22 12 22Z"
                        fill="currentColor"
                    />
                    {/* WhatsApp speech bubble - filled white */}
                    <path
                        d="M7 9.5C7 7.567 8.567 6 10.5 6H13.5C15.433 6 17 7.567 17 9.5C17 11.433 15.433 13 13.5 13H13C12.4477 13 12 13.4477 12 14V14.5C12 15.0523 12.4477 15.5 13 15.5H13.5C16.5376 15.5 19 13.0376 19 10C19 6.96243 16.5376 4.5 13.5 4.5H10.5C7.46243 4.5 5 6.96243 5 10C5 10.5523 5.44772 11 6 11C6.55228 11 7 10.5523 7 10V9.5Z"
                        fill="white"
                    />
                    {/* Dots - filled white */}
                    <circle cx="9.5" cy="9.5" r="1" fill="white" />
                    <circle cx="12.5" cy="9.5" r="1" fill="white" />
                    <circle cx="15.5" cy="9.5" r="1" fill="white" />
                </svg>
            )}
        </>
    );
};

export default IconWhatsApp;