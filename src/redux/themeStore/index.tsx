import { combineReducers, configureStore } from '@reduxjs/toolkit';
import themeConfigSlice from './themeConfigSlice';
import DepartmentSlice from '../departmentSlice';
import EmployeeSlice from '../employeeSlice';
import RoleSlice from '../roleSlice';
import PageSlice from '../pageSlice';
import ReportSlice from '../reportSlice';
import LoginSlice from '../loginSlice';
import UplodeSlice from '../uplodeSlice';
import ComapnySlice from '../companySlice';
import CompanyCodeSlice from '../companCodeSlice';
import PurposeOfVisitSlice from '../purposeOfVisitSlice';
import VisitorSlice from '../visitorSlice';
import ProductSlice from '../productSlice';
import ExpoSlice from '../expoSlice';
import ProductEnquirySlice from '../productEnquirySlice';
import DashboardSlice from '../dashboardSlice';
import ProviderSlice from '../providerSlice';
import CategorySlice from '../catogerySlice';
import TaskSlice from '../taskSlice';
import NotificationSlice from '../notificationSlice';
import paymentReportSlice from '../paymentReportSlice';
import syncSlice from '../syncSlice';
import PlanSlice from '../planSlice';

const rootReducer = combineReducers({
    themeConfig: themeConfigSlice,
    DepartmentSlice,
    EmployeeSlice,
    RoleSlice,
    PageSlice,
    ReportSlice,
    LoginSlice,
    UplodeSlice,
    ComapnySlice,
    CompanyCodeSlice,
    PurposeOfVisitSlice,
    ProductSlice,
    ProductEnquirySlice,
    VisitorSlice,
    ExpoSlice,
    DashboardSlice,
    ProviderSlice,
    CategorySlice,
    TaskSlice,
    NotificationSlice,
    syncSlice,
    PlanSlice,
    PaymentReportSlice: paymentReportSlice,
});

const store = configureStore({
    reducer: rootReducer,
});

export default store;

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export type IRootState = ReturnType<typeof rootReducer>;
