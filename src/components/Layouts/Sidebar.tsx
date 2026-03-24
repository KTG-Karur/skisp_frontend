import IconMenuAuthentication from '../Icon/Menu/IconMenuAuthentication';
import IconMenuDocumentation from '../Icon/Menu/IconMenuDocumentation';
import IconMoney from '../Icon/IconMoney';
import IconUsersGroup from '../Icon/IconUsersGroup';
import IconLayerGroup from '../Icon/IconLayerGroup';
import IconUserFriends from '../Icon/IconUserFriends';
import IconDatabase from '../Icon/IconDatabase';
import IconMenuDashboards from '../Icon/IconMenuDashboard';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../redux/themeStore/themeConfigSlice';
import { IRootState } from '../../redux/themeStore';
import { useState, useEffect } from 'react';
import IconCaretsDown from '../Icon/IconCaretsDown';
import IconMinus from '../Icon/IconMinus';
import IconMenuDashboard from '../Icon/Menu/IconMenuDashboard';
import IconShield from '../Icon/IconShield';
import IconUsers from '../Icon/IconUsers';
import IconBuilding from '../Icon/IconBuilding';
import IconCalculator from '../Icon/IconCalculator';
import IconGavel from '../Icon/IconGavel';
import IconReceipt from '../Icon/IconReceipt';
import IconClock from '../Icon/IconClock';
import IconMoneyBillWave from '../Icon/IconMoneyBillWave';
import IconBook from '../Icon/IconBook';
import IconHandHoldingUsd from '../Icon/IconHandHoldingUsd';
import IconChartBar from '../Icon/IconChartBar';
import Navigation from './navigation';
import IconDollarSign from '../Icon/IconDollarSign';
import IconNotes from '../Icon/IconNotes';
import IconServer from '../Icon/IconServer';
import IconCustomers from '../Icon/IconUserFriends';
import IconPayments from '../Icon/IconMoney';
import IconBell from '../Icon/IconBellBing';
import IconImage from '../Icon/IconCamera';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from '../Icon/IconCaretDown';

const getIcon = (name?: string) => {
    switch (name) {
        case 'fe-document':
            return IconMenuDocumentation;
        case 'fe-grid':
            return IconMenuDashboards;
        case 'fe-shield':
            return IconShield;
        case 'fe-users':
            return IconUsersGroup;
        case 'fe-notes':
            return IconNotes;
        case 'fe-friends':
            return IconUserFriends;
        case 'fe-group':
            return IconLayerGroup;
        case 'fe-book':
            return IconBook;
        case 'fe-check-square':
            return IconCalculator;
        case 'fe-gavel':
            return IconGavel;
        case 'fe-receipt':
            return IconReceipt;
        case 'fe-clock':
            return IconClock;
        case 'fe-money':
            return IconDollarSign;
        case 'fe-moneys':
            return IconMoney;
        case 'fe-hand-holding-usd':
            return IconHandHoldingUsd;
        case 'fe-chart':
            return IconChartBar;
        case 'fe-settings':
            return IconMenuAuthentication;
        case 'fe-company':
            return IconDatabase;
        case 'fe-server':
            return IconServer;
        case 'fe-customers':
            return IconCustomers;
        case 'fe-payments':
            return IconPayments;
        case 'fe-bell':
            return IconBell;
        case 'fe-image':
            return IconImage;
        default:
            return IconMinus; // fallback
    }
};

type SidebarItemType = 'title' | 'dropdown' | 'list';

interface BaseSidebarItem {
    type: SidebarItemType;
    label: string;
    icon: React.ComponentType<any>;
    key?: string;
}

interface DropdownSidebarItem extends BaseSidebarItem {
    type: 'dropdown';
    items: {
        label: string;
        to: string;
        icon: React.ComponentType<any>;
    }[];
}

interface ListSidebarItem extends BaseSidebarItem {
    type: 'list';
    to: string;
}

interface TitleSidebarItem extends BaseSidebarItem {
    type: 'title';
}

type SidebarItem = DropdownSidebarItem | ListSidebarItem | TitleSidebarItem;

