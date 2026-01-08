import { useState, Fragment, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconRestore from '../../../components/Icon/IconRestore';
import IconEye from '../../../components/Icon/IconEye';
import IconUserPlus from '../../../components/Icon/IconUserPlus';
import IconSettings from '../../../components/Icon/IconSettings';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconWifi from '../../../components/Icon/IconWifi';
import IconPhone from '../../../components/Icon/IconPhone';
import IconMail from '../../../components/Icon/IconMail';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../../util/ModelViewBox';
import FormLayout from '../../../util/formLayout';
import { showMessage } from '../../../util/AllFunction';
import _ from 'lodash';

// Static customer data
const staticCustomers = [
    {
        id: 1,
        req_id: 'add_001',
        user_id: 'testuser01',
        user_pass_type: 'specify',
        user_pass: 'password123',
        account_validity: 'num_days_from_acct_creation',
        validity_data: '30',
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        first_login_before_ts: '0',
        delete_expired_acct: 'enable',
        del_q_exceeded_acct: 'enable',
        pri_bandwidth_plan_name: 'Guest WiFi',
        ext_bandwidth_plan_name: 'Guest WiFi',
        num_mac_binding: '1',
        num_conc_logins: '1',
        login_control: 'default',
        login_proto: 'plogin',
        acct_ref: 'REF001',
        first_name: 'John',
        last_name: 'Doe',
        email_addr: 'john.doe@example.com',
        postal_addr: '123 Main Street, New York, NY',
        mobile_num: '9876543210',
        phone_num: '0123456789',
        isActive: 1,
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 2,
        req_id: 'add_002',
        user_id: 'businessuser02',
        user_pass_type: 'specify',
        user_pass: 'securepass456',
        account_validity: 'num_days_from_acct_creation',
        validity_data: '60',
        expiry_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        first_login_before_ts: '0',
        delete_expired_acct: 'enable',
        del_q_exceeded_acct: 'enable',
        pri_bandwidth_plan_name: 'Premium WiFi',
        ext_bandwidth_plan_name: 'Premium WiFi',
        num_mac_binding: '3',
        num_conc_logins: '3',
        login_control: 'strict',
        login_proto: 'radius',
        acct_ref: 'REF002',
        first_name: 'Sarah',
        last_name: 'Smith',
        email_addr: 'sarah.smith@business.com',
        postal_addr: '456 Business Ave, Chicago, IL',
        mobile_num: '9876543211',
        phone_num: '',
        isActive: 1,
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 3,
        req_id: 'add_003',
        user_id: 'guestuser03',
        user_pass_type: 'specify',
        user_pass: 'guestpass789',
        account_validity: 'num_days_from_acct_creation',
        validity_data: '7',
        expiry_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Expired
        first_login_before_ts: '0',
        delete_expired_acct: 'enable',
        del_q_exceeded_acct: 'enable',
        pri_bandwidth_plan_name: 'Guest WiFi',
        ext_bandwidth_plan_name: 'Guest WiFi',
        num_mac_binding: '1',
        num_conc_logins: '1',
        login_control: 'default',
        login_proto: 'voucher',
        acct_ref: 'REF003',
        first_name: 'Robert',
        last_name: 'Johnson',
        email_addr: 'robert.j@example.com',
        postal_addr: '789 Park Road, Miami, FL',
        mobile_num: '9876543212',
        phone_num: '',
        isActive: 0, // Deleted
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 4,
        req_id: 'add_004',
        user_id: 'enterprise04',
        user_pass_type: 'specify',
        user_pass: 'enterprise@123',
        account_validity: 'num_days_from_acct_creation',
        validity_data: '90',
        expiry_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
        first_login_before_ts: '0',
        delete_expired_acct: 'disable',
        del_q_exceeded_acct: 'disable',
        pri_bandwidth_plan_name: 'Business WiFi',
        ext_bandwidth_plan_name: 'Business WiFi',
        num_mac_binding: '5',
        num_conc_logins: '5',
        login_control: 'enterprise',
        login_proto: 'radius',
        acct_ref: 'REF004',
        first_name: 'Michael',
        last_name: 'Chen',
        email_addr: 'michael.chen@enterprise.com',
        postal_addr: '101 Corporate Blvd, San Francisco, CA',
        mobile_num: '9876543213',
        phone_num: '0123456790',
        isActive: 1,
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 5,
        req_id: 'add_005',
        user_id: 'student05',
        user_pass_type: 'specify',
        user_pass: 'studentpass',
        account_validity: 'num_days_from_acct_creation',
        validity_data: '365',
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        first_login_before_ts: '0',
        delete_expired_acct: 'enable',
        del_q_exceeded_acct: 'enable',
        pri_bandwidth_plan_name: 'Unlimited WiFi',
        ext_bandwidth_plan_name: 'Unlimited WiFi',
        num_mac_binding: '2',
        num_conc_logins: '2',
        login_control: 'default',
        login_proto: 'plogin',
        acct_ref: 'REF005',
        first_name: 'Emma',
        last_name: 'Wilson',
        email_addr: 'emma.wilson@university.edu',
        postal_addr: '222 College Street, Boston, MA',
        mobile_num: '9876543214',
        phone_num: '',
        isActive: 1,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 6,
        req_id: 'add_006',
        user_id: 'hotelguest06',
        user_pass_type: 'specify',
        user_pass: 'hotel@123',
        account_validity: 'num_days_from_acct_creation',
        validity_data: '2',
        expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        first_login_before_ts: '0',
        delete_expired_acct: 'enable',
        del_q_exceeded_acct: 'enable',
        pri_bandwidth_plan_name: 'Guest WiFi',
        ext_bandwidth_plan_name: 'Guest WiFi',
        num_mac_binding: '1',
        num_conc_logins: '1',
        login_control: 'hotel',
        login_proto: 'voucher',
        acct_ref: 'REF006',
        first_name: 'David',
        last_name: 'Brown',
        email_addr: 'david.b@traveler.com',
        postal_addr: '333 Resort Way, Las Vegas, NV',
        mobile_num: '9876543215',
        phone_num: '',
        isActive: 1,
        created_at: new Date().toISOString(),
    },
    {
        id: 7,
        req_id: 'add_007',
        user_id: 'conference07',
        user_pass_type: 'specify',
        user_pass: 'conf@2024',
        account_validity: 'specific_date',
        validity_data: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        expiry_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        first_login_before_ts: '0',
        delete_expired_acct: 'enable',
        del_q_exceeded_acct: 'enable',
        pri_bandwidth_plan_name: 'Premium WiFi',
        ext_bandwidth_plan_name: 'Premium WiFi',
        num_mac_binding: '1',
        num_conc_logins: '1',
        login_control: 'conference',
        login_proto: 'plogin',
        acct_ref: 'REF007',
        first_name: 'Lisa',
        last_name: 'Taylor',
        email_addr: 'lisa.t@conference.com',
        postal_addr: '444 Convention Center, Austin, TX',
        mobile_num: '9876543216',
        phone_num: '0123456791',
        isActive: 0,
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
        id: 8,
        req_id: 'add_008',
        user_id: 'cafeuser08',
        user_pass_type: 'specify',
        user_pass: 'coffee123',
        account_validity: 'num_days_from_acct_creation',
        validity_data: '1',
        expiry_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        first_login_before_ts: '0',
        delete_expired_acct: 'enable',
        del_q_exceeded_acct: 'enable',
        pri_bandwidth_plan_name: 'Guest WiFi',
        ext_bandwidth_plan_name: 'Guest WiFi',
        num_mac_binding: '1',
        num_conc_logins: '1',
        login_control: 'default',
        login_proto: 'voucher',
        acct_ref: 'REF008',
        first_name: 'James',
        last_name: 'Miller',
        email_addr: 'james.m@cafe.com',
        postal_addr: '555 Coffee Street, Seattle, WA',
        mobile_num: '9876543217',
        phone_num: '',
        isActive: 1,
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    },
];

// Form container configuration
const FormContainer = [
    {
        type: 'row',
        className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
        children: [
            {
                type: 'input',
                name: 'user_id',
                label: 'User ID *',
                placeholder: 'Enter unique user ID',
                required: true,
                className: 'form-input',
                colSpan: 'col-span-1',
            },
            {
                type: 'select',
                name: 'user_pass_type',
                label: 'Password Type *',
                options: [
                    { value: 'specify', label: 'Specify Password' },
                    { value: 'auto', label: 'Auto Generate' },
                    { value: 'none', label: 'No Password' },
                ],
                required: true,
                className: 'form-select',
                colSpan: 'col-span-1',
            },
        ],
    },
    {
        type: 'row',
        className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
        children: [
            {
                type: 'input',
                name: 'user_pass',
                label: 'Password *',
                placeholder: 'Enter password',
                required: true,
                className: 'form-input',
                colSpan: 'col-span-1',
                showCondition: { field: 'user_pass_type', value: 'specify' },
            },
            {
                type: 'select',
                name: 'account_validity',
                label: 'Account Validity *',
                options: [
                    { value: 'num_days_from_acct_creation', label: 'Number of Days' },
                    { value: 'specific_date', label: 'Specific Date' },
                    { value: 'unlimited', label: 'Unlimited' },
                ],
                required: true,
                className: 'form-select',
                colSpan: 'col-span-1',
            },
        ],
    },
    {
        type: 'row',
        className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
        children: [
            {
                type: 'input',
                name: 'validity_data',
                label: 'Validity Days/Date *',
                placeholder: 'Enter number of days or select date',
                required: true,
                className: 'form-input',
                colSpan: 'col-span-1',
                inputType: (state) => (state.account_validity === 'specific_date' ? 'date' : 'number'),
            },
            {
                type: 'input',
                name: 'acct_ref',
                label: 'Account Reference',
                placeholder: 'Enter account reference',
                className: 'form-input',
                colSpan: 'col-span-1',
            },
        ],
    },
    {
        type: 'divider',
        text: 'Personal Information',
        className: 'my-4',
    },
    {
        type: 'row',
        className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
        children: [
            {
                type: 'input',
                name: 'first_name',
                label: 'First Name *',
                placeholder: 'Enter first name',
                required: true,
                className: 'form-input',
                colSpan: 'col-span-1',
            },
            {
                type: 'input',
                name: 'last_name',
                label: 'Last Name',
                placeholder: 'Enter last name',
                className: 'form-input',
                colSpan: 'col-span-1',
            },
        ],
    },
    {
        type: 'row',
        className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
        children: [
            {
                type: 'input',
                name: 'email_addr',
                label: 'Email Address *',
                placeholder: 'Enter email address',
                required: true,
                className: 'form-input',
                colSpan: 'col-span-1',
                inputType: 'email',
            },
            {
                type: 'input',
                name: 'mobile_num',
                label: 'Mobile Number',
                placeholder: 'Enter mobile number',
                className: 'form-input',
                colSpan: 'col-span-1',
                inputType: 'tel',
            },
        ],
    },
    {
        type: 'input',
        name: 'postal_addr',
        label: 'Postal Address',
        placeholder: 'Enter complete address',
        className: 'form-input',
        textArea: true,
        rows: 3,
    },
    {
        type: 'divider',
        text: 'Network Settings',
        className: 'my-4',
    },
    {
        type: 'row',
        className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
        children: [
            {
                type: 'select',
                name: 'pri_bandwidth_plan_name',
                label: 'Primary Bandwidth Plan *',
                options: [
                    { value: 'Guest WiFi', label: 'Guest WiFi' },
                    { value: 'Premium WiFi', label: 'Premium WiFi' },
                    { value: 'Business WiFi', label: 'Business WiFi' },
                    { value: 'Unlimited WiFi', label: 'Unlimited WiFi' },
                ],
                required: true,
                className: 'form-select',
                colSpan: 'col-span-1',
            },
            {
                type: 'select',
                name: 'ext_bandwidth_plan_name',
                label: 'External Bandwidth Plan *',
                options: [
                    { value: 'Guest WiFi', label: 'Guest WiFi' },
                    { value: 'Premium WiFi', label: 'Premium WiFi' },
                    { value: 'Business WiFi', label: 'Business WiFi' },
                    { value: 'Unlimited WiFi', label: 'Unlimited WiFi' },
                ],
                required: true,
                className: 'form-select',
                colSpan: 'col-span-1',
            },
        ],
    },
    {
        type: 'row',
        className: 'grid grid-cols-1 md:grid-cols-3 gap-6',
        children: [
            {
                type: 'input',
                name: 'num_mac_binding',
                label: 'MAC Binding Limit *',
                placeholder: 'Enter number',
                required: true,
                className: 'form-input',
                colSpan: 'col-span-1',
                inputType: 'number',
                min: 1,
            },
            {
                type: 'input',
                name: 'num_conc_logins',
                label: 'Concurrent Logins *',
                placeholder: 'Enter number',
                required: true,
                className: 'form-input',
                colSpan: 'col-span-1',
                inputType: 'number',
                min: 1,
            },
            {
                type: 'select',
                name: 'login_proto',
                label: 'Login Protocol *',
                options: [
                    { value: 'plogin', label: 'Portal Login' },
                    { value: 'radius', label: 'RADIUS' },
                    { value: 'voucher', label: 'Voucher' },
                ],
                required: true,
                className: 'form-select',
                colSpan: 'col-span-1',
            },
        ],
    },
    {
        type: 'row',
        className: 'grid grid-cols-1 md:grid-cols-2 gap-6',
        children: [
            {
                type: 'select',
                name: 'delete_expired_acct',
                label: 'Delete Expired Account',
                options: [
                    { value: 'enable', label: 'Enable' },
                    { value: 'disable', label: 'Disable' },
                ],
                className: 'form-select',
                colSpan: 'col-span-1',
            },
            {
                type: 'select',
                name: 'del_q_exceeded_acct',
                label: 'Delete Q Exceeded Account',
                options: [
                    { value: 'enable', label: 'Enable' },
                    { value: 'disable', label: 'Disable' },
                ],
                className: 'form-select',
                colSpan: 'col-span-1',
            },
        ],
    },
];

let isEdit = false;

const Index = () => {
    const dispatch = useDispatch();
    const [modal, setModal] = useState(false);
    const [viewModal, setViewModal] = useState(false);
    const [state, setState] = useState({
        req_id: '',
        user_id: '',
        user_pass_type: 'specify',
        user_pass: '',
        account_validity: 'num_days_from_acct_creation',
        validity_data: '30',
        first_login_before_ts: '0',
        delete_expired_acct: 'enable',
        del_q_exceeded_acct: 'enable',
        pri_bandwidth_plan_name: 'Guest WiFi',
        ext_bandwidth_plan_name: 'Guest WiFi',
        num_mac_binding: '1',
        num_conc_logins: '1',
        login_control: 'default',
        login_proto: 'plogin',
        acct_ref: '',
        first_name: '',
        last_name: '',
        email_addr: '',
        postal_addr: '',
        mobile_num: '',
        phone_num: '',
    });

    const [errors, setErrors] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [localCustomerData, setLocalCustomerData] = useState(staticCustomers);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        dispatch(setPageTitle('Customer Management'));
    }, [dispatch]);

    const columns = [
        {
            Header: 'S.No',
            accessor: 'id',
            Cell: (row) => <div className="font-medium text-gray-600 dark:text-gray-300">{row?.row?.index + 1 + currentPage * pageSize}</div>,
            width: 70,
        },
        {
            Header: 'User ID',
            accessor: 'user_id',
            sort: true,
            Cell: ({ value }) => <div className="font-semibold text-primary dark:text-primary-light">{value}</div>,
        },
        {
            Header: 'Customer Name',
            accessor: 'fullName',
            Cell: ({ row }) => (
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                        {row.original.first_name?.[0]}
                        {row.original.last_name?.[0]}
                    </div>
                    <div>
                        <div className="font-medium text-gray-800 dark:text-gray-200">{`${row.original.first_name || ''} ${row.original.last_name || ''}`.trim()}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{row.original.acct_ref || 'No reference'}</div>
                    </div>
                </div>
            ),
            sort: true,
        },
        {
            Header: 'Contact Info',
            accessor: 'contact',
            Cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-sm">
                        <IconMail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700 dark:text-gray-300 truncate">{row.original.email_addr}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                        <IconPhone className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600 dark:text-gray-400">{row.original.mobile_num || 'No phone'}</span>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Network Access',
            accessor: 'accessDetails',
            Cell: ({ row }) => (
                <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                        <IconWifi className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{row.original.pri_bandwidth_plan_name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">{row.original.login_proto}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">MAC: {row.original.num_mac_binding}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Login: {row.original.num_conc_logins}</span>
                    </div>
                </div>
            ),
        },
        {
            Header: 'Validity',
            accessor: 'validity',
            Cell: ({ row }) => {
                const expiryDate = row.original.expiry_date;
                const isExpired = new Date(expiryDate) < new Date();
                const daysLeft = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));

                return (
                    <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                            <IconCalendar className={`w-4 h-4 ${isExpired ? 'text-red-500' : 'text-green-500'}`} />
                            <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : 'text-green-600'}`}>{new Date(expiryDate).toLocaleDateString()}</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{isExpired ? 'Expired' : `${daysLeft} days left`}</div>
                    </div>
                );
            },
            sort: true,
        },
        {
            Header: 'Status',
            accessor: 'status',
            Cell: ({ row }) => {
                const isActive = row.original.isActive === 1;
                const isExpired = new Date(row.original.expiry_date) < new Date();

                if (!isActive) {
                    return <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-400 to-gray-600 text-white shadow">Deleted</span>;
                }

                return (
                    <span
                        className={`px-3 py-1.5 rounded-full text-xs font-medium shadow ${
                            isExpired ? 'bg-gradient-to-r from-red-400 to-red-600 text-white' : 'bg-gradient-to-r from-green-400 to-green-600 text-white'
                        }`}
                    >
                        {isExpired ? 'Expired' : 'Active'}
                    </span>
                );
            },
            sort: true,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const customer = row.original;
                const isActive = customer.isActive === 1;

                return (
                    <div className="flex items-center space-x-2">
                        <Tippy content="View Details">
                            <button onClick={() => onViewCustomer(customer)} className="btn btn-sm btn-outline-primary hover:scale-105 transition-transform duration-200">
                                <IconEye className="w-4 h-4" />
                            </button>
                        </Tippy>

                        {isActive ? (
                            <>
                                <Tippy content="Edit">
                                    <button onClick={() => onEditForm(customer)} className="btn btn-sm btn-outline-success hover:scale-105 transition-transform duration-200">
                                        <IconPencil className="w-4 h-4" />
                                    </button>
                                </Tippy>
                                <Tippy content="Delete">
                                    <button onClick={() => handleDeleteCustomer(customer)} className="btn btn-sm btn-outline-danger hover:scale-105 transition-transform duration-200">
                                        <IconTrashLines className="w-4 h-4" />
                                    </button>
                                </Tippy>
                            </>
                        ) : (
                            <Tippy content="Restore">
                                <button onClick={() => handleRestoreCustomer(customer)} className="btn btn-sm btn-outline-warning hover:scale-105 transition-transform duration-200">
                                    <IconRestore className="w-4 h-4" />
                                </button>
                            </Tippy>
                        )}
                    </div>
                );
            },
            width: 140,
        },
    ];

    const getFilteredData = () => {
        let filtered = localCustomerData;

        if (filterStatus === 'active') {
            filtered = filtered.filter((item) => item.isActive === 1);
        } else if (filterStatus === 'inactive') {
            filtered = filtered.filter((item) => item.isActive === 0);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(
                (item) =>
                    item.user_id?.toLowerCase().includes(term) ||
                    item.first_name?.toLowerCase().includes(term) ||
                    item.last_name?.toLowerCase().includes(term) ||
                    item.email_addr?.toLowerCase().includes(term) ||
                    item.mobile_num?.includes(term) ||
                    item.acct_ref?.toLowerCase().includes(term)
            );
        }

        return filtered;
    };

    const closeModel = () => {
        setModal(false);
        setViewModal(false);
        isEdit = false;
        onFormClear();
    };

    const onFormClear = () => {
        setSelectedItem(null);
        setErrors([]);
        setState({
            req_id: '',
            user_id: '',
            user_pass_type: 'specify',
            user_pass: '',
            account_validity: 'num_days_from_acct_creation',
            validity_data: '30',
            first_login_before_ts: '0',
            delete_expired_acct: 'enable',
            del_q_exceeded_acct: 'enable',
            pri_bandwidth_plan_name: 'Guest WiFi',
            ext_bandwidth_plan_name: 'Guest WiFi',
            num_mac_binding: '1',
            num_conc_logins: '1',
            login_control: 'default',
            login_proto: 'plogin',
            acct_ref: '',
            first_name: '',
            last_name: '',
            email_addr: '',
            postal_addr: '',
            mobile_num: '',
            phone_num: '',
        });
    };

    const createModel = () => {
        onFormClear();
        isEdit = false;
        setModal(true);
    };

    const onViewCustomer = (customer) => {
        setSelectedItem(customer);
        setViewModal(true);
    };

    const onEditForm = (customer) => {
        if (customer.isActive !== 1) {
            showMessage('error', 'Cannot edit deleted customer. Please restore it first.');
            return;
        }

        const newState = {
            ...state,
            user_id: customer.user_id || '',
            user_pass_type: customer.user_pass_type || 'specify',
            user_pass: customer.user_pass || '',
            account_validity: customer.account_validity || 'num_days_from_acct_creation',
            validity_data: customer.validity_data || '30',
            delete_expired_acct: customer.delete_expired_acct || 'enable',
            del_q_exceeded_acct: customer.del_q_exceeded_acct || 'enable',
            pri_bandwidth_plan_name: customer.pri_bandwidth_plan_name || 'Guest WiFi',
            ext_bandwidth_plan_name: customer.ext_bandwidth_plan_name || 'Guest WiFi',
            num_mac_binding: customer.num_mac_binding || '1',
            num_conc_logins: customer.num_conc_logins || '1',
            login_control: customer.login_control || 'default',
            login_proto: customer.login_proto || 'plogin',
            acct_ref: customer.acct_ref || '',
            first_name: customer.first_name || '',
            last_name: customer.last_name || '',
            email_addr: customer.email_addr || '',
            postal_addr: customer.postal_addr || '',
            mobile_num: customer.mobile_num || '',
            phone_num: customer.phone_num || '',
        };

        setState(newState);
        isEdit = true;
        setSelectedItem(customer);
        setModal(true);
    };

    const validateForm = () => {
        const errors = [];

        if (!state.user_id?.trim()) {
            errors.push({ field: 'user_id', message: 'User ID is required' });
        }

        if (state.user_pass_type === 'specify' && !state.user_pass?.trim()) {
            errors.push({ field: 'user_pass', message: 'Password is required' });
        }

        if (!state.first_name?.trim()) {
            errors.push({ field: 'first_name', message: 'First name is required' });
        }

        if (!state.email_addr?.trim()) {
            errors.push({ field: 'email_addr', message: 'Email address is required' });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email_addr)) {
            errors.push({ field: 'email_addr', message: 'Invalid email format' });
        }

        return errors;
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setErrors(validationErrors);
            showMessage('error', 'Please fix the form errors');
            return;
        }

        try {
            const newCustomer = {
                id: isEdit ? selectedItem.id : localCustomerData.length + 1,
                req_id: `add_${String(localCustomerData.length + 1).padStart(3, '0')}`,
                ...state,
                expiry_date: state.account_validity === 'specific_date' ? state.validity_data : new Date(Date.now() + parseInt(state.validity_data) * 24 * 60 * 60 * 1000).toISOString(),
                isActive: 1,
                created_at: new Date().toISOString(),
            };

            if (isEdit && selectedItem) {
                // Update existing customer
                setLocalCustomerData((prev) => prev.map((customer) => (customer.id === selectedItem.id ? { ...customer, ...newCustomer } : customer)));
                showMessage('success', 'Customer updated successfully');
            } else {
                // Add new customer
                setLocalCustomerData((prev) => [newCustomer, ...prev]);
                showMessage('success', 'Customer created successfully');
            }

            closeModel();
        } catch (error) {
            showMessage('error', 'Failed to save customer data');
        }
    };

    const handleInputChange = (e, name) => {
        let value;
        if (e.target.type === 'checkbox') {
            value = e.target.checked;
        } else {
            value = e.target.value;
        }

        setState((prev) => ({ ...prev, [name]: value }));

        if (errors.length > 0) {
            setErrors(errors.filter((error) => error.field !== name));
        }
    };

    const handleDeleteCustomer = (customer) => {
        if (customer.isActive !== 1) {
            showMessage('error', 'This customer is already deleted.');
            return;
        }

        showMessage('warning', 'Are you sure you want to delete this customer?', () => {
            setLocalCustomerData((prev) => prev.map((c) => (c.id === customer.id ? { ...c, isActive: 0 } : c)));
            showMessage('success', 'Customer deleted successfully');
        });
    };

    const handleRestoreCustomer = (customer) => {
        if (customer.isActive === 1) {
            showMessage('error', 'This customer is already active.');
            return;
        }

        showMessage('warning', 'Are you sure you want to restore this customer?', () => {
            setLocalCustomerData((prev) => prev.map((c) => (c.id === customer.id ? { ...c, isActive: 1 } : c)));
            showMessage('success', 'Customer restored successfully');
        });
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const dataArray = getFilteredData();
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return getFilteredData().length;
    };

    const getRecordCounts = () => {
        const activeCount = localCustomerData.filter((item) => item.isActive === 1).length;
        const deletedCount = localCustomerData.filter((item) => item.isActive === 0).length;
        const expiringToday = localCustomerData.filter((item) => {
            if (!item.expiry_date || item.isActive === 0) return false;
            const expiry = new Date(item.expiry_date);
            const today = new Date();
            return expiry.toDateString() === today.toDateString();
        }).length;

        return { activeCount, deletedCount, expiringToday };
    };

    const { activeCount, deletedCount, expiringToday } = getRecordCounts();

    return (
        <div>

            {/* Search and Filter Bar */}
            <div className="mb-6 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center space-x-4 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-none">
                            <input
                                type="text"
                                placeholder="Search customers by name, email, or ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input pl-12 pr-4 py-3 w-full md:w-80 rounded-xl border-0 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:bg-white dark:focus:bg-gray-700"
                            />
                            <div className="absolute left-4 top-3.5 text-gray-400">🔍</div>
                        </div>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="form-select py-3 rounded-xl border-0 bg-gray-50 dark:bg-gray-700/50 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-primary dark:focus:ring-primary-light focus:bg-white dark:focus:bg-gray-700"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Deleted Only</option>
                        </select>
                    </div>

                    <button
                        onClick={createModel}
                        className="btn btn-primary shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center space-x-2 px-6 py-3 rounded-xl"
                    >
                        <IconUserPlus className="w-5 h-5" />
                        <span className="font-medium">Add New Customer</span>
                    </button>
                </div>
            </div>

            {/* Main Table */}
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Customer Management'}
                    toggle={createModel}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={getTotalCount()}
                    totalPages={Math.ceil(getTotalCount() / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={false}
                    isSortable={true}
                    btnName=""
                    loadings={false}
                />
            </div>

            {/* Add/Edit Modal */}
            <ModelViewBox
                key={isEdit ? `edit-${selectedItem?.id}` : 'create'}
                modal={modal}
                modelHeader={isEdit ? 'Edit Customer' : 'Add New Customer'}
                isEdit={isEdit}
                setModel={closeModel}
                handleSubmit={onFormSubmit}
                modelSize="xl"
                submitBtnText={isEdit ? 'Update Customer' : 'Create Customer'}
                loadings={false}
            >
                <div className="p-6">
                    <form onSubmit={onFormSubmit}>
                        <div className="space-y-6">
                            {FormContainer.map((section, index) => {
                                if (section.type === 'divider') {
                                    return (
                                        <div key={index} className="relative">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                                            </div>
                                            <div className="relative flex justify-center">
                                                <span className="px-4 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-lg font-semibold">{section.text}</span>
                                            </div>
                                        </div>
                                    );
                                }

                                if (section.type === 'row') {
                                    return (
                                        <div key={index} className={section.className}>
                                            {section.children.map((field, fieldIndex) => {
                                                // Check show condition
                                                if (field.showCondition && state[field.showCondition.field] !== field.showCondition.value) {
                                                    return null;
                                                }

                                                return (
                                                    <div key={fieldIndex} className={field.colSpan}>
                                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                            {field.label}
                                                            {field.required && <span className="text-red-500 ml-1">*</span>}
                                                        </label>

                                                        {field.type === 'input' && (
                                                            <input
                                                                type={field.inputType ? (typeof field.inputType === 'function' ? field.inputType(state) : field.inputType) : 'text'}
                                                                name={field.name}
                                                                value={state[field.name] || ''}
                                                                onChange={(e) => handleInputChange(e, field.name)}
                                                                placeholder={field.placeholder}
                                                                className={field.className}
                                                                required={field.required}
                                                                min={field.min}
                                                                rows={field.rows}
                                                            />
                                                        )}

                                                        {field.type === 'select' && (
                                                            <select
                                                                name={field.name}
                                                                value={state[field.name] || ''}
                                                                onChange={(e) => handleInputChange(e, field.name)}
                                                                className={field.className}
                                                                required={field.required}
                                                            >
                                                                <option value="">Select {field.label.toLowerCase()}</option>
                                                                {field.options.map((option, optIndex) => (
                                                                    <option key={optIndex} value={option.value}>
                                                                        {option.label}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        )}

                                                        {errors.find((error) => error.field === field.name) && (
                                                            <p className="mt-1 text-sm text-red-500">{errors.find((error) => error.field === field.name)?.message}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }

                                if (section.type === 'input') {
                                    return (
                                        <div key={index}>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {section.label}
                                                {section.required && <span className="text-red-500 ml-1">*</span>}
                                            </label>
                                            {section.textArea ? (
                                                <textarea
                                                    name={section.name}
                                                    value={state[section.name] || ''}
                                                    onChange={(e) => handleInputChange(e, section.name)}
                                                    placeholder={section.placeholder}
                                                    className={section.className}
                                                    rows={section.rows}
                                                />
                                            ) : (
                                                <input
                                                    type={section.inputType || 'text'}
                                                    name={section.name}
                                                    value={state[section.name] || ''}
                                                    onChange={(e) => handleInputChange(e, section.name)}
                                                    placeholder={section.placeholder}
                                                    className={section.className}
                                                    required={section.required}
                                                />
                                            )}
                                            {errors.find((error) => error.field === section.name) && (
                                                <p className="mt-1 text-sm text-red-500">{errors.find((error) => error.field === section.name)?.message}</p>
                                            )}
                                        </div>
                                    );
                                }

                                return null;
                            })}
                        </div>
                    </form>
                </div>
            </ModelViewBox>

            {/* View Modal */}
            {viewModal && selectedItem && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={() => setViewModal(false)}></div>
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                            {/* Header */}
                            <div className="bg-gradient-to-r from-primary to-primary-light p-6">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                                            <span className="text-2xl text-white font-bold">
                                                {selectedItem.first_name?.[0]}
                                                {selectedItem.last_name?.[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-white">
                                                {selectedItem.first_name} {selectedItem.last_name}
                                            </h3>
                                            <p className="text-white/80">{selectedItem.user_id}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setViewModal(false)} className="text-white hover:text-gray-200 transition-colors duration-200 text-2xl">
                                        ✕
                                    </button>
                                </div>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Personal Information */}
                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-6 rounded-2xl">
                                        <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 flex items-center">
                                            <IconUserPlus className="w-5 h-5 mr-2" />
                                            Personal Information
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Email Address</label>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <IconMail className="w-4 h-4 text-gray-400" />
                                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{selectedItem.email_addr}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Mobile Number</label>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <IconPhone className="w-4 h-4 text-gray-400" />
                                                    <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{selectedItem.mobile_num || 'Not provided'}</p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Account Reference</label>
                                                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-1">{selectedItem.acct_ref || 'No reference'}</p>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Created On</label>
                                                <p className="text-lg font-medium text-gray-800 dark:text-gray-200 mt-1">{new Date(selectedItem.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        {selectedItem.postal_addr && (
                                            <div className="mt-4">
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Address</label>
                                                <p className="text-gray-700 dark:text-gray-300 mt-1">{selectedItem.postal_addr}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Network Settings */}
                                    <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-6 rounded-2xl">
                                        <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4 flex items-center">
                                            <IconWifi className="w-5 h-5 mr-2" />
                                            Network Settings
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Bandwidth Plan</label>
                                                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{selectedItem.pri_bandwidth_plan_name}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Login Protocol</label>
                                                <p className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium inline-block">
                                                    {selectedItem.login_proto}
                                                </p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Concurrent Logins</label>
                                                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{selectedItem.num_conc_logins}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-600 dark:text-gray-300">MAC Binding</label>
                                                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{selectedItem.num_mac_binding}</p>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Account Deletion</label>
                                                <p className="text-lg font-medium text-gray-800 dark:text-gray-200">{selectedItem.delete_expired_acct === 'enable' ? 'Enabled' : 'Disabled'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Information */}
                                    <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-6 rounded-2xl">
                                        <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4 flex items-center">
                                            <IconCalendar className="w-5 h-5 mr-2" />
                                            Account Status
                                        </h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Account Status</label>
                                                <div className="mt-2">
                                                    {selectedItem.isActive === 1 ? (
                                                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-green-500 to-green-600 text-white shadow">Active</span>
                                                    ) : (
                                                        <span className="px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow">Deleted</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm text-gray-600 dark:text-gray-300">Expiry Date</label>
                                                <div className="flex items-center space-x-2 mt-1">
                                                    <IconCalendar className="w-5 h-5 text-blue-500" />
                                                    <p className={`text-lg font-medium ${new Date(selectedItem.expiry_date) < new Date() ? 'text-red-600' : 'text-green-600'}`}>
                                                        {new Date(selectedItem.expiry_date).toLocaleDateString()}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {new Date(selectedItem.expiry_date) < new Date()
                                                        ? 'Account has expired'
                                                        : `${Math.ceil((new Date(selectedItem.expiry_date) - new Date()) / (1000 * 60 * 60 * 24))} days remaining`}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="bg-gray-50 dark:bg-gray-900 p-6 flex justify-end space-x-3">
                                <button onClick={() => setViewModal(false)} className="btn btn-outline-secondary hover:scale-105 transition-transform duration-200">
                                    Close
                                </button>
                                {selectedItem.isActive === 1 && (
                                    <button
                                        onClick={() => {
                                            setViewModal(false);
                                            onEditForm(selectedItem);
                                        }}
                                        className="btn btn-success hover:scale-105 transition-transform duration-200"
                                    >
                                        <IconPencil className="w-4 h-4 mr-2" />
                                        Edit Customer
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Index;
