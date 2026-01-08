import { FC } from 'react';

interface IconUploadProps {
    className?: string;
    fill?: boolean;
    duotone?: boolean;
}

const IconUpload: FC<IconUploadProps> = ({ className, fill = false, duotone = true }) => {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
            <path d="M12 16V4M12 4L8 8M12 4L16 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path opacity={duotone ? '0.5' : '1'} d="M4 16V18.4C4 19.2837 4 19.7255 4.21846 20.0334C4.43693 20.3413 4.82475 20.4423 5.60039 20.6441C7.43726 21.1157 9.41845 21.25 12 21.25C14.5816 21.25 16.5627 21.1157 18.3996 20.6441C19.1753 20.4423 19.5631 20.3413 19.7815 20.0334C20 19.7255 20 19.2837 20 18.4V16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
    );
};

export default IconUpload;