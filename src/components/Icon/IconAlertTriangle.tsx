import { FC } from 'react';

interface IconAlertTriangleProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconAlertTriangle: FC<IconAlertTriangleProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M21.546 19.0012L13.204 4.00023C12.342 2.46223 10.658 2.46223 9.79599 4.00023L1.45399 19.0012C0.588993 20.5442 1.63299 22.5002 3.35799 22.5002H19.642C21.367 22.5002 22.411 20.5442 21.546 19.0012Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path d="M12 9V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 17.01L12.01 16.9989" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M21.546 19.0012L13.204 4.00023C12.342 2.46223 10.658 2.46223 9.79599 4.00023L1.45399 19.0012C0.588993 20.5442 1.63299 22.5002 3.35799 22.5002H19.642C21.367 22.5002 22.411 20.5442 21.546 19.0012Z"
                        fill="currentColor"
                    />
                    <path
                        d="M12 9V13"
                        stroke={duotone ? 'white' : 'currentColor'}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M12 17.01L12.01 16.9989"
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

export default IconAlertTriangle;