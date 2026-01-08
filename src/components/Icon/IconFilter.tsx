import { FC } from 'react';

interface IconFilterProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconFilter: FC<IconFilterProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M14 20C14 21.1046 13.1046 22 12 22C10.8954 22 10 21.1046 10 20C10 18.8954 10.8954 18 12 18C13.1046 18 14 18.8954 14 20Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M22 4C22 5.10457 21.1046 6 20 6C18.8954 6 18 5.10457 18 4C18 2.89543 18.8954 2 20 2C21.1046 2 22 2.89543 22 4Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M6 12C6 13.1046 5.10457 14 4 14C2.89543 14 2 13.1046 2 12C2 10.8954 2.89543 10 4 10C5.10457 10 6 10.8954 6 12Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M8 18H10"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M21 6H19"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M3 10H2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M8 18L6 20"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M18 8L20 6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M14 20C14 21.1046 13.1046 22 12 22C10.8954 22 10 21.1046 10 20C10 18.8954 10.8954 18 12 18C13.1046 18 14 18.8954 14 20Z"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M22 4C22 5.10457 21.1046 6 20 6C18.8954 6 18 5.10457 18 4C18 2.89543 18.8954 2 20 2C21.1046 2 22 2.89543 22 4Z"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                    />
                    <path
                        d="M6 12C6 13.1046 5.10457 14 4 14C2.89543 14 2 13.1046 2 12C2 10.8954 2.89543 10 4 10C5.10457 10 6 10.8954 6 12Z"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M8 18H10"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M21 6H19"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M3 10H2"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M8 18L6 20"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M18 8L20 6"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            )}
        </>
    );
};

export default IconFilter;