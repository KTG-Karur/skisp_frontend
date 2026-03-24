import { FC } from 'react';

interface IconMenuBuildingProps {
    className?: string;
}

const IconMenuBuilding: FC<IconMenuBuildingProps> = ({ className }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                d="M2 21H22"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                opacity="0.5"
                d="M5 21V7C5 5.11438 5 4.17157 5.58579 3.58579C6.17157 3 7.11438 3 9 3H15C16.8856 3 17.8284 3 18.4142 3.58579C19 4.17157 19 5.11438 19 7V21"
                fill="currentColor"
            />
            <path
                d="M10 7H14"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M10 11H14"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <path
                d="M10 15H14"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
        </svg>
    );
};

export default IconMenuBuilding;