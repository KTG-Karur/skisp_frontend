import React, { Suspense } from 'react';
import PrivateRoute from './PrivateRoute';
import Root from './Root';
import { useRoutes } from 'react-router-dom';
import DefaultLayout from '../components/Layouts/DefaultLayout';

import {
    Index,
    Employee,
    Role,
    CompanyInfo,
    CustomerInvoice,
    //new asf - ev
    Customer,
    Banner,
    //new VMS
    Plan,
    Staff,
    Department,
    Provider,
    Category,
    //old
    ContactUsBoxed,
    ContactUsCover,
    ComingSoonBoxed,
    ComingSoonCover,
    ERROR404,
    ERROR500,
    ERROR503,
    Maintenence,
    LoginBoxed,
    Payment,
    NotificationSettings,
    Razorpay,
    Invoice,
    Bill,
    PrintTask,
    PaymentReport,
    PlanReport,
    PlanReportpdf,
    PaymentHistory,
} from './Route_Menu';

const loading = () => <div className=""></div>;

type LoadComponentProps = {
    component: React.LazyExoticComponent<() => JSX.Element>;
};

const LoadComponent = ({ component: Component }: LoadComponentProps) => (
    <Suspense fallback={loading()}>
        <Component />
    </Suspense>
);

// const AllRoutes = () => {
//     const { appSelector } = useRedux();

//     const { layout } = appSelector((state) => ({
//         layout: state.Layout,
//     }));

//     const getLayout = () => {
//         let layoutCls: React.ComponentType = VerticalLayout;

//         switch (layout.layoutType) {
//             case LayoutTypes.LAYOUT_HORIZONTAL:
//                 layoutCls = defaultLayout;
//                 break;
//             default:
//                 layoutCls = VerticalLayout;
//                 break;
//         }
//         return layoutCls;
//     };
//     let Layout = getLayout();
//     return useRoutes([
//         { path: '/', element: <Root /> },
//         {
//             path: 'error-404',
//             element: <LoadComponent component={Error404} />,
//         },
//         {
//             path: 'error-500',
//             element: <LoadComponent component={Error500} />,
//         },
//         {
//             // public routes
//             path: '/',
//             element: <DefaultLayout />,
//             children: [
//                 {
//                     path: 'auth',
//                     children: [
//                         { path: 'login', element: <LoadComponent component={Login} /> },
//                         { path: 'register', element: <LoadComponent component={Register} /> },
//                         { path: 'confirm', element: <LoadComponent component={Confirm} /> },
//                         { path: 'forget-password', element: <LoadComponent component={ForgetPassword} /> },
//                         { path: 'lock-screen', element: <LoadComponent component={LockScreen} /> },
//                         { path: 'logout', element: <LoadComponent component={Logout} /> },
//                     ],
//                 },
//                 {
//                     path: 'maintenance',
//                     element: <LoadComponent component={Maintenance} />,
//                 },
//                 {
//                     path: 'coming-soon',
//                     element: <LoadComponent component={ComingSoon} />,
//                 },
//                 {
//                     path: 'landing',
//                     element: <LoadComponent component={Landing} />,
//                 },
//             ],
//         },
//         {
//             // auth protected routes
//             path: '/',
//             element: <PrivateRoute component={Layout} />,
//             children: [
//                 {
//                     path: '*',
//                     element: <LoadComponent component={Error404} />,
//                 },
//                 {
//                     path: 'dashboard',
//                     element: <LoadComponent component={DashBoard} />,
//                 },
//                 {
//                     path: 'feathericons',
//                     element: <LoadComponent component={FeatherIcons} />,
//                 },
//                 {
//                     path: 'report',
//                     children: [
//                         {
//                             path: 'order-history',
//                             element: <LoadComponent component={orderHistory} />,
//                         },
//                         {
//                             path: 'print-tag',
//                             element: <LoadComponent component={printTag} />,
//                         },
//                         {
//                             path: 'print-estimate',
//                             element: <LoadComponent component={printEstimate} />,
//                         },
//                         {
//                             path: 'order-report',
//                             element: <LoadComponent component={orderReport} />,
//                         },
//                         {
//                             path: 'revenue-report',
//                             element: <LoadComponent component={revenueReport} />,
//                         },
//                     ],
//                 },
//                 {
//                     path: 'settings',
//                     children: [
//                         {
//                             path: 'company-info',
//                             element: <LoadComponent component={companiInfo} />,
//                         },
//                         {
//                             path: 'role',
//                             element: <LoadComponent component={Role} />,
//                         },
//                     ],
//                 },
//                 {
//                     path: 'order',
//                     children: [
//                         {
//                             path: 'pickup-orders',
//                             element: <LoadComponent component={PickupOrder} />,
//                         },
//                         {
//                             path: 'create-order',
//                             element: <LoadComponent component={Createorder} />,
//                         },
//                         {
//                             path: 'manage-orders',
//                             element: <LoadComponent component={manageorder} />,
//                         },
//                         {
//                             path: 'payment',
//                             element: <LoadComponent component={payment} />,
//                         },
//                         {
//                             path: 'online-deliveries',
//                             element: <LoadComponent component={Deliveries} />,
//                         },
//                         {
//                             path: 'walkin-deliveries',
//                             element: <LoadComponent component={WalkinDeliveries} />,
//                         },
//                     ],
//                 },
//                 {
//                     path: 'master',
//                     children: [
//                         {
//                             path: 'designation',
//                             element: <LoadComponent component={Designation} />,
//                         },
//                         {
//                             path: 'staff',
//                             element: <LoadComponent component={Staff} />,
//                         },
//                         {
//                             path: 'service-type',
//                             element: <LoadComponent component={ServiceType} />,
//                         },
//                         {
//                             path: 'products',
//                             element: <LoadComponent component={Plan} />,
//                         },
//                         {
//                             path: 'customer',
//                             element: <LoadComponent component={customer} />,
//                         },
//                     ],
//                 },
//             ],
//         },
//     ]);
// };

