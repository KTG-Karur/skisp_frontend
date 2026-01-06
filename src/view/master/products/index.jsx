import { useState, useMemo, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Table from '../../../util/Table';
import ModelViewBox from '../../../util/ModelViewBox';
import { findArrObj, showMessage } from '../../../util/AllFunction';
import ProductFormContainer from './formContainer';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconSearch from '../../../components/Icon/IconSearch';
import IconPlus from '../../../components/Icon/IconPlus';
import IconShoppingCart from '../../../components/Icon/IconShoppingCart';
import IconRefresh from '../../../components/Icon/IconRefresh';
import Tippy from '@tippyjs/react';
import _ from 'lodash';
import { getProducts, createProduct, updateProduct, deleteProduct, resetProductStatus } from '../../../redux/productSlice';
import { createUplode, resetUplodeStatus } from '../../../redux/uplodeSlice';
import { baseURL } from '../../../api/ApiConfig';

const Products = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Products');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());

    const dispatch = useDispatch();
    const { productData, loading, error, getProductsSuccess, createProductSuccess, updateProductSuccess, deleteProductSuccess } = useSelector((state) => state.ProductSlice);

    const [modal, setModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);

    // Form state like Employees component
    const [state, setState] = useState({
        productNo: '',
        productName: '',
        productComposition: '',
        size: '',
        fabricName: '',
        washingDetails: '',
        fillingMaterial: '',
        price: '',
        moq: '',
        packaging: '',
        productImageFile: null,
        productImage: '',
    });

    const [errors, setErrors] = useState({});
    const dataToProcessRef = useRef(null);

    const stats = useMemo(() => {
        const totalProducts = productData?.length || 0;
        const activeProducts = productData?.filter((p) => p.isActive).length || 0;

        return { totalProducts, activeProducts };
    }, [productData]);

    const { uplodeErrors, uplodes, uplodeLoading, createUplodeSuccess, createUplodeFailed } = useSelector((state) => ({
        uplodeErrors: state.UplodeSlice.error,
        uplodes: state.UplodeSlice.uplodes,
        uplodeLoading: state.UplodeSlice.loading,
        createUplodeSuccess: state.UplodeSlice.createUplodeSuccess,
        createUplodeFailed: state.UplodeSlice.createUplodeFailed,
    }));

    const columns = useMemo(
        () => [
            {
                Header: 'PRODUCT',
                accessor: 'productNo',
                sort: true,
                Cell: ({ value, row }) => (
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-shrink-0">
                            <img src={baseURL + row.original.productImage} alt="Product" crossOrigin="anonymous" className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm" />
                            <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${row.original.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <button onClick={() => onEditForm(row.original)} className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors text-left block">
                                {value || 'N/A'}
                            </button>
                            <p className="text-sm text-gray-600 truncate">{row.original.productName || 'Unnamed Product'}</p>
                        </div>
                    </div>
                ),
            },
            {
                Header: 'COMPOSITION',
                accessor: 'productComposition',
                sort: true,
                Cell: ({ value }) => (
                    <div className="max-w-[200px]">
                        <span className="text-sm text-gray-700 line-clamp-2">{value || 'N/A'}</span>
                    </div>
                ),
            },
            {
                Header: 'SIZE & FABRIC',
                accessor: 'size',
                sort: true,
                Cell: ({ row }) => (
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-gray-900 block">{row.original.size || 'N/A'}</span>
                        <span className="text-xs text-gray-500 block">{row.original.fabricName || 'N/A'}</span>
                    </div>
                ),
            },
            {
                Header: 'MOQ & PACKAGING',
                accessor: 'moq',
                sort: true,
                Cell: ({ row }) => (
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-gray-900 block">{row.original.moq ? `MOQ: ${row.original.moq}` : 'MOQ: N/A'}</span>
                        <span className="text-xs text-gray-500 block">{row.original.packaging ? `Pack: ${row.original.packaging}` : 'Packaging: N/A'}</span>
                    </div>
                ),
            },
            {
                Header: 'PRICE',
                accessor: 'price',
                sort: true,
                Cell: ({ value }) => <span className="text-sm font-bold text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">${value || '0.00'}</span>,
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
                                    <Tippy content="Edit Product">
                                        <span className="text-success me-2 cursor-pointer" onClick={() => onEditForm(row.original)}>
                                            <IconPencil />
                                        </span>
                                    </Tippy>
                                )}
                                {_.includes(accessIds, '4') && (
                                    <Tippy content="Deactivate Product">
                                        <span className="text-danger me-2 cursor-pointer" onClick={() => handleDeactivate(row.original)}>
                                            <IconTrashLines />
                                        </span>
                                    </Tippy>
                                )}
                            </>
                        ) : (
                            <>
                                {_.includes(accessIds, '6') && (
                                    <Tippy content="Activate Product">
                                        <span className="text-success me-2 cursor-pointer" onClick={() => handleActivate(row.original)}>
                                            <IconRefresh />
                                        </span>
                                    </Tippy>
                                )}
                            </>
                        )}
                    </div>
                ),
                width: 120,
            },
        ],
        [accessIds]
    );

    const filteredProducts = useMemo(() => {
        if (!searchTerm) return productData || [];

        const searchLower = searchTerm.toLowerCase();
        return (productData || []).filter(
            (product) =>
                (product.productNo || '').toLowerCase().includes(searchLower) ||
                (product.productName || '').toLowerCase().includes(searchLower) ||
                (product.fabricName || '').toLowerCase().includes(searchLower) ||
                (product.productComposition || '').toLowerCase().includes(searchLower) ||
                (product.moq || '').toLowerCase().includes(searchLower) ||
                (product.packaging || '').toLowerCase().includes(searchLower)
        );
    }, [productData, searchTerm]);

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return filteredProducts.slice(startIndex, endIndex);
    };

    useEffect(() => {
        dispatch(getProducts({}));
    }, [dispatch]);

    useEffect(() => {
        if (getProductsSuccess) {
            dispatch(resetProductStatus());
        }
    }, [getProductsSuccess]);

    useEffect(() => {
        if (createUplodeSuccess) {
            showMessage('success', 'Product image uploaded successfully');
            dispatch(resetUplodeStatus());
            dispatch(getProducts({}));
            closeModel();
        }
    }, [createUplodeSuccess, dispatch]);

    useEffect(() => {
        if (createUplodeFailed) {
            showMessage('error', `Image upload failed: ${uplodeErrors || 'Unknown error'}`);
            dispatch(resetUplodeStatus());
        }
    }, [createUplodeFailed, uplodeErrors, dispatch]);

    useEffect(() => {
        if (createProductSuccess && dataToProcessRef.current) {
            const currentData = dataToProcessRef.current;

            // Check if we have a new image file to upload
            const hasNewImage = currentData.productImageFile instanceof File;

            if (hasNewImage) {
                const uploadFormData = new FormData();
                uploadFormData.append('product', currentData.productImageFile); // Use the actual file

                const newlyCreatedProduct = productData[0];
                const newProductId = newlyCreatedProduct?.productId;

                if (newProductId) {
                    dispatch(createUplode({ request: uploadFormData, id: newProductId }));
                } else {
                    showMessage('warning', 'Product created but cannot upload image: Missing product ID');
                    showMessage('success', 'Product created successfully (image upload failed)');
                    dispatch(getProducts({}));
                    closeModel();
                    dispatch(resetProductStatus());
                }
            } else {
                showMessage('success', 'Product created successfully');
                dispatch(getProducts({}));
                closeModel();
                dispatch(resetProductStatus());
            }
        }
    }, [createProductSuccess, productData, dispatch]);

    // Similarly update the useEffect for updateProductSuccess
    useEffect(() => {
        if (updateProductSuccess && dataToProcessRef.current) {
            const currentData = dataToProcessRef.current;

            // Check if we have a new image file to upload
            const hasNewImage = currentData.productImageFile instanceof File;

            if (hasNewImage && selectedProduct) {
                const uploadFormData = new FormData();
                uploadFormData.append('product', currentData.productImageFile); // Use the actual file

                if (selectedProduct.productId) {
                    dispatch(createUplode({ request: uploadFormData, id: selectedProduct.productId }));
                } else {
                    showMessage('warning', 'Product updated but cannot upload image: Missing product ID');
                    dispatch(getProducts({}));
                    setModal(false);
                    // setFormData(null);
                    dataToProcessRef.current = null;
                    dispatch(resetProductStatus());
                }
            } else {
                showMessage('success', 'Product updated successfully');
                dispatch(getProducts({}));
                setModal(false);
                // setFormData(null);
                dataToProcessRef.current = null;
                dispatch(resetProductStatus());
            }
        }
    }, [updateProductSuccess, dispatch, selectedProduct]);

    useEffect(() => {
        if (updateProductSuccess && dataToProcessRef.current) {
            const currentData = dataToProcessRef.current;

            const hasImage = currentData.productImage && Array.isArray(currentData.productImage) && currentData.productImage[0]?.file instanceof File;

            if (hasImage && selectedProduct) {
                const uploadFormData = new FormData();
                uploadFormData.append('product', currentData.productImageFile);

                if (selectedProduct.productId) {
                    dispatch(createUplode({ request: uploadFormData, id: selectedProduct.productId }));
                } else {
                    showMessage('warning', 'Product updated but cannot upload image: Missing product ID');
                    dispatch(getProducts({}));
                    closeModel();
                    dispatch(resetProductStatus());
                }
            } else {
                showMessage('success', 'Product updated successfully');
                dispatch(getProducts({}));
                closeModel();
                dispatch(resetProductStatus());
            }
        }
    }, [updateProductSuccess, dispatch, selectedProduct]);

    useEffect(() => {
        if (deleteProductSuccess) {
            showMessage('success', 'Product deleted successfully');
            dispatch(resetProductStatus());
        }
    }, [deleteProductSuccess, dispatch]);

    useEffect(() => {
        if (error) {
            showMessage('error', error);
            dispatch(resetProductStatus());
        }
    }, [error, dispatch]);

    // Like Employees component - simple close without confirmation
    const closeModel = () => {
        setIsEdit(false);
        setModal(false);
        onFormClear();
    };

    const onFormClear = () => {
        setState({
            productNo: '',
            productName: '',
            productComposition: '',
            size: '',
            fabricName: '',
            washingDetails: '',
            fillingMaterial: '',
            price: '',
            moq: '',
            packaging: '',
            productImageFile: null,
            productImage: '',
        });
        setSelectedProduct(null);
        setErrors({});
        dataToProcessRef.current = null;
    };

    const createModel = () => {
        onFormClear();
        setIsEdit(false);
        setModal(true);
        setErrors({});
    };

    const onEditForm = (product) => {
        if (!product.isActive) {
            showMessage('warning', 'Cannot edit inactive products. Please activate the product first.');
            return;
        }

        setState({
            productNo: product.productNo || '',
            productName: product.productName || '',
            productComposition: product.productComposition || '',
            size: product.size || '',
            fabricName: product.fabricName || '',
            washingDetails: product.washingDetails || '',
            fillingMaterial: product.fillingMaterial || '',
            price: product.price || '',
            moq: product.moq || '',
            packaging: product.packaging || '',
            productImageFile: null,
            productImage: product.productImage || '',
        });
        setIsEdit(true);
        setSelectedProduct(product);
        setErrors({});
        setModal(true);
    };

    const handleActivate = (product) => {
        showMessage('warning', 'Are you sure you want to activate this product?', () => {
            dispatch(
                updateProduct({
                    request: { isActive: true },
                    productId: product.productId,
                })
            );
        });
    };

    const handleDeactivate = (product) => {
        showMessage('warning', 'Are you sure you want to deactivate this product?', () => {
            dispatch(
                updateProduct({
                    request: { isActive: false },
                    productId: product.productId,
                })
            );
        });
    };

    const validateForm = () => {
        const newErrors = {};
        if (!state.productNo) newErrors.productNo = 'Product number is required';
        if (!state.productName) newErrors.productName = 'Product name is required';
        if (!state.price) newErrors.price = 'Price is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateForm()) return;

        let priceValue = 0;
        if (state.price) {
            const numericPrice = String(state.price).replace(/[^0-9.-]+/g, '');
            priceValue = parseFloat(numericPrice) || 0;
        }

        const formattedData = {
            productNo: state.productNo || '',
            productName: state.productName || '',
            productComposition: state.productComposition || '',
            size: state.size || '',
            fabricName: state.fabricName || '',
            washingDetails: state.washingDetails || '',
            fillingMaterial: state.fillingMaterial || '',
            moq: state.moq || '',
            packaging: state.packaging || '',
            isActive: true,
            price: priceValue,
        };

        dataToProcessRef.current = {
            ...state,
            formattedData,
            productImageFile: state.productImageFile,
        };

        try {
            if (isEdit && selectedProduct) {
                await dispatch(
                    updateProduct({
                        request: formattedData,
                        productId: selectedProduct.productId,
                    })
                );
            } else {
                await dispatch(createProduct(formattedData));
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', 'Failed to save product data');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;

        if (type === 'file') {
            setState((prev) => ({
                ...prev,
                productImageFile: files[0],
                productImage: files[0] ? URL.createObjectURL(files[0]) : prev.productImage,
            }));
        } else {
            setState((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(0);
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Enhanced Header */}
            <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -translate-x-24 translate-y-24"></div>

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                                <IconShoppingCart className="w-6 h-6 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold">Product Catalog</h1>
                        </div>
                        <p className="text-blue-100 opacity-90 text-lg max-w-2xl">Manage your textile products, inventory, and product information in one place</p>

                        {/* Stats */}
                        <div className="flex items-center space-x-6 mt-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <span className="text-blue-100">
                                    <span className="font-bold">{stats.activeProducts}</span> Active Products
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                <span className="text-blue-100">
                                    <span className="font-bold">{stats.totalProducts}</span> Total Products
                                </span>
                            </div>
                        </div>
                    </div>
                    {_.includes(accessIds, '2') && (
                        <button
                            onClick={createModel}
                            disabled={loading}
                            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-2xl font-semibold flex items-center space-x-3 transition-all duration-200 hover:scale-105 shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <IconPlus className="w-5 h-5" />
                            <span>Add New Product</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="bg-gradient-to-br from-white via-gray-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1 max-w-2xl">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <IconSearch className="w-5 h-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search products by name, number, fabric, composition, MOQ, or packaging..."
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:ring-3 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 bg-white/80 focus:bg-white shadow-sm hover:shadow-md"
                            />
                            {searchTerm && (
                                <button onClick={() => handleSearch('')} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18-6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium text-gray-600 bg-white px-3 py-2 rounded-lg border border-gray-200">
                            {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
                        </span>
                    </div>
                </div>
            </div>

            {/* Enhanced Products Table */}
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
                    totalCount={filteredProducts.length}
                    totalPages={Math.ceil(filteredProducts.length / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    classStyle="rounded-2xl"
                    hover={true}
                    compact={false}
                    loading={loading}
                />
            </div>

            {/* Product Modal - Using inline form like Employees component */}
            <ModelViewBox
                modal={modal}
                setModel={closeModel}
                modelHeader={isEdit ? 'Edit Product' : 'Add Product'}
                modelSize="2xl"
                handleSubmit={onFormSubmit}
                isEdit={isEdit}
                saveBtn={true}
                btnName={isEdit ? 'Update Product' : 'Create Product'}
                loading={loading || uplodeLoading}
            >
                <div className="grid grid-cols-12 gap-4">
                    <div className="col-span-6">
                        <label>Product Number *</label>
                        <input type="text" name="productNo" value={state.productNo} onChange={handleChange} placeholder="Enter Product Number" className="form-input" />
                        {errors.productNo && <div className="text-danger">{errors.productNo}</div>}
                    </div>

                    <div className="col-span-6">
                        <label>Product Name *</label>
                        <input type="text" name="productName" value={state.productName} onChange={handleChange} placeholder="Enter Product Name" className="form-input" />
                        {errors.productName && <div className="text-danger">{errors.productName}</div>}
                    </div>

                    <div className="col-span-12">
                        <label>Product Composition</label>
                        <textarea name="productComposition" value={state.productComposition} onChange={handleChange} placeholder="Enter Product Composition" className="form-input" rows="3" />
                    </div>

                    <div className="col-span-6">
                        <label>Size</label>
                        <input type="text" name="size" value={state.size} onChange={handleChange} placeholder="Enter Size" className="form-input" />
                    </div>

                    <div className="col-span-6">
                        <label>Fabric Name</label>
                        <input type="text" name="fabricName" value={state.fabricName} onChange={handleChange} placeholder="Enter Fabric Name" className="form-input" />
                    </div>

                    <div className="col-span-6">
                        <label>Washing Details</label>
                        <input type="text" name="washingDetails" value={state.washingDetails} onChange={handleChange} placeholder="Enter Washing Details" className="form-input" />
                    </div>

                    <div className="col-span-6">
                        <label>Filling Material</label>
                        <input type="text" name="fillingMaterial" value={state.fillingMaterial} onChange={handleChange} placeholder="Enter Filling Material" className="form-input" />
                    </div>
                    <div className="col-span-6">
                        <label>MOQ</label>
                        <input type="text" name="moq" value={state.moq} onChange={handleChange} placeholder="Enter the MOQ " className="form-input" />
                    </div>

                    <div className="col-span-6">
                        <label>Packaging Details</label>
                        <input type="text" name="packaging" value={state.packaging} onChange={handleChange} placeholder="Enter the Pakagin Details" className="form-input" />
                    </div>

                    <div className="col-span-6">
                        <label>Price</label>
                        <input type="text" name="price" value={state.price} onChange={handleChange} placeholder="Enter Price" className="form-input" />
                        {errors.price && <div className="text-danger">{errors.price}</div>}
                    </div>

                    <div className="col-span-6">
                        <label>Product Image</label>
                        <input type="file" name="productImage" onChange={handleChange} className="form-input" accept="image/*" />
                        {state.productImage && (
                            <div className="mt-2">
                                <img
                                    src={state.productImage.startsWith('blob:') ? state.productImage : baseURL + state.productImage}
                                    alt="Product preview"
                                    crossOrigin="anonymous"
                                    className="w-20 h-20 object-cover rounded-lg border"
                                />
                            </div>
                        )}
                    </div>
                </div>
            </ModelViewBox>
        </div>
    );
};

export default Products;
