import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import React, { Fragment } from 'react';

function ModelViewBox(props) {
    const {
        modal,
        setModel,
        children,
        modelHeader,
        cancelBtn = true,
        modelSize,
        saveBtn = true,
        handleSubmit,
        btnName = false,
        isEdit,
        modelHead = false,
        backgroundColor = 'bg-gray-50',
        headerBg = 'bg-gradient-to-r from-blue-600 to-indigo-700',
        closeIconColor = 'text-white',
        showBackdropBlur = true,
        customHeader = false,
        isLoading = false,
    } = props;

    const handleClose = () => {
        setModel(false);
    };

    const modalSizeClass = modelSize === 'lg' ? 'max-w-4xl' : 
                          modelSize === 'sm' ? 'max-w-md' : 
                          modelSize === 'xl' ? 'max-w-6xl' : 
                          modelSize === 'xs' ? 'max-w-xs' : 'max-w-2xl';

    // Custom close icon SVG
    const CloseIcon = () => (
        <svg 
            className="w-5 h-5" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
        >
            <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M6 18L18 6M6 6l12 12" 
            />
        </svg>
    );

    // Loading spinner SVG
    const LoadingSpinner = () => (
        <svg 
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" 
            fill="none" 
            viewBox="0 0 24 24"
        >
            <circle 
                className="opacity-25" 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="4"
            />
            <path 
                className="opacity-75" 
                fill="currentColor" 
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
        </svg>
    );

    return (
        <Transition show={modal} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={handleClose}>
                <TransitionChild
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div 
                        className={`fixed inset-0 bg-black/60 transition-all duration-300 ${
                            showBackdropBlur ? 'backdrop-blur-sm' : ''
                        }`} 
                        aria-hidden="true" 
                    />
                </TransitionChild>

                <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
                    <TransitionChild
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <DialogPanel 
                            className={`
                                bg-white rounded-xl shadow-2xl w-full ${modalSizeClass} 
                                mx-auto transform transition-all duration-300
                                border border-gray-100 overflow-hidden
                                hover:shadow-2xl
                            `}
                        >
                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleSubmit();
                            }}>
                                {/* Header */}
                                <div className={`
                                    flex items-center justify-between p-6 border-b border-white/20 
                                    rounded-t-xl text-white relative overflow-hidden
                                    ${headerBg}
                                `}>
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5"></div>
                                    
                                    <div className="relative z-10 flex items-center space-x-3">
                                        {customHeader || (
                                            <>
                                                <div className="flex items-center justify-center w-8 h-8 bg-white/20 rounded-lg">
                                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                                </div>
                                                <Dialog.Title as="h4" className="text-xl font-bold tracking-tight">
                                                    {`${modelHeader}`}
                                                </Dialog.Title>
                                            </>
                                        )}
                                    </div>
                                    
                                    <button 
                                        onClick={handleClose} 
                                        className={`
                                            relative z-10 p-1.5 rounded-full transition-all duration-200 
                                            hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 
                                            ${closeIconColor} hover:scale-110
                                        `}
                                        disabled={isLoading}
                                    >
                                        <CloseIcon />
                                    </button>
                                </div>

                                {/* Content */}
                                <div className={`
                                    p-6 transition-all duration-300 max-h-[70vh] overflow-y-auto
                                    ${backgroundColor}
                                `}>
                                    <div className="mb-1">
                                        {children}
                                    </div>
                                    
                                    {/* Footer Actions */}
                                    <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
                                        {cancelBtn && (
                                            <button 
                                                onClick={handleClose} 
                                                type="button" 
                                                className="
                                                    px-6 py-2.5 text-sm font-medium text-gray-700 
                                                    bg-white border border-gray-300 rounded-lg 
                                                    hover:bg-gray-50 hover:border-gray-400 
                                                    focus:outline-none focus:ring-2 focus:ring-gray-200 
                                                    transition-all duration-200 transform hover:scale-105
                                                    shadow-sm hover:shadow-md disabled:opacity-50
                                                    disabled:cursor-not-allowed disabled:hover:scale-100
                                                "
                                                disabled={isLoading}
                                            >
                                                Cancel
                                            </button>
                                        )}
                                        {saveBtn && (
                                            <button 
                                                type="submit" 
                                                disabled={isLoading}
                                                className="
                                                    px-6 py-2.5 text-sm font-medium text-white 
                                                    bg-gradient-to-r from-blue-600 to-indigo-700 
                                                    rounded-lg hover:from-blue-700 hover:to-indigo-800 
                                                    focus:outline-none focus:ring-2 focus:ring-blue-500 
                                                    focus:ring-offset-2 transition-all duration-200 
                                                    transform hover:scale-105 shadow-lg hover:shadow-xl
                                                    disabled:opacity-50 disabled:cursor-not-allowed
                                                    disabled:hover:scale-100 flex items-center
                                                "
                                            >
                                                {isLoading && <LoadingSpinner />}
                                                {`${isEdit ? 'Update' : btnName ? btnName : 'Save'}`}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </form>
                        </DialogPanel>
                    </TransitionChild>
                </div>
            </Dialog>
        </Transition>
    );
}

export default ModelViewBox;