import { FC } from 'react';

interface IconMenuLocationProps {
    className?: string;
}

const IconMenuLocation: FC<IconMenuLocationProps> = ({ className }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                opacity="0.5"
                d="M12 2C7.58172 2 4 5.58172 4 10C4 13.4329 6.10778 16.5688 10.7139 20.126C11.554 20.8065 12.446 21.5 13.2861 20.8065C17.8922 16.5688 20 13.4329 20 10C20 5.58172 16.4183 2 12 2Z"
                fill="currentColor"
            />
            <path
                d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                fill="currentColor"
            />
        </svg>
    );
};

export default IconMenuLocation;