import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import { IRootState } from '../../redux/themeStore';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';

const Error500 = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(setPageTitle('Payment Cancelled'));
    }, []);
    
    const isDark = useSelector((state: IRootState) => state.themeConfig.theme === 'dark' || state.themeConfig.isDarkMode);

    const handleRetryPayment = () => {
        navigate(-1);
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
            <div className="px-6 py-16 text-center font-semibold before:container before:absolute before:left-1/2 before:-translate-x-1/2 before:rounded-full before:bg-[linear-gradient(180deg,#ef7f1b_0%,rgba(67,97,238,0)_50.73%)] before:aspect-square before:opacity-10 md:py-20">
                <div className="relative">
                    <img
                        src={isDark ? '/assets/images/error/500-dark.svg' : '/assets/images/error/500-light.svg'}
                        alt="500"
                        className="mx-auto -mt-10 w-full max-w-xs object-cover md:-mt-14 md:max-w-xl"
                    />
                    <div className="-mt-8 font-semibold dark:text-white">
                        <h2 className="mb-5 text-3xl font-bold text-primary md:text-5xl">Payment Cancelled</h2>
                        <h4 className="mb-3 text-xl sm:text-2xl text-gray-600 dark:text-gray-300">
                            Your payment was not completed
                        </h4>
                        
                        <div className="mb-7 max-w-md mx-auto">
                            <p className="text-base text-gray-600 dark:text-gray-300 mb-4">
                                No worries! Your payment was not processed and no charges were made.
                            </p>
                            <div className="flex flex-col items-start">
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-2">
                                    Common reasons for cancellation:
                                </p>
                                <ul className="text-sm text-gray-500 dark:text-gray-400 text-left ml-4">
                                    <li className="mb-1">• You chose to cancel the payment</li>
                                    <li className="mb-1">• Network connectivity issues</li>
                                    <li>• Browser navigation away from payment page</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                        <Button 
                            onClick={handleRetryPayment} 
                            className="btn btn-gradient !mt-0 px-6 py-3 border-0 uppercase shadow-none hover:shadow-lg transition-all duration-300"
                            style={{ background: 'linear-gradient(135deg, #ef7f1b 0%, #ff9d45 100%)' }}
                        >
                            <i className="ri-refresh-line mr-2"></i>
                            Retry Payment
                        </Button>
                    </div>
                    
                    <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                            Need help with your payment?
                        </p>
                        <div className="flex flex-col items-center justify-center gap-1">
                            <div className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                                9965699903 ,                                 info@skisp.in, www.skisp.in
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg max-w-md mx-auto">
                        <p className="text-xs text-green-700 dark:text-green-300 flex items-center justify-center">
                            <i className="ri-shield-check-line mr-1"></i>
                            Your payment information is secure and encrypted
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Error500;