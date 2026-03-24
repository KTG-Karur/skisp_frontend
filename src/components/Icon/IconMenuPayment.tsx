import { FC } from 'react';

interface IconMenuPaymentProps {
    className?: string;
}

const IconMenuPayment: FC<IconMenuPaymentProps> = ({ className }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path
                d="M2 8.50455C2 5.81875 2 4.47585 2.87868 3.59641C3.75736 2.71698 5.17157 2.71698 8 2.71698H16C18.8284 2.71698 20.2426 2.71698 21.1213 3.59641C22 4.47585 22 5.81875 22 8.50455V15.4955C22 18.1812 22 19.5241 21.1213 20.4036C20.2426 21.283 18.8284 21.283 16 21.283H8C5.17157 21.283 3.75736 21.283 2.87868 20.4036C2 19.5241 2 18.1812 2 15.4955V8.50455Z"
                fill="currentColor"
                opacity="0.5"
            />
            <path
                d="M2 9H22V11H2V9Z"
                fill="currentColor"
            />
            <circle cx="6" cy="15" r="1" fill="white" />
            <circle cx="10" cy="15" r="1" fill="white" />
            <circle cx="14" cy="15" r="1" fill="white" />
            <circle cx="18" cy="15" r="1" fill="white" />
        </svg>
    );
};

export default IconMenuPayment;