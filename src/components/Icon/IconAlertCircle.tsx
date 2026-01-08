import { FC } from 'react';

interface IconAlertCircleProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconAlertCircle: FC<IconAlertCircleProps> = ({ className, fill = false, duotone = true }) => {
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
                        d="M12 7V13"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <circle
                        cx="12"
                        cy="16"
                        r="1"
                        fill="currentColor"
                    />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <circle
                        opacity={duotone ? '0.5' : '1'}
                        cx="12"
                        cy="12"
                        r="10"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                    />
                    <path
                        d="M12 7V13"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                    <circle
                        cx="12"
                        cy="16"
                        r="1"
                        fill={duotone ? 'white' : 'currentColor'}
                    />
                </svg>
            )}
        </>
    );
};

export default IconAlertCircle;