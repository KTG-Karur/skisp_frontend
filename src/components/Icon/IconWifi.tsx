import { FC } from 'react';

interface IconWifiProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconWifi: FC<IconWifiProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M5 12.3212C8.25 9.39516 15.75 9.39516 19 12.3212"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M2 9.00006C7.5 4.00006 16.5 4.00006 22 9.00006"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M8 15.6793C10.25 13.866 13.75 13.866 16 15.6793"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 18.5C12.5523 18.5 13 18.0523 13 17.5C13 16.9477 12.5523 16.5 12 16.5C11.4477 16.5 11 16.9477 11 17.5C11 18.0523 11.4477 18.5 12 18.5Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M5 12.3212C8.25 9.39516 15.75 9.39516 19 12.3212"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M2 9.00006C7.5 4.00006 16.5 4.00006 22 9.00006"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M8 15.6793C10.25 13.866 13.75 13.866 16 15.6793"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 18.5C12.5523 18.5 13 18.0523 13 17.5C13 16.9477 12.5523 16.5 12 16.5C11.4477 16.5 11 16.9477 11 17.5C11 18.0523 11.4477 18.5 12 18.5Z"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                    />
                </svg>
            )}
        </>
    );
};

export default IconWifi;