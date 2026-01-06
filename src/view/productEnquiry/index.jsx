import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Table from '../../util/Table';
import { findArrObj, showMessage, showConfirmationDialog } from '../../util/AllFunction';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconEye from '../../components/Icon/IconEye';
import IconSearch from '../../components/Icon/IconSearch';
import IconPlus from '../../components/Icon/IconPlus';
import IconUsers from '../../components/Icon/IconUsers';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconRefresh from '../../components/Icon/IconRefresh';
import Tippy from '@tippyjs/react';
import _ from 'lodash';
import { createUplode, resetUplodeStatus } from '../../redux/uplodeSlice';
// Import slices and actions
import { getProductEnquiries, createProductEnquiry, updateProductEnquiry, deleteProductEnquiry, resetProductEnquiryStatus } from '../../redux/productEnquirySlice';
import { getExpo } from '../../redux/expoSlice';
import { getProducts } from '../../redux/productSlice';
import { baseURL } from '../../api/ApiConfig';
import ProductEnquiryForm from './formContainer';

const ProductEnquiry = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Visitor Enquiry');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());

    const dispatch = useDispatch();

    // Redux selectors
    const { enquiryData, loading, error, createEnquirySuccess, updateEnquirySuccess, deleteEnquirySuccess , deleteVisitorCardSuccess , deleteVisitorCardFailed } = useSelector((state) => state.ProductEnquirySlice);
    const { expoData } = useSelector((state) => state.ExpoSlice);
    const { productData } = useSelector((state) => state.ProductSlice);
    const { errors, uplodes, loadings, createUplodeSuccess, createUplodeFailed } = useSelector((state) => ({
        errors: state.UplodeSlice.error,
        uplodes: state.UplodeSlice.uplodes,
        loadings: state.UplodeSlice.loading,
        createUplodeSuccess: state.UplodeSlice.createUplodeSuccess,
        createUplodeFailed: state.UplodeSlice.createUplodeFailed,
    }));

    const [searchTerm, setSearchTerm] = useState('');
    const [isEdit, setIsEdit] = useState(false);
    const [selectedEnquiry, setSelectedEnquiry] = useState(null);
    const [formKey, setFormKey] = useState(0);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        dispatch(getProductEnquiries({ showAll: true }));
        dispatch(getExpo({ showAll: true }));
        dispatch(getProducts({}));
    }, [dispatch]);

    // Handle success messages and form reset
    useEffect(() => {
        if (createEnquirySuccess) {
            showMessage('success', 'Enquiry created successfully');
            dispatch(resetProductEnquiryStatus());
            handleFormReset();
            dispatch(getProductEnquiries({ showAll: true }));
        }
        if (updateEnquirySuccess) {
            showMessage('success', 'Enquiry updated successfully');
            dispatch(resetProductEnquiryStatus());
            handleFormReset();
            dispatch(getProductEnquiries({ showAll: true }));
        }
        if (deleteEnquirySuccess) {
            showMessage('success', 'Enquiry deactivated successfully');
            dispatch(resetProductEnquiryStatus());
            dispatch(getProductEnquiries({ showAll: true }));
        }
    }, [createEnquirySuccess, updateEnquirySuccess, deleteEnquirySuccess, dispatch]);

    useEffect(() => {
        if (deleteVisitorCardSuccess) {
            showMessage('success', 'Visitor card image deleted successfully');
            dispatch(resetProductEnquiryStatus());
            dispatch(getProductEnquiries({ showAll: true }));
        }
        if (deleteVisitorCardFailed) {
            showMessage('error', 'Failed to delete visitor card image');
            dispatch(resetProductEnquiryStatus());
        }
    }, [deleteVisitorCardSuccess, deleteVisitorCardFailed, dispatch]);

    useEffect(() => {
        if (createUplodeSuccess) {
            showMessage('success', 'Visitor image uploaded successfully');
            dispatch(resetUplodeStatus());
            dispatch(getProductEnquiries({ showAll: true }));
        }
        if (createUplodeFailed) {
            showMessage('warning', 'Visitor image upload failed');
            dispatch(resetUplodeStatus());
        }
    }, [createUplodeSuccess, createUplodeFailed, dispatch]);

    // Statistics - count both active and inactive
    const stats = useMemo(() => {
        const totalEnquiries = enquiryData.length;
        const activeEnquiries = enquiryData.filter((e) => e.isActive).length;
        const totalProducts = enquiryData.reduce((sum, enquiry) => sum + (enquiry.products?.length || 0), 0);
        const sampleRequests = enquiryData.reduce((sum, enquiry) => sum + (enquiry.products?.filter((p) => p.sampleRequired).length || 0), 0);

        return { totalEnquiries, activeEnquiries, totalProducts, sampleRequests };
    }, [enquiryData]);

    const filteredEnquiries = useMemo(() => {
        if (!searchTerm) return enquiryData;

        const searchLower = searchTerm.toLowerCase();
        return enquiryData.filter(
            (enquiry) =>
                (enquiry.enquiryNo || '').toLowerCase().includes(searchLower) ||
                (enquiry.visitorName || '').toLowerCase().includes(searchLower) ||
                (enquiry.companyName || '').toLowerCase().includes(searchLower) ||
                (enquiry.email || '').toLowerCase().includes(searchLower) ||
                (expoData.find((e) => e.id === enquiry.expoId)?.expoName || '').toLowerCase().includes(searchLower) ||
                (enquiry.natureOfEnquiry || '').toLowerCase().includes(searchLower) ||
                enquiry.products?.some((p) => p.productNo.toLowerCase().includes(searchLower) || p.productName.toLowerCase().includes(searchLower)) ||
                false
        );
    }, [enquiryData, searchTerm, expoData]);

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredEnquiries.slice(startIndex, endIndex);
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    // Table columns
    const columns = useMemo(
        () => [
            {
                Header: 'ENQUIRY',
                accessor: 'enquiryNo',
                sort: true,
                Cell: ({ value, row }) => {
                    const expo = expoData.find((e) => e.id === row.original.expoId);
                    return (
                        <div className="flex items-center space-x-4">
                            <div className="relative flex-shrink-0">
                                <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${row.original.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                            </div>
                            <div className="min-w-0 flex-1">
                                <button
                                    onClick={() => handleEnquiryClick(row.original)}
                                    className={`text-sm font-semibold hover:text-blue-600 transition-colors text-left block ${!row.original.isActive ? 'text-gray-500' : 'text-gray-900'}`}
                                >
                                    {value || 'N/A'}
                                </button>
                                <p className={`text-sm truncate ${!row.original.isActive ? 'text-gray-400' : 'text-gray-600'}`}>{row.original.visitorName || 'Unknown Visitor'}</p>
                                <p className="text-xs text-gray-500 truncate">{expo?.expoName || 'No Expo'}</p>
                                <div className="flex items-center space-x-1 mt-1">
                                    <span className={`text-xs px-2 py-1 rounded-full ${!row.original.isActive ? 'bg-gray-100 text-gray-600' : 'bg-blue-100 text-blue-800'}`}>
                                        {row.original.products?.length || 0} products
                                    </span>
                                    {!row.original.isActive && <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Inactive</span>}
                                </div>
                            </div>
                        </div>
                    );
                },
            },
            {
                Header: 'VISITOR INFO',
                accessor: 'companyName',
                sort: true,
                Cell: ({ row }) => (
                    <div className="space-y-1">
                        <span className={`text-sm font-medium block ${!row.original.isActive ? 'text-gray-500' : 'text-gray-900'}`}>{row.original.companyName || 'N/A'}</span>
                        <span className="text-xs text-gray-500 block">
                            {row.original.city}, {row.original.country}
                        </span>
                        <span className="text-xs text-blue-600 block">{row.original.email}</span>
                    </div>
                ),
            },
            {
                Header: 'SAMPLES & QUANTITY',
                accessor: 'sampleRequired',
                sort: true,
                Cell: ({ row }) => {
                    const products = row.original.products || [];
                    const sampleProducts = products.filter((p) => p.sampleRequired).length;
                    const totalQuantity = products.reduce((sum, p) => sum + (p.quantity || 0), 0);

                    return (
                        <div className="space-y-2">
                            <div className="flex flex-wrap gap-1">
                                <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                        sampleProducts > 0
                                            ? !row.original.isActive
                                                ? 'bg-gray-100 text-gray-600 border border-gray-200'
                                                : 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200'
                                            : !row.original.isActive
                                            ? 'bg-gray-100 text-gray-400 border border-gray-200'
                                            : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 border border-gray-200'
                                    }`}
                                >
                                    {sampleProducts > 0 ? (
                                        <>
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                            {sampleProducts} samples
                                        </>
                                    ) : (
                                        'No Samples'
                                    )}
                                </span>
                            </div>
                            {totalQuantity > 0 && (
                                <div className={`px-2 py-1 rounded-lg border ${!row.original.isActive ? 'bg-gray-100 border-gray-200' : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'}`}>
                                    <span className={`text-xs font-bold block text-center ${!row.original.isActive ? 'text-gray-600' : 'text-blue-700'}`}>
                                        Total: {totalQuantity.toLocaleString()} units
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: 'STATUS',
                accessor: 'isActive',
                sort: true,
                Cell: ({ value }) => (
                    <div className="flex items-center">
                        <button
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                                value ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg' : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg'
                            }`}
                        >
                            {value ? 'Active' : 'Inactive'}
                        </button>
                    </div>
                ),
            },
            {
                Header: 'ACTIONS',
                accessor: 'actions',
                Cell: ({ row }) => (
                    <div className="flex items-center space-x-2">
                        {row.original.isActive ? (
                            <>
                                {_.includes(accessIds, '3') && (
                                    <Tippy content="Edit Enquiry">
                                        <button className="text-success p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors" onClick={() => handleEdit(row.original)}>
                                            <IconPencil className="w-4 h-4" />
                                        </button>
                                    </Tippy>
                                )}
                                {_.includes(accessIds, '4') && (
                                    <Tippy content="Deactivate Enquiry">
                                        <button className="text-danger p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors" onClick={() => handleDeactivate(row.original)}>
                                            <IconTrashLines className="w-4 h-4" />
                                        </button>
                                    </Tippy>
                                )}
                            </>
                        ) : (
                            <>
                                {_.includes(accessIds, '6') && (
                                    <Tippy content="Activate Enquiry">
                                        <button className="text-success p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors" onClick={() => handleActivate(row.original)}>
                                            <IconRefresh className="w-4 h-4" />
                                        </button>
                                    </Tippy>
                                )}
                            </>
                        )}
                    </div>
                ),
                width: 120,
            },
        ],
        [expoData, accessIds]
    );

    const handleEnquiryClick = (enquiry) => {
        console.log('Enquiry clicked:', enquiry);
    };

    const handleEdit = (enquiry) => {
        if (!enquiry.isActive) {
            showMessage('warning', 'Cannot edit inactive enquiries. Please activate the enquiry first.');
            return;
        }
        setSelectedEnquiry(enquiry);
        setIsEdit(true);
        document.getElementById('enquiry-form-section').scrollIntoView({ behavior: 'smooth' });
    };

    const handleDeactivate = async (enquiry) => {
        const confirmed = await showConfirmationDialog('Are you sure you want to deactivate this enquiry?', 'Yes, Deactivate', 'This enquiry will be marked as inactive but will remain in the list.');

        if (confirmed) {
            dispatch(
                updateProductEnquiry({
                    request: { isActive: false },
                    enquiryId: enquiry.enquiryId,
                })
            );
        }
    };

    const handleActivate = async (enquiry) => {
        const confirmed = await showConfirmationDialog('Are you sure you want to activate this enquiry?', 'Yes, Activate', 'This enquiry will be marked as active and can be edited.');

        if (confirmed) {
            dispatch(
                updateProductEnquiry({
                    request: { isActive: true },
                    enquiryId: enquiry.enquiryId,
                })
            );
        }
    };

    const handleFormSubmit = async (enquiryData, visitingCardFiles) => {
        try {
            let enquiryResponse;

            if (isEdit && selectedEnquiry) {
                enquiryResponse = await dispatch(
                    updateProductEnquiry({
                        request: enquiryData,
                        enquiryId: selectedEnquiry.enquiryId,
                    })
                ).unwrap();
            } else {
                enquiryResponse = await dispatch(createProductEnquiry(enquiryData)).unwrap();
            }

            if (visitingCardFiles && visitingCardFiles.length > 0 && enquiryResponse?.data[0]?.enquiryId) {
                const uploadFormData = new FormData();

                visitingCardFiles.forEach((file, index) => {
                    uploadFormData.append('visitingCard', file);
                });

                dispatch(
                    createUplode({
                        request: uploadFormData,
                        id: enquiryResponse?.data[0]?.enquiryId,
                    })
                ).then((uploadResult) => {
                    if (createUplodeSuccess) {
                        showMessage('success', 'Enquiry and visitor images uploaded successfully');
                        dispatch(getProductEnquiries({ showAll: true }));
                    } else if (createUplodeFailed) {
                        showMessage('warning', 'Enquiry saved but some visitor images failed to upload');
                    }
                });
            } else {
                showMessage('success', isEdit ? 'Enquiry updated successfully' : 'Enquiry created successfully');
            }

            handleFormReset();
        } catch (error) {
            showMessage('error', `Failed to ${isEdit ? 'update' : 'create'} enquiry: ${error.message}`);
        }
    };

    const handleFormReset = () => {
        setSelectedEnquiry(null);
        setIsEdit(false);
        setFormKey((prevKey) => prevKey + 1);
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(0);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Enhanced Header with Gradient */}
            <div className="bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-600 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-24 translate-y-24"></div>
                <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <IconUsers className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold">Visitor Enquiries</h1>
                    </div>
                    <p className="text-blue-100 opacity-90 text-lg max-w-2xl">Capture and manage visitor enquiries with multiple products from textile fairs and exhibitions</p>
                </div>
            </div>

            {/* Enquiry Form Section */}
            <div id="enquiry-form-section">
                {_.includes(accessIds, '2') && (
                    <ProductEnquiryForm
                        key={formKey}
                        onSubmit={handleFormSubmit}
                        onReset={handleFormReset}
                        isEdit={isEdit}
                        selectedEnquiry={selectedEnquiry}
                        loading={loading}
                        expos={expoData}
                        products={productData}
                    />
                )}
            </div>

            {/* Enhanced Search Bar with Gradient */}
            <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 max-w-2xl">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <IconSearch className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search enquiries by visitor, company, product, expo, or enquiry details..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/80 focus:bg-white shadow-sm hover:shadow-md"
                            />
                            {searchTerm && (
                                <button onClick={() => handleSearch('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
                            {filteredEnquiries.length} {filteredEnquiries.length === 1 ? 'enquiry' : 'enquiries'} found
                        </span>
                        <span className="text-sm font-medium text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">{stats.activeEnquiries} active</span>
                    </div>
                </div>
            </div>

            {/* Enhanced Enquiries Table */}
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <Table
                    columns={columns}
                    data={getPaginatedData()}
                    Title=""
                    isSearchable={false}
                    isSortable={true}
                    pagination={true}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={filteredEnquiries.length}
                    totalPages={Math.ceil(filteredEnquiries.length / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    classStyle="rounded-2xl"
                    hover={true}
                    compact={false}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default ProductEnquiry;
