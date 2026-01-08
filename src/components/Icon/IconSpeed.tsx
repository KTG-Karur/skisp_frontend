import { FC } from 'react';

interface IconSpeedProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconSpeed: FC<IconSpeedProps> = ({ className, fill = false, duotone = true }) => {
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
                        d="M13.4142 10.5858C14.1953 11.3668 14.1953 12.6332 13.4142 13.4142C12.6332 14.1953 11.3668 14.1953 10.5858 13.4142C9.80474 12.6332 9.80474 11.3668 10.5858 10.5858C11.3668 9.80474 12.6332 9.80474 13.4142 10.5858Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M8 15.6569L10.3431 13.3137"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M14.8284 9.17157L17.1716 6.82843"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M8 8.34315L10.3431 10.6863"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        d="M14.8284 14.8284L17.1716 17.1716"
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
                        d="M13.4142 10.5858C14.1953 11.3668 14.1953 12.6332 13.4142 13.4142C12.6332 14.1953 11.3668 14.1953 10.5858 13.4142C9.80474 12.6332 9.80474 11.3668 10.5858 10.5858C11.3668 9.80474 12.6332 9.80474 13.4142 10.5858Z"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M8 15.6569L10.3431 13.3137M14.8284 9.17157L17.1716 6.82843M8 8.34315L10.3431 10.6863M14.8284 14.8284L17.1716 17.1716"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            )}
        </>
    );
};

export default IconSpeed;