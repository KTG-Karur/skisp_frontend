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
import IconUsers from '../../components/Icon/IconUsers';
import IconCreditCard from '../../components/Icon/IconCreditCard';
import IconServer from '../../components/Icon/IconServer';
import IconChartBar from '../../components/Icon/IconChartBar';
import { getLogin, resetLoginStatus } from '../../redux/loginSlice';
import { showMessage } from '../../util/AllFunction';
import Lottie from 'lottie-react';
import timeManagementGif from '../../../public/assets/images/auth/data center.json';

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
            {/* Animated Gradient Background */}
            <div
                className="fixed inset-0 -z-10"
                style={{
                    background: 'linear-gradient(135deg, #fff9f0 0%, #fff3e0 25%, #ffedd5 50%, #ffe8d6 75%, #ffdbd1 100%)',
                    width: '100vw',
                    height: '100vh',
                    margin: 0,
                    padding: 0,
                    backgroundSize: '400% 400%',
                    animation: 'gradientShift 15s ease infinite',
                }}
            ></div>

            {/* Orange Pattern Background */}
            <div
                className="fixed inset-0 opacity-10 -z-5"
                style={{
                    backgroundImage: `radial-gradient(circle at 25px 25px, rgba(239, 127, 27, 0.15) 2%, transparent 40%), 
                                    radial-gradient(circle at 75px 75px, rgba(239, 127, 27, 0.1) 2%, transparent 40%)`,
                    backgroundSize: '100px 100px',
                    width: '100vw',
                    height: '100vh',
                }}
            ></div>

            {/* Floating Orbs */}
            <div className="fixed inset-0 overflow-hidden -z-5 opacity-30">
                <div className="absolute top-20 left-10 w-40 h-40 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur-xl animate-float-slow"></div>
                <div className="absolute bottom-20 right-10 w-60 h-60 bg-gradient-to-r from-amber-400/20 to-orange-400/20 rounded-full blur-xl animate-float"></div>
                <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-lg animate-float-slow"></div>
                <div className="absolute bottom-40 right-1/4 w-28 h-28 bg-orange-300/10 rounded-full blur-lg animate-float"></div>
            </div>

            {/* Animated Circles */}
            <div className="fixed inset-0 overflow-hidden -z-5">
                <div className="absolute top-1/3 right-1/3 w-16 h-16 border-2 border-orange-300/30 rounded-full animate-ping"></div>
                <div className="absolute bottom-1/4 left-1/4 w-24 h-24 border-2 border-orange-400/20 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
            </div>

            {/* Main Content Container */}
            <div className="relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Mobile & Tablet: Single Column Layout */}
                <div className="block lg:hidden w-full max-w-md">
                    {/* Mobile Header with Logo */}
                    <div className="text-center mb-8 animate-fade-in">
                        {/* <div className="flex justify-center mb-4">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full blur opacity-30 animate-pulse"></div>
                                <img 
                                    src="/assets/images/skisp-new-logo copy.png" 
                                    alt="SKISP Logo" 
                                    className="relative w-48 h-auto filter drop-shadow-lg animate-float-slow"
                                />
                            </div>
                        </div> */}
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent mb-2">SKISP Admin</h1>
                        <p className="text-orange-700/80 text-sm">Network Service Provider Management System</p>
                    </div>

                    {/* Mobile Lottie Animation */}
                    <div className="flex justify-center mb-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
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
                    <div className="bg-gradient-to-r from-orange-50/80 to-yellow-50/80 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-orange-200 shadow-lg animate-fade-in" style={{animationDelay: '0.4s'}}>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3 group">
                                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                                <span className="text-orange-800 text-sm group-hover:text-orange-600 transition-colors duration-300">Customer Management</span>
                            </div>
                            <div className="flex items-center space-x-3 group">
                                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                                <span className="text-orange-800 text-sm group-hover:text-orange-600 transition-colors duration-300">Network Provider Management</span>
                            </div>
                            <div className="flex items-center space-x-3 group">
                                <div className="w-2 h-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-300"></div>
                                <span className="text-orange-800 text-sm group-hover:text-orange-600 transition-colors duration-300">Plan & Payment Processing</span>
                            </div>
                        </div>
                    </div>

                    {/* Login Form for Mobile */}
                    <div
                        ref={mobileFormRef}
                        className="relative w-full rounded-3xl border border-orange-200 bg-white/95 backdrop-blur-xl p-6 shadow-2xl transition-all duration-500 animate-fade-in-up"
                        style={{
                            boxShadow: '0 20px 60px rgba(239, 127, 27, 0.15)',
                            animationDelay: '0.6s',
                        }}
                    >
                        <div className="mb-8 text-center">
                            <div className="flex justify-center mb-4">
                                <img 
                                    src="/assets/images/skisp-new-logo copy.png" 
                                    alt="SKISP Logo" 
                                    className="w-40 h-auto filter drop-shadow-lg"
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
                                <div className="relative group">
                                    <input
                                        id="mobile-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => handleFocus('username')}
                                        onBlur={() => handleBlur('username')}
                                        placeholder="Enter admin username"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-12 py-3 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:shadow-lg text-base outline-none group-hover:border-orange-300"
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-orange-400 group-hover:text-orange-500 transition-colors duration-300">
                                        <IconUser className="w-5 h-5" />
                                    </span>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="mobile-password" className="block text-sm font-semibold text-gray-700">
                                    Password
                                </label>
                                <div className="relative group">
                                    <input
                                        id="mobile-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => handleFocus('password')}
                                        onBlur={() => handleBlur('password')}
                                        placeholder="Enter your password"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-12 py-3 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:shadow-lg text-base outline-none group-hover:border-orange-300"
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-orange-400 group-hover:text-orange-500 transition-colors duration-300">
                                        <IconLockDots className="w-5 h-5" />
                                    </span>
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute end-4 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600 transition-colors duration-300"
                                    >
                                        {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full rounded-xl py-3 font-semibold text-white shadow-lg transition-all duration-300 transform hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group ${
                                    isLoading ? 'animate-pulse' : ''
                                }`}
                                style={{
                                    background: 'linear-gradient(135deg, #ef7f1b 0%, #f59e0b 50%, #fbbf24 100%)',
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

                        {/* Security Notice */}
                        <div className="mt-6 pt-4 border-t border-orange-200">
                            <div className="flex items-center justify-center space-x-2 text-xs text-orange-600">
                                <IconLockDots className="w-4 h-4" />
                                <span>Secure Admin Access Only</span>
                            </div>
                        </div>

                        {/* Version Info */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400">SKISP Admin Panel v1.0</p>
                        </div>
                    </div>
                </div>

                {/* Desktop: Two Column Layout */}
                <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl items-center">
                    {/* Left Side - Branding with Lottie Animation */}
                    <div className="flex flex-col justify-center space-y-8 p-8">
                        {/* Logo Display */}
                        {/* <div className="mb-4 animate-fade-in">
                            <div className="relative inline-block">
                                <div className="absolute -inset-6 bg-gradient-to-r from-orange-500/30 to-yellow-500/30 rounded-full blur-2xl animate-pulse-slow"></div>
                                <img 
                                    src="/assets/images/skisp-new-logo copy.png" 
                                    alt="SKISP Logo" 
                                    className="relative w-64 h-auto filter drop-shadow-2xl animate-float-slow"
                                />
                            </div>
                        </div> */}

                        <div className="space-y-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
                            <h1 className="text-5xl font-bold leading-tight">
                                <span className="bg-gradient-to-r from-orange-600 via-yellow-500 to-orange-500 bg-clip-text text-transparent">
                                    Admin Panel
                                </span>
                            </h1>
                            
                            <p className="text-xl text-orange-800/90 leading-relaxed">
                                Complete administration system for managing network providers, customer plans, payments, and employee allocations.
                            </p>
                        </div>

                        {/* Lottie Animation */}
                        <div className="flex justify-center my-4 animate-fade-in" style={{animationDelay: '0.4s'}}>
                            <div className="w-full max-w-lg h-72 flex items-center justify-center bg-gradient-to-r">
                                <Lottie 
                                    animationData={timeManagementGif} 
                                    loop={true} 
                                    autoplay={true} 
                                    style={{ width: '100%', height: '100%' }} 
                                    ref={lottieRef}
                                />
                            </div>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-4 mt-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
                            <div className="bg-gradient-to-br from-orange-50/80 to-yellow-50/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200 hover:border-orange-300 transition-all duration-300 hover:scale-105 group">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 group-hover:scale-110 transition-transform duration-300">
                                        <IconUsers className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-orange-800">Customer Management</h3>
                                </div>
                                <p className="text-orange-700/70 text-sm">Add & manage customers with plan allocation</p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-orange-50/80 to-yellow-50/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200 hover:border-orange-300 transition-all duration-300 hover:scale-105 group">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 group-hover:scale-110 transition-transform duration-300">
                                        <IconServer className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-orange-800">Network Providers</h3>
                                </div>
                                <p className="text-orange-700/70 text-sm">Multiple provider and plan management</p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-orange-50/80 to-yellow-50/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200 hover:border-orange-300 transition-all duration-300 hover:scale-105 group">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 group-hover:scale-110 transition-transform duration-300">
                                        <IconCreditCard className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-orange-800">Payment Processing</h3>
                                </div>
                                <p className="text-orange-700/70 text-sm">Secure payment handling and tracking</p>
                            </div>
                            
                            <div className="bg-gradient-to-br from-orange-50/80 to-yellow-50/80 backdrop-blur-sm rounded-xl p-4 border border-orange-200 hover:border-orange-300 transition-all duration-300 hover:scale-105 group">
                                <div className="flex items-center space-x-3 mb-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-r from-orange-500 to-yellow-500 group-hover:scale-110 transition-transform duration-300">
                                        <IconChartBar className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="font-semibold text-orange-800">Employee Management</h3>
                                </div>
                                <p className="text-orange-700/70 text-sm">Staff allocation and task management</p>
                            </div>
                        </div>

                        {/* System Status */}
                        <div className="mt-6 p-4 bg-gradient-to-r from-orange-50/50 to-yellow-50/50 backdrop-blur-sm rounded-xl border border-orange-200 animate-fade-in" style={{animationDelay: '0.8s'}}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-3 h-3 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-orange-800">System Status: Online</span>
                                </div>
                                <span className="text-orange-600/60 text-sm">Ready for Management</span>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="flex justify-center lg:justify-end">
                        <div
                            ref={desktopFormRef}
                            className="relative w-full max-w-md rounded-3xl border border-orange-200 bg-white/95 backdrop-blur-xl p-10 shadow-2xl transition-all duration-500 animate-fade-in-right"
                            style={{
                                boxShadow: '0 30px 80px rgba(239, 127, 27, 0.2)',
                            }}
                        >
                            {/* Form Header */}
                            <div className="mb-10 text-center animate-fade-in" style={{animationDelay: '0.3s'}}>
                                <div className="flex justify-center mb-6">
                                    <div className="relative">
                                        <div className="absolute -inset-4 bg-gradient-to-r from-orange-400/20 to-yellow-400/20 rounded-full blur animate-pulse"></div>
                                        <img 
                                            src="/assets/images/skisp-new-logo copy.png" 
                                            alt="SKISP Logo" 
                                            className="relative w-48 h-auto filter drop-shadow-lg"
                                        />
                                    </div>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Login</h2>
                                <p className="text-gray-600 text-sm">Access the administration panel</p>
                            </div>

                            <form className="space-y-7" onSubmit={submitForm}>
                                {/* Username Field */}
                                <div className="space-y-3 animate-fade-in" style={{animationDelay: '0.4s'}}>
                                    <label htmlFor="desktop-username" className="block text-sm font-semibold text-gray-700">
                                        Username
                                    </label>
                                    <div className="relative group">
                                        <input
                                            id="desktop-username"
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            onFocus={() => handleFocus('username')}
                                            onBlur={() => handleBlur('username')}
                                            placeholder="Enter admin username"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-12 py-4 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:shadow-lg text-base outline-none group-hover:border-orange-300"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-orange-400 group-hover:text-orange-500 transition-colors duration-300">
                                            <IconUser className="w-5 h-5" />
                                        </span>
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-3 animate-fade-in" style={{animationDelay: '0.5s'}}>
                                    <label htmlFor="desktop-password" className="block text-sm font-semibold text-gray-700">
                                        Password
                                    </label>
                                    <div className="relative group">
                                        <input
                                            id="desktop-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => handleFocus('password')}
                                            onBlur={() => handleBlur('password')}
                                            placeholder="Enter your password"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-12 py-4 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:shadow-lg text-base outline-none group-hover:border-orange-300"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-orange-400 group-hover:text-orange-500 transition-colors duration-300">
                                            <IconLockDots className="w-5 h-5" />
                                        </span>
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute end-4 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-600 transition-colors duration-300"
                                        >
                                            {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full rounded-xl py-4 font-semibold text-white shadow-lg transition-all duration-300 transform hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                                        style={{
                                            background: 'linear-gradient(135deg, #ef7f1b 0%, #f59e0b 50%, #fbbf24 100%)',
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
                                </div>
                            </form>

                            {/* Admin Instructions */}
                            <div className="mt-10 pt-6 border-t border-orange-200 animate-fade-in" style={{animationDelay: '0.7s'}}>
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-gray-700 text-center">Admin Access Only</h4>
                                    <p className="text-xs text-gray-500 text-center">
                                        This panel is restricted to authorized personnel only. All activities are logged and monitored.
                                    </p>
                                </div>
                            </div>

                            {/* Version Info */}
                            <div className="mt-8 text-center animate-fade-in" style={{animationDelay: '0.8s'}}>
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
                        transform: translateY(-15px) translateX(8px);
                    }
                }

                @keyframes float-slow {
                    0%, 100% {
                        transform: translateY(0) translateX(0);
                    }
                    50% {
                        transform: translateY(-10px) translateX(5px);
                    }
                }

                @keyframes fade-in {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes fade-in-right {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes pulse-slow {
                    0%, 100% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }

                .animate-gradient {
                    background-size: 200% 200%;
                    animation: gradientShift 3s ease infinite;
                }

                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }

                .animate-float-slow {
                    animation: float-slow 8s ease-in-out infinite;
                }

                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }

                .animate-fade-in-up {
                    animation: fade-in-up 0.8s ease-out forwards;
                }

                .animate-fade-in-right {
                    animation: fade-in-right 0.8s ease-out forwards;
                }

                .animate-pulse-slow {
                    animation: pulse-slow 3s ease-in-out infinite;
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

                /* Custom scrollbar */
                ::-webkit-scrollbar {
                    width: 10px;
                }

                ::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 5px;
                }

                ::-webkit-scrollbar-thumb {
                    background: linear-gradient(135deg, #ef7f1b 0%, #f59e0b 50%, #fbbf24 100%);
                    border-radius: 5px;
                }

                ::-webkit-scrollbar-thumb:hover {
                    background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 50%, #fcd34d 100%);
                }
            `}</style>
        </div>
    );
};

export default LoginBoxed;