const Sidebar = () => {
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const [sidebarItems, setSidebarItems] = useState<SidebarItem[]>([]);

    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => (oldValue === value ? '' : value));
    };

    useEffect(() => {
        //removing the - before the child icon style
        const style = document.createElement('style');
        style.innerHTML = `
        .sidebar ul.sub-menu li button::before,
        .sidebar ul.sub-menu li a::before {
            display: none !important;
            content: none !important;
        }
    `;
        document.head.appendChild(style);

        return () => {
            document.head.removeChild(style);
        };
    }, []);

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [location]);

    // 🔹 Load sidebar items from localStorage (after login)
    useEffect(() => {
        const userDetails = localStorage.getItem('loginInfo');
        if (userDetails) {
            const parsed = JSON.parse(userDetails);
            const permissions = parsed ? parsed?.pagePermission || [] : [];

            // transform backend -> frontend sidebar items
            const mapped: SidebarItem[] = permissions.map((item: any) => {
                // Case 1: Item has children (should be dropdown) - even if it has isTitle: true
                if (item.children && item.children.length > 0) {
                    const parentIcon = getIcon(item.icon);

                    return {
                        type: 'dropdown',
                        label: item.label,
                        key: item.label,
                        icon: parentIcon,
                        items: item.children.map((child: any) => {
                            const childIcon = getIcon(child.icon);

                            return {
                                label: child.label,
                                to: child.url,
                                icon: childIcon,
                            };
                        }),
                    };
                }

                // Case 2: Item is a title (no children)
                if (item.isTitle) {
                    return {
                        type: 'title',
                        label: item.label,
                        icon: IconMinus, // Titles will show IconMinus
                    };
                }

                // Case 3: Regular list item
                const listIcon = getIcon(item.icon);

                return {
                    type: 'list',
                    label: item.label,
                    to: item.url,
                    icon: listIcon,
                };
            });

            setSidebarItems(mapped);
        }
    }, []);

    // Navigation component for dropdown items
    const renderDropdown = (item: DropdownSidebarItem) => {
        const Icon = item.icon;
        const isOpen = currentMenu === item.key;

        return (
            <li className="menu nav-item" key={item.key}>
                <button type="button" className={`${isOpen ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu(item.key!)}>
                    <div className="flex items-center">
                        {Icon && <Icon className="shrink-0 group-hover:!text-primary" />}
                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{item.label}</span>
                    </div>
                    <div className={!isOpen ? 'rtl:rotate-90 -rotate-90' : ''}>
                        <IconCaretDown />
                    </div>
                </button>

                <AnimateHeight duration={300} height={isOpen ? 'auto' : 0}>
                    <ul className="sub-menu text-gray-500">
                        {item.items.map((subItem, idx) => {
                            const SubIcon = subItem.icon;
                            return (
                                <li key={idx}>
                                    <NavLink to={subItem.to} className="nav-link">
                                        <div className="flex items-center">
                                            {SubIcon && <SubIcon className="w-4 h-4 shrink-0" />}
                                            <span className="ltr:pl-3 rtl:pr-3">{subItem.label}</span>
                                        </div>
                                    </NavLink>
                                </li>
                            );
                        })}
                    </ul>
                </AnimateHeight>
            </li>
        );
    };

    // Navigation component for title items
    const renderTitle = (item: TitleSidebarItem) => {
        const Icon = item.icon;
        return (
            <h2 key={item.label} className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                {Icon && <Icon className="w-4 h-5 flex-none" />}
                <span className={Icon ? 'ltr:pl-2 rtl:pr-2' : ''}>{item.label}</span>
            </h2>
        );
    };

    // Navigation component for list items
    const renderList = (item: ListSidebarItem) => {
        const Icon = item.icon;
        return (
            <li className="nav-item" key={item.to}>
                <NavLink to={item.to} className="group">
                    <div className="flex items-center">
                        {Icon && <Icon className="shrink-0 group-hover:!text-primary" />}
                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{item.label}</span>
                    </div>
                </NavLink>
            </li>
        );
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px]  z-50 transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}>
                <div className="bg-[#fff4e2] dark:bg-black h-full">
                    {/* logo */}
                    <div className="flex justify-between items-center px-4 py-3">
                        <NavLink to="/" className="main-logo flex items-center shrink-0">
                            <img style={{ width: '100px', height: '30px' }} className="flex-none" src="/assets/images/skisp-new-logo copy.png" alt="logo" />
                            {/* <span className="text-2xl ltr:ml-1.5 rtl:mr-1.5 font-semibold align-middle lg:inline dark:text-white-light">{t('Chittu')}</span> */}
                        </NavLink>

                        <button
                            type="button"
                            className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>

                    {/* sidebar menu */}
                    <PerfectScrollbar className="h-[calc(100vh-80px)] relative">
                        <ul className="relative font-semibold space-y-0.5 p-4 py-0">
                            {sidebarItems.map((item) => {
                                if (item.type === 'title') {
                                    return renderTitle(item);
                                }
                                if (item.type === 'dropdown') {
                                    return renderDropdown(item);
                                }
                                return renderList(item);
                            })}
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;
