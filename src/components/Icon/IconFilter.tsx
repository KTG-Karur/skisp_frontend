import { FC } from 'react';

interface IconFilterProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconFilter: FC<IconFilterProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path
                d="M3 5H21"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={duotone ? '0.5' : '1'}
            />
            <path
                d="M6 12H18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={duotone ? '0.5' : '1'}
            />
            <path
                d="M10 19H14"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default IconFilter;