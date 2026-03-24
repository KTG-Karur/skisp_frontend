// components/Icon/IconRoute.jsx
const IconRoute = ({ className = '', ...props }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`w-5 h-5 ${className}`}
            {...props}
        >
            <circle cx="6" cy="6" r="3" />
            <circle cx="18" cy="18" r="3" />
            <path d="M6 6v8c0 2.5 2 4 4 4h4c2 0 4-1.5 4-4v-4" />
        </svg>
    );
};

export default IconRoute;