// export { AllRoutes };

const routes = [
    // dashboard
    {
        path: '/',
        element: <Index />,
    },
    //new asf ev
    {
        path: '/master/provider',
        element: <Provider />,
    },
    {
        path: '/master/banner',
        element: <Banner />,
    },
    {
        path: '/master/category',
        element: <Category />,
    },
    {
        path: '/master/customer',
        element: <Customer />,
    },
    {
        path: '/master/plan',
        element: <Plan />,
    },
    {
        path: '/reports/payment-report',
        element: <PaymentReport />,
    },
    {
        path: '/reports/payment-history',
        element: <PaymentHistory />,
    },
    {
        path: '/invoice/customer-invoice',
        element: <CustomerInvoice />,
    },
    {
        path: '/reports/plan-report',
        element: <PlanReport />,
    },
    //old
    {
        path: '/master/staff',
        element: <Staff />,
    },
    {
        path: '/master/department',
        element: <Department />,
    },
    {
        path: '/join/payment',
        element: <Payment />,
    },
    {
        path: '/join/notification-settings',
        element: <NotificationSettings />,
    },

    {
        path: '/customers/invoices/:userId',
        element: <Invoice />,
    },
    {
        path: '/join/bill',
        element: <Bill />,
    },

    //old
    {
        path: '/master/employee',
        element: <Employee />,
    },
    {
        path: '/master/role',
        element: <Role />,
    },
    //new VMS public
    {
        path: '/master/products',
        element: <Plan />,
    },
    {
        path: '/settings/company-info',
        element: <CompanyInfo />,
    },
    {
        path: '/documents/print-task',
        element: <PrintTask />,
    },
    {
        path: '/documents/PlanReportpdf',
        element: <PlanReportpdf />,
    },
    // pages

    {
        path: '/pages/contact-us-boxed',
        element: <ContactUsBoxed />,
        layout: 'blank',
    },
    {
        path: '/pages/contact-us-cover',
        element: <ContactUsCover />,
        layout: 'blank',
    },
    {
        path: '/pages/coming-soon-boxed',
        element: <ComingSoonBoxed />,
        layout: 'blank',
    },
    {
        path: '/pages/coming-soon-cover',
        element: <ComingSoonCover />,
        layout: 'blank',
    },
    {
        path: '/pages/error404',
        element: <ERROR404 />,
        layout: 'blank',
    },
    {
        path: '/pages/error500',
        element: <ERROR500 />,
        layout: 'blank',
    },
    {
        path: '/pages/error503',
        element: <ERROR503 />,
        layout: 'blank',
    },
    {
        path: '/pages/maintenence',
        element: <Maintenence />,
        layout: 'blank',
    },
    {
        path: '*',
        element: <ERROR404 />,
        layout: 'blank',
    },
    //Authentication
    {
        path: '/auth/boxed-signin',
        element: <LoginBoxed />,
        layout: 'blank',
    },
    {
        path: 'razorpay/:userId',
        element: <Razorpay />,
        layout: 'blank',
    },
];

const dontCkeckRouts = [
    //new VMS
    //old
    {
        path: '/documents/print-task',
        element: <PrintTask />,
    },
    {
        path: '/invoice/customer-invoice',
        element: <CustomerInvoice />,
    },
    {
        path: '/pages/contact-us-boxed',
        element: <ContactUsBoxed />,
        layout: 'blank',
    },
    {
        path: '/pages/contact-us-cover',
        element: <ContactUsCover />,
        layout: 'blank',
    },
    {
        path: '/pages/coming-soon-boxed',
        element: <ComingSoonBoxed />,
        layout: 'blank',
    },
    {
        path: '/pages/coming-soon-cover',
        element: <ComingSoonCover />,
        layout: 'blank',
    },
    {
        path: '/pages/error404',
        element: <ERROR404 />,
        layout: 'blank',
    },
    {
        path: '/pages/error500',
        element: <ERROR500 />,
        layout: 'blank',
    },
    {
        path: '/pages/error503',
        element: <ERROR503 />,
        layout: 'blank',
    },
    {
        path: '/pages/maintenence',
        element: <Maintenence />,
        layout: 'blank',
    },
    {
        path: '*',
        element: <ERROR404 />,
        layout: 'blank',
    },
    //Authentication
    {
        path: '/auth/boxed-signin',
        element: <LoginBoxed />,
        layout: 'blank',
    },
    {
        path: '/join/razorpay/:userId',
        element: <Razorpay />,
        layout: 'blank',
    },
];

export { routes, dontCkeckRouts };
