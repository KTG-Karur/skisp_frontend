import { NavLink } from 'react-router-dom';
import AnimateHeight from 'react-animate-height';
import { FC } from 'react';

// Shared prop types
interface BaseProps {
    type: 'title' | 'dropdown' | 'list';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
}

// Title item
interface TitleItemProps extends BaseProps {
    type: 'title';
}

// Dropdown item
interface DropdownItemProps extends BaseProps {
    type: 'dropdown';
    items: { to: string; label: string }[];
    isOpen: boolean;
    onToggle: () => void;
}

// Single list item
interface ListItemProps extends BaseProps {
    type: 'list';
    to: string;
}

// Union of all possible props
type NavigationProps = TitleItemProps | DropdownItemProps | ListItemProps;

const Navigation: FC<NavigationProps> = (props) => {
    const { type, label, icon: Icon } = props;

    if (type === 'title') {
        return (
            <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                <Icon className="w-4 h-5 flex-none hidden" />
                <span>{label}</span>
            </h2>
        );
    }

    if (type === 'dropdown') {
        const { items, isOpen, onToggle } = props;
        return (
            <li className="menu nav-item">
                <button type="button" className={`${isOpen ? 'active' : ''} nav-link group w-full`} onClick={onToggle}>
                    <div className="flex items-center">
                        <Icon className="group-hover:!text-primary shrink-0" />
                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{label}</span>
                    </div>
                    <div className={isOpen ? '' : 'rtl:rotate-90 -rotate-90'}>
                        <svg className="w-4 h-4">
                            <path d="..." />
                        </svg>
                    </div>
                </button>
                <AnimateHeight duration={300} height={isOpen ? 'auto' : 0}>
                    <ul className="sub-menu text-gray-500">
                        {items.map((item, idx) => (
                            <li key={idx}>
                                <NavLink to={item.to}>{item.label}</NavLink>
                            </li>
                        ))}
                    </ul>
                </AnimateHeight>
            </li>
        );
    }

    // Fallback is list
    const { to } = props;
    return (
        <li className="nav-item">
            <NavLink to={to} className="group">
                <div className="flex items-center">
                    <Icon className="group-hover:!text-primary shrink-0" />
                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{label}</span>
                </div>
            </NavLink>
        </li>
    );
};

export default Navigation;
