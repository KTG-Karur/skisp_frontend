import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
    component: React.ComponentType;
}

const PublicRoute: React.FC<Props> = ({ component: Component }) => {
    const userDetails: any = localStorage.getItem('loginInfo');
    const localData: any = userDetails ? JSON.parse(userDetails) : false;

   if (!localData) {
        return <Navigate to="/auth/boxed-signin" replace />;
    }

    return <Component />;
};

export default PublicRoute;
