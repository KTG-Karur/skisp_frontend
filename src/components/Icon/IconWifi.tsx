import { FC } from 'react';

interface IconWifiProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconWifi: FC<IconWifiProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path opacity={duotone ? '0.5' : '1'} d="M18.437 10.8035C16.6195 9.34828 14.3824 8.5 12 8.5C9.61765 8.5 7.38055 9.34828 5.56298 10.8035" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M21.9168 8.28383C19.5304 6.33059 16.6117 5.25 13.5 5.25H10.5C7.38827 5.25 4.46963 6.33059 2.08317 8.28383" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path opacity={duotone ? '0.5' : '1'} d="M15.4957 13.3056C14.5195 12.4686 13.2924 12 12 12C10.7076 12 9.48045 12.4686 8.50427 13.3056" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="12" cy="18" r="1" fill="currentColor"/>
        </svg>
    );
};

export default IconWifi;