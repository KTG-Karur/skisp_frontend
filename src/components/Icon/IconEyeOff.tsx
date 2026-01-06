import { FC } from 'react';

interface IconEyeOffProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconEyeOff: FC<IconEyeOffProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <>
            {!fill ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M20.7499 15.2957C21.5998 14.1915 22.0248 13.6394 22.0248 12C22.0248 10.3606 21.5998 9.80853 20.7499 8.70433C19.0528 6.49956 16.2067 4 12.0248 4C7.8429 4 4.99675 6.49956 3.29968 8.70433C2.44975 9.80853 2.02478 10.3606 2.02478 12C2.02478 13.6394 2.44975 14.1915 3.29968 15.2957C4.99675 17.5004 7.8429 20 12.0248 20C16.2067 20 19.0528 17.5004 20.7499 15.2957Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />
                    <path
                        d="M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
                    <path
                        opacity={duotone ? '0.5' : '1'}
                        d="M22.0248 12C22.0248 13.6394 21.5998 14.1915 20.7499 15.2957C19.0528 17.5004 16.2067 20 12.0248 20C7.8429 20 4.99675 17.5004 3.29968 15.2957C2.44975 14.1915 2.02478 13.6394 2.02478 12C2.02478 10.3606 2.44975 9.80853 3.29968 8.70433C4.99675 6.49956 7.8429 4 12.0248 4C16.2067 4 19.0528 6.49956 20.7499 8.70433C21.5998 9.80853 22.0248 10.3606 22.0248 12Z"
                        fill="currentColor"
                    />
                    <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.75 12C15.75 14.0711 14.0711 15.75 12 15.75C9.92893 15.75 8.25 14.0711 8.25 12C8.25 9.92893 9.92893 8.25 12 8.25C14.0711 8.25 15.75 9.92893 15.75 12ZM14.25 12C14.25 13.2426 13.2426 14.25 12 14.25C10.7574 14.25 9.75 13.2426 9.75 12C9.75 10.7574 10.7574 9.75 12 9.75C13.2426 9.75 14.25 10.7574 14.25 12Z"
                        fill="currentColor"
                    />
                    <path
                        d="M18 6L6 18"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                    />
                </svg>
            )}
        </>
    );
};

export default IconEyeOff;