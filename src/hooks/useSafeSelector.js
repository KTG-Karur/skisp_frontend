import { useSelector } from 'react-redux';

export const useSafeSelector = (selector, defaultValue = {}) => {
    try {
        const result = useSelector(selector);
        return result !== undefined ? result : defaultValue;
    } catch (error) {
        console.error('Selector error:', error);
        return defaultValue;
    }
};
