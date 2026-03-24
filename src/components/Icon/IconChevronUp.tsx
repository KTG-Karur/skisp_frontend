// IconChevronUp.jsx
import { FC } from 'react';

interface IconChevronUpProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconChevronUp: FC<IconChevronUpProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth="1.5" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <polyline points="18 15 12 9 6 15"></polyline>
        </svg>
    );
};

export default IconChevronUp;