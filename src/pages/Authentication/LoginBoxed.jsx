import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { setPageTitle, toggleRTL } from '../../redux/themeStore/themeConfigSlice';
import Dropdown from '../../components/Dropdown';
import i18next from 'i18next';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconBuilding from '../../components/Icon/IconBuilding';
import IconUser from '../../components/Icon/IconUser';
import IconEye from '../../components/Icon/IconEye';
import IconEyeOff from '../../components/Icon/IconEyeOff';
import { getLogin, resetLoginStatus } from '../../redux/loginSlice';
import { showMessage } from '../../util/AllFunction';
import Lottie from 'lottie-react';
import timeManagementGif from '../../../public/assets/images/auth/Time Management[1].json';

const LoginBoxed = () => {
    const dispatch = useDispatch();
    const { getLoginSuccess, getLoginFailed, error, loginData } = useSelector((state) => ({
        getLoginSuccess: state.LoginSlice.getLoginSuccess,
        getLoginFailed: state.LoginSlice.getLoginFailed,
        error: state.LoginSlice.error,
        loginData: state.LoginSlice.loginData,
    }));

    const navigate = useNavigate();
    const isRtl = useSelector((state) => state.themeConfig.rtlClass) === 'rtl';
    const themeConfig = useSelector((state) => state.themeConfig);

    const [flag, setFlag] = useState(themeConfig.locale);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState({ username: false, password: false });

    const mobileFormRef = useRef(null);
    const desktopFormRef = useRef(null);
    const lottieRef = useRef(null);

    useEffect(() => {
        dispatch(setPageTitle('Task Management System Login'));
    }, [dispatch]);

    useEffect(() => {
        if (getLoginSuccess) {
            setIsLoading(false);
            if (loginData?.data[0]) localStorage.setItem('loginInfo', JSON.stringify(loginData?.data[0]));

            const currentFormRef = window.innerWidth < 1024 ? mobileFormRef.current : desktopFormRef.current;
            if (currentFormRef) {
                currentFormRef.style.transform = 'scale(0.95)';
                currentFormRef.style.opacity = '0.8';
            }

            setTimeout(() => {
                navigate('/');
                dispatch(resetLoginStatus());
            }, 300);
        } else if (getLoginFailed) {
            setIsLoading(false);
            const currentFormRef = window.innerWidth < 1024 ? mobileFormRef.current : desktopFormRef.current;
            if (currentFormRef) {
                currentFormRef.classList.add('shake-animation');
                setTimeout(() => {
                    currentFormRef.classList.remove('shake-animation');
                }, 500);
            }
            showMessage('error', error || 'Login Failed');
        }
    }, [getLoginSuccess, getLoginFailed, loginData, error, navigate]);

    const setLocale = (flag) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (!username || !password) {
            showMessage('error', 'Please enter username and password');
            const currentFormRef = window.innerWidth < 1024 ? mobileFormRef.current : desktopFormRef.current;
            if (currentFormRef) {
                currentFormRef.classList.add('shake-animation');
                setTimeout(() => {
                    currentFormRef.classList.remove('shake-animation');
                }, 500);
            }
            return;
        }

        setIsLoading(true);
        dispatch(getLogin({ userName: username, password }));
    };

    const handleFocus = (field) => {
        setIsFocused((prev) => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field) => {
        setIsFocused((prev) => ({ ...prev, [field]: false }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div
                className="fixed inset-0 -z-10"
                style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3730a3 100%)',
                    width: '100vw',
                    height: '100vh',
                    margin: 0,
                    padding: 0,
                }}
            ></div>

            {/* Corporate Pattern Background */}
            <div
                className="fixed inset-0 opacity-10 -z-5"
                style={{
                    backgroundImage: `radial-gradient(circle at 25px 25px, rgba(255,255,255,0.2) 2%, transparent 40%), 
                                    radial-gradient(circle at 75px 75px, rgba(255,255,255,0.1) 2%, transparent 40%)`,
                    backgroundSize: '100px 100px',
                    width: '100vw',
                    height: '100vh',
                }}
            ></div>

            {/* Geometric shapes for corporate feel */}
            <div className="fixed inset-0 overflow-hidden -z-5">
                <div className="absolute top-20 left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-xl"></div>
                <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-lg blur-lg rotate-45"></div>
                <div className="absolute bottom-40 right-1/4 w-20 h-20 bg-blue-500/10 rounded-lg blur-lg -rotate-45"></div>
            </div>

            {/* Main Content Container */}
            <div className="relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Mobile & Tablet: Single Column Layout */}
                <div className="block lg:hidden w-full max-w-md">
                    {/* Mobile Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-white mb-2">Task Management</h1>
                        <p className="text-blue-200 text-sm">ERP Platform</p>
                    </div>

                    {/* Mobile Lottie Animation - Smaller for mobile */}
                    <div className="flex justify-center mb-6">
                        <div className="w-64 h-52 flex items-center justify-center">
                            <Lottie
                                animationData={timeManagementGif}
                                loop={true}
                                autoplay={true}
                                style={{ width: '100%', height: '100%' }}
                                ref={lottieRef}
                            />
                        </div>
                    </div>

                    {/* Mobile Features */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                                <span className="text-blue-100 text-sm">Real-time Task Tracking</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                                <span className="text-blue-100 text-sm">Team Collaboration Tools</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                                <span className="text-blue-100 text-sm">Deadline Management</span>
                            </div>
                        </div>
                    </div>

                    {/* Login Form for Mobile */}
                    <div
                        ref={mobileFormRef}
                        className="relative w-full rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl p-6 shadow-2xl transition-all duration-500"
                        style={{
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                        }}
                    >
                        <div className="mb-8 text-center">
                            <div className="flex justify-center mb-4">
                                <img style={{ width: '200px', height: '40px' }} className="flex-none drop-shadow-2xl filter brightness-110" src="/assets/images/Optimangle_logo.png" alt="logo" />
                            </div>
                            <p className="text-gray-600 text-sm">Enter your credentials to access the task management system</p>
                        </div>
                        <form className="space-y-5" onSubmit={submitForm}>
                            {/* Username Field */}
                            <div className="space-y-2">
                                <label htmlFor="mobile-username" className="block text-sm font-semibold text-gray-700">
                                    Username
                                </label>
                                <div className="relative">
                                    <input
                                        id="mobile-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => handleFocus('username')}
                                        onBlur={() => handleBlur('username')}
                                        placeholder="Enter your username"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-12 py-3 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-lg text-base outline-none"
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <IconUser className="w-5 h-5" />
                                    </span>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="mobile-password" className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="mobile-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => handleFocus('password')}
                                        onBlur={() => handleBlur('password')}
                                        placeholder="Enter your password"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-12 py-3 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-lg text-base outline-none"
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <IconLockDots className="w-5 h-5" />
                                    </span>
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3 font-semibold text-white shadow-lg transition-all duration-300 transform hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                                    isLoading ? 'animate-pulse' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Authenticating...</span>
                                    </div>
                                ) : (
                                    'Access System'
                                )}
                            </button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                <IconLockDots className="w-4 h-4" />
                                <span>Enterprise-grade security</span>
                            </div>
                        </div>

                        {/* Version Info */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400">v3.2.1 • Production</p>
                        </div>
                    </div>
                </div>

                {/* Desktop: Two Column Layout */}
                <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-8 w-full max-w-6xl items-center">
                    {/* Left Side - Corporate Branding with Lottie Animation */}
                    <div className="flex flex-col justify-center text-white space-y-6 p-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold leading-tight text-center">
                                Task Management <br />
                                <span className="text-blue-300">ERP Platform</span>
                            </h2>
                            {/* Lottie Animation */}
                            <div className="flex justify-center my-4">
                                <div className="w-96 h-80 flex items-center justify-center">
                                    <Lottie
                                        animationData={timeManagementGif}
                                        loop={true}
                                        autoplay={true}
                                        style={{ width: '100%', height: '100%' }}
                                        ref={lottieRef}
                                    />
                                </div>
                            </div>

                            <p className="text-md text-blue-100 leading-relaxed text-center">
                                Streamline your task management with our comprehensive ERP solution for project tracking, team collaboration, and productivity optimization.
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-blue-100">Real-time Task Tracking</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-blue-100">Team Collaboration Tools</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-blue-100">Deadline & Priority Management</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-blue-100">Progress Analytics & Reports</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="flex justify-center lg:justify-end">
                        <div
                            ref={desktopFormRef}
                            className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl p-8 shadow-2xl transition-all duration-500"
                            style={{
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            {/* Form Header with Company Logo */}
                            <div className="mb-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <img style={{ width: '200px', height: '40px' }} className="flex-none drop-shadow-2xl filter brightness-110" src="/assets/images/Optimangle_logo.png" alt="logo" />
                                </div>
                                <p className="text-gray-600 text-sm">Enter your credentials to access the task management system</p>
                            </div>

                            <form className="space-y-6" onSubmit={submitForm}>
                                {/* Username Field */}
                                <div className="space-y-2">
                                    <label htmlFor="desktop-username" className="block text-sm font-semibold text-gray-700">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="desktop-username"
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            onFocus={() => handleFocus('username')}
                                            onBlur={() => handleBlur('username')}
                                            placeholder="Enter your username"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-12 py-4 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-lg text-base outline-none"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <IconUser className="w-5 h-5" />
                                        </span>
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label htmlFor="desktop-password" className="block text-sm font-semibold text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="desktop-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => handleFocus('password')}
                                            onBlur={() => handleBlur('password')}
                                            placeholder="Enter your password"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-12 py-4 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-lg text-base outline-none"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <IconLockDots className="w-5 h-5" />
                                        </span>
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        >
                                            {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-4 font-semibold text-white shadow-lg transition-all duration-300 transform hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                                        isLoading ? 'animate-pulse' : ''
                                    }`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span>Authenticating...</span>
                                        </div>
                                    ) : (
                                        'Access System'
                                    )}
                                </button>
                            </form>

                            {/* Security Notice */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                    <IconLockDots className="w-4 h-4" />
                                    <span>Enterprise-grade security & compliance</span>
                                </div>
                            </div>

                            {/* Version Info */}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-400">V.1.0 • KTGT Production</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add custom styles for full viewport coverage */}
            <style jsx global>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                html,
                body,
                #root {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                }

                .shake-animation {
                    animation: shake 0.5s ease-in-out;
                }

                @keyframes shake {
                    0%,
                    100% {
                        transform: translateX(0);
                    }
                    25% {
                        transform: translateX(-5px);
                    }
                    75% {
                        transform: translateX(5px);
                    }
                }

                /* Remove black outline from all inputs */
                input:focus,
                button:focus,
                select:focus,
                textarea:focus {
                    outline: none !important;
                    box-shadow: none !important;
                }

                /* Ensure proper touch targets for mobile */
                @media (max-width: 768px) {
                    input,
                    button {
                        font-size: 16px; /* Prevent zoom on iOS */
                    }

                    button {
                        min-height: 44px; /* Minimum touch target size */
                    }
                }
            `}</style>
        </div>
    );
};

export default LoginBoxed;