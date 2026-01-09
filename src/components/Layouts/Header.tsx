import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IRootState } from '../../redux/themeStore';
import { toggleSidebar } from '../../redux/themeStore/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import Dropdown from '../Dropdown';
import IconMenu from '../Icon/IconMenu';
import IconCheck from '../Icon/IconCheck';
import IconBuilding from '../Icon/IconBuilding';
import IconUsers from '../Icon/IconUsers';
import IconRefresh from '../Icon/IconRefresh';
import IconCircleCheck from '../Icon/IconCircleCheck';

import { getProvider } from '../../redux/providerSlice';
import { syncBandWidth, syncSmartBytes, resetSyncStatus } from '../../redux/syncSlice';
import { showMessage } from '../../util/AllFunction';

interface Provider {
    id: string;
    providerName: string;
    status: string;
    [key: string]: any;
}

const Header = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { t } = useTranslation();

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);

    const providerState = useSelector((state: any) => state.ProviderSlice || {});
    const allProviders: Provider[] = providerState.providerData || [];
    const providerLoading = providerState.loading || false;

    // Get sync state from Redux
    const syncState = useSelector((state: any) => state.syncSlice || {});
    const bandwidthSync = syncState.bandwidth || {};
    const smartbytesSync = syncState.smartbytes || {};
    const overallSyncInProgress = syncState.overallSyncInProgress || false;
    const lastSyncComplete = syncState.lastSyncComplete || false;

    const [selectedProvider, setSelectedProvider] = useState<string>('');
    const [selectedProviderName, setSelectedProviderName] = useState<string>('Tacitine');
    const [providerDropdownOpen, setProviderDropdownOpen] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [syncSuccess, setSyncSuccess] = useState(false);
    const [syncError, setSyncError] = useState(false);
    const [syncIconTimer, setSyncIconTimer] = useState<NodeJS.Timeout | null>(null);
    const [syncStep, setSyncStep] = useState<'idle' | 'bandwidth' | 'smartbytes' | 'complete'>('idle');
    const [hasShownSuccess, setHasShownSuccess] = useState(false);

    const loginDataString = localStorage.getItem('loginInfo');
    const loginData = loginDataString ? JSON.parse(loginDataString) : null;

    // Debug: Monitor Redux sync state
    useEffect(() => {
        console.log('Redux Sync State:', {
            bandwidthLoading: bandwidthSync.loading,
            bandwidthSuccess: bandwidthSync.success,
            smartbytesLoading: smartbytesSync.loading,
            smartbytesSuccess: smartbytesSync.success,
            overallSyncInProgress,
            lastSyncComplete,
            isSyncing,
            syncSuccess,
        });
    }, [bandwidthSync, smartbytesSync, overallSyncInProgress, lastSyncComplete, isSyncing, syncSuccess]);

    // Main effect to handle sync state changes
    useEffect(() => {
        // If either sync is loading, we're syncing
        if ((bandwidthSync.loading || smartbytesSync.loading || overallSyncInProgress) && !isSyncing) {
            console.log('Sync started (Redux loading detected)');
            setIsSyncing(true);
            setSyncSuccess(false);
            setSyncError(false);
            setHasShownSuccess(false);
            setSyncStep(bandwidthSync.loading ? 'bandwidth' : 'smartbytes');

            // Clear any existing timer
            if (syncIconTimer) {
                clearTimeout(syncIconTimer);
                setSyncIconTimer(null);
            }
        }

        // Check if sync completed successfully
        if (!bandwidthSync.loading && !smartbytesSync.loading && !overallSyncInProgress && lastSyncComplete) {
            if (isSyncing && bandwidthSync.success && smartbytesSync.success) {
                console.log('Sync completed successfully (Redux state)');
                setSyncSuccess(true);
                setSyncError(false);
                setIsSyncing(false);
                setSyncStep('complete');

                // Show success message if not already shown
                if (!hasShownSuccess) {
                    showMessage('success', 'Sync completed successfully!');
                    setHasShownSuccess(true);
                }

                // Set timer to reset after 5 seconds
                const timer = setTimeout(() => {
                    console.log('Resetting sync UI after success');
                    setSyncSuccess(false);
                    setSyncStep('idle');
                    fetchProviders(); // Refresh providers
                }, 5000);

                setSyncIconTimer(timer);
            }
        }

        // Check if sync failed
        if (!bandwidthSync.loading && !smartbytesSync.loading && !overallSyncInProgress) {
            if (isSyncing && (bandwidthSync.error || smartbytesSync.error)) {
                console.log('Sync failed (Redux error detected)');
                setSyncSuccess(false);
                setSyncError(true);
                setIsSyncing(false);
                setSyncStep('idle');

                // Set timer to reset after 5 seconds
                const timer = setTimeout(() => {
                    setSyncError(false);
                }, 5000);

                setSyncIconTimer(timer);
            }
        }
    }, [bandwidthSync.loading, smartbytesSync.loading, bandwidthSync.success, smartbytesSync.success, bandwidthSync.error, smartbytesSync.error, overallSyncInProgress, lastSyncComplete, isSyncing]);

    // Show individual success messages
    useEffect(() => {
        if (bandwidthSync.success && bandwidthSync.message) {
            showMessage('success', bandwidthSync.message);
        }
    }, [bandwidthSync.success, bandwidthSync.message]);

    useEffect(() => {
        if (smartbytesSync.success && smartbytesSync.message) {
            showMessage('success', smartbytesSync.message);
        }
    }, [smartbytesSync.success, smartbytesSync.message]);

    // Show individual error messages
    useEffect(() => {
        if (bandwidthSync.error) {
            showMessage('error', bandwidthSync.error);
        }

        if (smartbytesSync.error) {
            showMessage('error', smartbytesSync.error);
        }
    }, [bandwidthSync.error, smartbytesSync.error]);

    // Clean up timer on unmount
    useEffect(() => {
        return () => {
            if (syncIconTimer) {
                clearTimeout(syncIconTimer);
            }
        };
    }, [syncIconTimer]);

    useEffect(() => {
        fetchProviders();
    }, []);

    useEffect(() => {
        if (allProviders.length > 0) {
            const savedProviderId = localStorage.getItem('selectedProvider');
            const savedProviderName = localStorage.getItem('selectedProviderName');

            if (savedProviderId && savedProviderName) {
                setSelectedProvider(savedProviderId);
                setSelectedProviderName(savedProviderName);
            } else {
                const tacitineProvider = allProviders.find((provider) => provider.providerName.toLowerCase() === 'tacitine') || allProviders[0];

                if (tacitineProvider) {
                    setSelectedProvider(tacitineProvider.id);
                    setSelectedProviderName(tacitineProvider.providerName);
                    localStorage.setItem('selectedProvider', tacitineProvider.id);
                    localStorage.setItem('selectedProviderName', tacitineProvider.providerName);
                }
            }
        }
    }, [allProviders]);

    const fetchProviders = async () => {
        try {
            await dispatch(getProvider() as any);
        } catch (error) {
            console.error('Error fetching providers:', error);
        }
    };

    const handleProviderSelect = (providerId: string, providerName: string) => {
        setSelectedProvider(providerId);
        setSelectedProviderName(providerName);

        localStorage.setItem('selectedProvider', providerId);
        localStorage.setItem('selectedProviderName', providerName);

        setProviderDropdownOpen(false);
    };

    const handleSync = async (e: React.MouseEvent, providerId: string, providerName: string) => {
        e.stopPropagation();

        if (providerName.toLowerCase() !== 'tacitine') {
            showMessage('warning', 'Sync is only available for Tacitine provider');
            return;
        }

        if (isSyncing) {
            showMessage('warning', 'Sync already in progress');
            return;
        }

        // Clear any existing timer
        if (syncIconTimer) {
            clearTimeout(syncIconTimer);
            setSyncIconTimer(null);
        }

        // Reset states
        setSyncSuccess(false);
        setSyncError(false);
        setSyncStep('idle');
        setHasShownSuccess(false);

        // Start syncing immediately (UI feedback)
        setIsSyncing(true);
        setSyncStep('bandwidth');

        try {
            // Reset sync status
            dispatch(resetSyncStatus());

            showMessage('info', 'Starting sync process for Tacitine...');

            console.log('Starting bandwidth sync...');

            // Start bandwidth sync
            await dispatch(syncBandWidth() as any);

            // Wait a moment before starting smartbytes sync
            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log('Starting smartbytes sync...');
            setSyncStep('smartbytes');

            // Start smartbytes sync
            await dispatch(syncSmartBytes() as any);

            // Note: The useEffect above will handle the completion based on Redux state
        } catch (error) {
            console.error('Sync setup failed:', error);
            showMessage('error', 'Failed to start sync process');
            setIsSyncing(false);
            setSyncError(true);
            setSyncStep('idle');

            const timer = setTimeout(() => {
                setSyncError(false);
            }, 5000);
            setSyncIconTimer(timer);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('selectedProvider');
        localStorage.removeItem('selectedProviderName');
        localStorage.removeItem('loginInfo');
        navigate('/auth/boxed-signin?');
    };

    const getFirstLetter = (fullName: string) => {
        if (!fullName || fullName === 'All Providers') return 'A';
        return fullName.charAt(0).toUpperCase();
    };

    const getProviderColor = (letter: string) => {
        const colors = ['bg-primary', 'bg-success', 'bg-warning', 'bg-danger', 'bg-info', 'bg-secondary'];
        const index = letter.charCodeAt(0) % colors.length;
        return colors[index];
    };

    // Get sync icon based on current state
    const getSyncIcon = () => {
        if (syncSuccess) {
            return <IconCircleCheck className="w-3.5 h-3.5 text-success" />;
        }
        if (syncError) {
            return <span className="text-danger text-sm font-bold">✗</span>;
        }
        if (isSyncing) {
            return <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-primary border-t-transparent"></div>;
        }
        return <IconRefresh className="w-3.5 h-3.5 text-gray-500 hover:text-primary" />;
    };

    // Get sync status text
    const getSyncStatusText = () => {
        if (syncSuccess) return 'Sync completed!';
        if (syncError) return 'Sync failed';
        if (isSyncing) {
            switch (syncStep) {
                case 'bandwidth':
                    return 'Syncing bandwidth plans...';
                case 'smartbytes':
                    return 'Syncing smartbytes plans...';
                case 'complete':
                    return 'Finalizing sync...';
                default:
                    return 'Syncing Tacitine...';
            }
        }
        return '';
    };

    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [location]);

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm">
                <div className="relative bg-[#fff4e2] flex w-full items-center px-5 py-2.5 dark:bg-black">
                    <div className="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
                        <Link to="/" className="main-logo flex items-center shrink-0">
                            <img style={{ width: '100px', height: '30px' }} className="flex-none" src="/assets/images/skisp-new-logo copy.png" alt="logo" />
                        </Link>
                        <button
                            type="button"
                            className="collapse-icon flex-none dark:text-[#d0d2d6] hover:text-primary dark:hover:text-primary flex lg:hidden ltr:ml-2 rtl:mr-2 p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
                            onClick={() => {
                                dispatch(toggleSidebar());
                            }}
                        >
                            <IconMenu className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="ltr:mr-2 rtl:ml-2 hidden sm:block"></div>

                    <div className="sm:flex-1 ltr:sm:ml-0 ltr:ml-auto sm:rtl:mr-0 rtl:mr-auto flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">
                        <div className="sm:ltr:mr-auto sm:rtl:ml-auto"></div>

                        <div className="dropdown shrink-0">
                            <Dropdown
                                offset={[0, 8]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="relative block p-1.5 rounded-full hover:bg-white-light/90 dark:hover:bg-dark/60 hover:text-primary transition-all"
                                button={
                                    <span className="flex items-center">
                                        <span
                                            className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow ${getProviderColor(
                                                getFirstLetter(selectedProviderName)
                                            )}`}
                                        >
                                            {getFirstLetter(selectedProviderName)}
                                        </span>
                                    </span>
                                }
                                onToggle={(isOpen: boolean) => {
                                    setProviderDropdownOpen(isOpen);
                                    if (isOpen) {
                                        fetchProviders();
                                    }
                                }}
                            >
                                <ul className="!py-0 text-dark dark:text-white-dark w-64 max-h-80 overflow-y-auto">
                                    <li className="sticky top-0 bg-white dark:bg-dark border-b dark:border-white/10 z-10">
                                        <div className="px-3 py-2.5">
                                            <h4 className="text-sm font-semibold">Select Provider</h4>
                                            {getSyncStatusText() && (
                                                <div className={`mt-1 text-xs flex items-center gap-1 ${syncSuccess ? 'text-success' : syncError ? 'text-danger' : 'text-primary'}`}>
                                                    {syncSuccess && <IconCircleCheck className="w-3.5 h-3.5" />}
                                                    {syncError && <span className="text-danger">⚠</span>}
                                                    {isSyncing && !syncSuccess && !syncError && <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent"></div>}
                                                    {getSyncStatusText()}
                                                </div>
                                            )}
                                        </div>
                                    </li>

                                    {providerLoading ? (
                                        <li className="px-4 py-5 text-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent mx-auto"></div>
                                        </li>
                                    ) : allProviders.length > 0 ? (
                                        <>
                                            {/* All Providers Option */}
                                            {/* <li>
                                                <div
                                                    className={`px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${selectedProvider === '' ? 'bg-primary/5' : ''}`}
                                                    onClick={() => handleProviderSelect('', 'All Providers')}
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                            <IconUsers className="w-3.5 h-3.5 text-primary" />
                                                        </div>
                                                        <span className="text-sm font-medium">All Providers</span>
                                                        {selectedProvider === '' && <IconCheck className="w-3.5 h-3.5 text-primary ml-auto" />}
                                                    </div>
                                                </div>
                                            </li> */}

                                            {/* Divider */}
                                            {/* {allProviders.length > 0 && (
                                                <li>
                                                    <div className="px-3 pt-1 pb-0.5">
                                                        <div className="text-xs text-gray-500 uppercase font-medium">Providers</div>
                                                    </div>
                                                </li>
                                            )} */}

                                            {allProviders.map((provider: Provider) => (
                                                <li key={provider.id}>
                                                    <div
                                                        className={`px-3 py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer group ${
                                                            selectedProvider === provider.id ? 'bg-primary/5' : ''
                                                        }`}
                                                        onClick={() => handleProviderSelect(provider.id, provider.providerName)}
                                                    >
                                                        <div className="flex items-center gap-2.5">
                                                            <div
                                                                className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 ${getProviderColor(
                                                                    getFirstLetter(provider.providerName)
                                                                )}`}
                                                            >
                                                                {getFirstLetter(provider.providerName)}
                                                            </div>
                                                            <span className="text-sm truncate flex-1">{provider.providerName}</span>

                                                            {/* Sync button only for Tacitine */}
                                                            {provider.providerName.toLowerCase() === 'tacitine' && (
                                                                <button
                                                                    type="button"
                                                                    className={`flex-shrink-0 p-1 rounded-full transition-all duration-200 ${
                                                                        isSyncing
                                                                            ? syncSuccess
                                                                                ? 'bg-success/20 cursor-default'
                                                                                : syncError
                                                                                ? 'bg-danger/20 cursor-default'
                                                                                : 'opacity-50 cursor-not-allowed bg-primary/20'
                                                                            : 'hover:bg-gray-200 dark:hover:bg-gray-700 hover:scale-110'
                                                                    }`}
                                                                    onClick={(e) => handleSync(e, provider.id, provider.providerName)}
                                                                    disabled={isSyncing && !syncSuccess && !syncError}
                                                                    title={
                                                                        syncSuccess
                                                                            ? 'Sync completed successfully'
                                                                            : syncError
                                                                            ? 'Sync failed'
                                                                            : isSyncing
                                                                            ? 'Syncing in progress...'
                                                                            : 'Sync Tacitine data'
                                                                    }
                                                                >
                                                                    {getSyncIcon()}
                                                                </button>
                                                            )}

                                                            {selectedProvider === provider.id && <IconCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </>
                                    ) : (
                                        <li className="px-4 py-5 text-center">
                                            <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <IconBuilding className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">No providers</p>
                                        </li>
                                    )}

                                    {allProviders.length > 0 && (
                                        <li className="sticky bottom-0 bg-white dark:bg-dark border-t dark:border-white/10">
                                            <div className="px-3 py-2">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs text-gray-500 truncate">
                                                        <span className="font-medium">{selectedProviderName}</span>
                                                    </span>
                                                    {isSyncing && !syncSuccess && !syncError && (
                                                        <span className="text-xs text-primary px-2 py-1 rounded bg-primary/10 flex items-center gap-1">
                                                            <div className="animate-spin rounded-full h-2 w-2 border border-primary border-t-transparent"></div>
                                                            {syncStep === 'bandwidth' ? 'Bandwidth...' : syncStep === 'smartbytes' ? 'Smartbytes...' : 'Syncing...'}
                                                        </span>
                                                    )}
                                                    {syncSuccess && (
                                                        <span className="text-xs text-success px-2 py-1 rounded bg-success/10 flex items-center gap-1">
                                                            <IconCircleCheck className="w-3 h-3" />
                                                            Synced
                                                        </span>
                                                    )}
                                                    {syncError && (
                                                        <span className="text-xs text-danger px-2 py-1 rounded bg-danger/10 flex items-center gap-1">
                                                            <span className="text-xs">✗</span>
                                                            Failed
                                                        </span>
                                                    )}
                                                    <button
                                                        type="button"
                                                        className="text-xs text-gray-500 hover:text-primary px-1.5 py-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                                        onClick={() => {
                                                            setProviderDropdownOpen(false);
                                                        }}
                                                    >
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                        </li>
                                    )}
                                </ul>
                            </Dropdown>
                        </div>

                        <div className="dropdown shrink-0 flex">
                            <Dropdown
                                offset={[0, 8]}
                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                btnClassName="relative group block"
                                button={<img className="w-9 h-9 rounded-full object-cover saturate-50 group-hover:saturate-100" src="/assets/images/skisp-new-logo Icon.png" alt="userProfile" />}
                            >
                                <ul className="text-dark dark:text-white-dark !py-0 w-[230px] font-semibold dark:text-white-light/90">
                                    <li>
                                        <div className="flex items-center px-4 py-4">
                                            <img className="rounded-md w-10 h-10 object-cover" src="/assets/images/skisp-new-logo Icon.png" alt="userProfile" />
                                            <div className="ltr:pl-4 rtl:pr-4 truncate">
                                                <h4 className="text-base">
                                                    {loginData?.roleName || 'No role'}
                                                    <span className="text-xs bg-success-light rounded text-success px-1 ltr:ml-2 rtl:ml-2"></span>
                                                </h4>
                                                <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                                                    {loginData?.staffName || 'No staffName'}
                                                </button>
                                            </div>
                                        </div>
                                    </li>
                                    <li className="border-t border-white-light dark:border-white-light/10">
                                        <button className="text-danger !py-3" onClick={handleLogout}>
                                            Sign Out
                                        </button>
                                    </li>
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
