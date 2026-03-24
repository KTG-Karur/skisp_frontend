// IconChevronDown.jsx
import { FC } from 'react';

interface IconChevronDownProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconChevronDown: FC<IconChevronDownProps> = ({ className, fill = false, duotone = true }) => {
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
            <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
    );
};

export default IconChevronDown;