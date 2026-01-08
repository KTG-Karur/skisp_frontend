import { FC } from 'react';

interface IconDollarProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconDollar: FC<IconDollarProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <circle
                        opacity={duotone ? '0.5' : '1'}
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M12 6V18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z"
                        fill={duotone ? 'currentColor' : 'currentColor'}
                    />
                    <path
                        d="M12 6V18"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M15 9.5C15 8.11929 13.6569 7 12 7C10.3431 7 9 8.11929 9 9.5C9 10.8807 10.3431 12 12 12C13.6569 12 15 13.1193 15 14.5C15 15.8807 13.6569 17 12 17C10.3431 17 9 15.8807 9 14.5"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            )}
        </>
    );
};

export default IconDollar;