import { createBrowserRouter, Navigate } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import PrivateRoute from './PrivateRoute';
import PublicRoute from './PublicRoute';
import { routes } from './routes';
import ErrorBoundary from '../pages/ErrorBoundary';
import Error500 from '../pages/Pages/Error500';

const finalRoutes = routes.map((route: any) => {

    return {
        ...route,
        element: route.layout === 'blank' ? <BlankLayout>{route.element}</BlankLayout> : <DefaultLayout>{route.element}</DefaultLayout>,
    };
});

const router = createBrowserRouter(finalRoutes);

export default router;
