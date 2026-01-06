import { PropsWithChildren } from 'react';
import App from '../../App';
import { Navigate } from 'react-router-dom';

const BlankLayout = ({ children }: PropsWithChildren) => {
    const userDetails: any = localStorage.getItem('loginInfo');
    const localData: any = userDetails ? JSON.parse(userDetails) : false;

    if (localData) {
        return <Navigate to="/" replace />;
    }

    return (
        <App>
            <div className="text-black dark:text-white-dark min-h-screen">{children} </div>
        </App>
    );
};

export default BlankLayout;
