import React from 'react';
import { Navigate } from 'react-router-dom';

interface Props {
    component: React.ComponentType;
}

const PrivateRoute: React.FC<Props> = ({ component: Component }) => {
    const token = localStorage.getItem('token'); // or localStorage
    return token ? <Component /> : <Navigate to="/auth/boxed-signin" replace />;
};

export default PrivateRoute;
