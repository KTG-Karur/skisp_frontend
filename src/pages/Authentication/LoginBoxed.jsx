import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { setPageTitle, toggleRTL } from '../../redux/themeStore/themeConfigSlice';
import i18next from 'i18next';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconBuilding from '../../components/Icon/IconBuilding';
import IconUser from '../../components/Icon/IconUser';
import IconEye from '../../components/Icon/IconEye';
import IconEyeOff from '../../components/Icon/IconEyeOff';
import IconUsers from '../../components/Icon/IconUsers';
import IconCreditCard from '../../components/Icon/IconCreditCard';
import IconServer from '../../components/Icon/IconServer';
import IconChartBar from '../../components/Icon/IconChartBar';
import { getLogin, resetLoginStatus } from '../../redux/loginSlice';
import { showMessage } from '../../util/AllFunction';

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

    useEffect(() => {
        dispatch(setPageTitle('SKISP Admin Panel - Login'));
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
                navigate('/dashboard');
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
    }, [getLoginSuccess, getLoginFailed, loginData, error, navigate, dispatch]);

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
            {/* Multicolor Gradient Background */}
            <div
                className="fixed inset-0 -z-10"
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #ca0002 100%)',
                    width: '100vw',
                    height: '100vh',
                    margin: 0,
                    padding: 0,
                    backgroundSize: '400% 400%',
                    animation: 'gradientShift 15s ease infinite',
                }}
            ></div>

            {/* Subtle Moving Particles */}
            <div className="fixed inset-0 -z-5 opacity-20">
                {[...Array(15)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full"
                        style={{
                            width: `${Math.random() * 100 + 50}px`,
                            height: `${Math.random() * 100 + 50}px`,
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            background: `radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)`,
                            animation: `float ${Math.random() * 20 + 10}s ease-in-out infinite`,
                            animationDelay: `${Math.random() * 5}s`,
                        }}
                    />
                ))}
            </div>

            {/* Geometric Shapes with Multiple Colors */}
            <div className="fixed inset-0 overflow-hidden -z-5">
                {/* Purple Circle */}
                <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
                {/* Red Circle */}
                <div className="absolute bottom-20 right-10 w-80 h-80 bg-red-500/10 rounded-full blur-3xl"></div>
                {/* Blue Triangle */}
                <div className="absolute top-1/2 left-1/4 w-48 h-48 bg-blue-500/10 rounded-lg blur-2xl rotate-45"></div>
                {/* Pink Square */}
                <div className="absolute bottom-40 right-1/4 w-40 h-40 bg-pink-500/10 rounded-lg blur-2xl -rotate-12"></div>
                {/* Orange Shape */}
                <div className="absolute top-1/3 right-1/3 w-32 h-32 bg-orange-500/10 rounded-full blur-xl"></div>
            </div>

            {/* Main Content Container */}
            <div className="relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Mobile & Tablet: Single Column Layout */}
                <div className="block lg:hidden w-full max-w-md">
                    {/* Mobile Header with Logo */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-6 shadow-2xl">
                                <img 
                                    src="/assets/images/Optimangle_logo.png" 
                                    alt="SKISP Logo" 
                                    className="w-48 h-auto filter drop-shadow-xl"
                                />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">SKISP Admin</h1>
                        <p className="text-white/80 text-sm">Network Service Provider Management System</p>
                    </div>

                    {/* Mobile Features */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20 shadow-xl">
                        <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex-shrink-0"></div>
                                <span className="text-white text-sm">Customer Management</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex-shrink-0"></div>
                                <span className="text-white text-sm">Network Provider Management</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex-shrink-0"></div>
                                <span className="text-white text-sm">Plan & Payment Processing</span>
                            </div>
                        </div>
                    </div>

                    {/* Login Form for Mobile */}
                    <div
                        ref={mobileFormRef}
                        className="relative w-full rounded-3xl border border-white/30 bg-white/95 backdrop-blur-xl p-6 shadow-2xl transition-all duration-500"
                        style={{
                            boxShadow: '0 25px 70px rgba(0, 0, 0, 0.3)',
                        }}
                    >
                        <div className="mb-8 text-center">
                            <div className="flex justify-center mb-4">
                                <img 
                                    src="/assets/images/Optimangle_logo.png" 
                                    alt="SKISP Logo" 
                                    className="w-40 h-auto"
                                />
                            </div>
                            <p className="text-gray-600 text-sm">Enter your credentials to access the admin panel</p>
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
                                        placeholder="Enter admin username"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-12 py-3 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 focus:shadow-lg text-base outline-none"
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
                                        className="w-full rounded-xl border border-gray-300 bg-white px-12 py-3 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:shadow-lg text-base outline-none"
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
                                className="w-full rounded-xl py-3 font-semibold text-white shadow-lg transition-all duration-300 transform hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                style={{
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #ca0002 100%)',
                                    backgroundSize: '200% 200%',
                                }}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Authenticating...</span>
                                    </div>
                                ) : (
                                    'Access Admin Panel'
                                )}
                            </button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                <IconLockDots className="w-4 h-4" />
                                <span>Secure Admin Access Only</span>
                            </div>
                        </div>

                        {/* Version Info */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400">v1.0 • SKISP Admin Panel</p>
                        </div>
                    </div>
                </div>

                {/* Desktop: Two Column Layout */}
                <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl items-center">
                    {/* Left Side - Logo and Admin Panel Features */}
                    <div className="flex flex-col justify-center text-white space-y-8 p-8">
                        {/* Logo Display */}
                        <div className="mb-8">
                            <div className="bg-white/20 backdrop-blur-xl rounded-3xl p-8 shadow-2xl inline-block">
                                <img 
                                    src="/assets/images/Optimangle_logo.png" 
                                    alt="SKISP Logo" 
                                    className="w-64 h-auto filter drop-shadow-2xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            <h1 className="text-5xl font-bold leading-tight">
                                SKISP <br />
                                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
                                    Admin Panel
                                </span>
                            </h1>
                            
                            <p className="text-xl text-white/90 leading-relaxed">
                                Complete administration system for managing network providers, customer plans, payments, and employee allocations.
                            </p>
                        </div>

                        {/* Features Grid with Multicolor Icons */}
                        <div className="grid grid-cols-2 gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
                                        <IconUsers className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-white">Customer Management</h3>
                                </div>
                                <p className="text-white/70 text-sm">Add & manage customers with plan allocation</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500">
                                        <IconServer className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-white">Network Providers</h3>
                                </div>
                                <p className="text-white/70 text-sm">Multiple provider and plan management</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500">
                                        <IconCreditCard className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-white">Payment Processing</h3>
                                </div>
                                <p className="text-white/70 text-sm">Secure payment handling and tracking</p>
                            </div>
                            
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-red-500">
                                        <IconChartBar className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-white">Employee Management</h3>
                                </div>
                                <p className="text-white/70 text-sm">Staff allocation and task management</p>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="mt-6 p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-white">System Status: Online</span>
                                </div>
                                <span className="text-white/60 text-sm">Ready for Management</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="flex justify-center lg:justify-end">
                        <div
                            ref={desktopFormRef}
                            className="relative w-full max-w-md rounded-3xl border border-white/30 bg-white/95 backdrop-blur-xl p-10 shadow-2xl transition-all duration-500"
                            style={{
                                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.4)',
                            }}
                        >
                            {/* Form Header */}
                            <div className="mb-10 text-center">
                                <div className="flex justify-center mb-6">
                                    <img 
                                        src="/assets/images/Optimangle_logo.png" 
                                        alt="SKISP Logo" 
                                        className="w-48 h-auto"
                                    />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h2>
                                <p className="text-gray-600 text-sm">Access the administration panel</p>
                            </div>

                            <form className="space-y-7" onSubmit={submitForm}>
                                {/* Username Field */}
                                <div className="space-y-3">
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
                                            placeholder="Enter admin username"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-12 py-4 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-purple-600 focus:ring-2 focus:ring-purple-200 focus:shadow-lg text-base outline-none"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <IconUser className="w-5 h-5" />
                                        </span>
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-3">
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
                                            className="w-full rounded-xl border border-gray-300 bg-white px-12 py-4 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-200 focus:shadow-lg text-base outline-none"
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

                                {/* Submit Button with Gradient */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full rounded-xl py-4 font-semibold text-white shadow-lg transition-all duration-300 transform hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #ca0002 100%)',
                                        backgroundSize: '200% 200%',
                                    }}
                                >
                                    <div className="relative z-10">
                                        {isLoading ? (
                                            <div className="flex items-center justify-center space-x-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Authenticating...</span>
                                            </div>
                                        ) : (
                                            'Access Admin Panel'
                                        )}
                                    </div>
                                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </button>
                            </form>

                            {/* Admin Instructions */}
                            <div className="mt-10 pt-6 border-t border-gray-200">
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700 text-center">Admin Access Only</h4>
                                    <p className="text-xs text-gray-500 text-center">
                                        This panel is restricted to authorized personnel only. All activities are logged and monitored.
                                    </p>
                                </div>
                            </div>

                            {/* Version Info */}
                            <div className="mt-8 text-center">
                                <p className="text-xs text-gray-400">SKISP Admin Panel v1.0 • KTGT</p>
                                <p className="text-xs text-gray-400 mt-1">Network Service Provider Management System</p>
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

                @keyframes gradientShift {
                    0% {
                        background-position: 0% 50%;
                    }
                    50% {
                        background-position: 100% 50%;
                    }
                    100% {
                        background-position: 0% 50%;
                    }
                }

                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                    }
                    50% {
                        transform: translateY(-20px) translateX(10px);
                    }
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
                        font-size: 16px;
                    }

                    button {
                        min-height: 44px;
                    }
                }

                /* Custom scrollbar */
                ::-webkit-scrollbar {
                    width: 10px;
                }

                ::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 5px;
                }

                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #ca0002 100%);
                    border-radius: 5px;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #764ba2 0%, #f093fb 25%, #f5576c 50%, #ca0002 75%, #a00000 100%);
                }

                /* Smooth transitions */
                * {
                    transition: background-color 0.3s ease, border-color 0.3s ease;
                }
            `}</style>
        </div>
    );
};

export default LoginBoxed;