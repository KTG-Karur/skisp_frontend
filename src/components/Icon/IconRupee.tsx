import { FC } from 'react';

interface IconRupeeProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconRupee: FC<IconRupeeProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            {/* Top horizontal line */}
            <path d="M7 6H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

            {/* Second horizontal line */}
            <path d="M7 9H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

            {/* Vertical + curve part */}
            <path d="M7 6C12 6 12 12 7 12H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />

            {/* Diagonal leg */}
            <path d="M9 12L16 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
};

export default IconRupee;
