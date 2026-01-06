import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { showMessage } from '../../../util/AllFunction';
import IconInfoCircle from '../../../components/Icon/IconInfoCircle';
import IconCamera from '../../../components/Icon/IconCamera';
import { baseURL } from '../../../api/ApiConfig';

const ProductFormContainer = forwardRef(({ product, isEdit, onSubmit, onClose, loading }, ref) => {
    const [formData, setFormData] = useState({
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
    });

    const [errors, setErrors] = useState({});
    const [imagePreview, setImagePreview] = useState('');
    const [productImageFile, setProductImageFile] = useState(null);

    useEffect(() => {
        if (product && isEdit) {
            setFormData({
                productNo: product?.productNo || '',
                productName: product?.productName || '',
                productComposition: product?.productComposition || '',
                size: product?.size || '',
                fabricName: product?.fabricName || '',
                washingDetails: product?.washingDetails || '',
                fillingMaterial: product?.fillingMaterial || '',
                price: product?.price ? `$${product.price}` : '',
                moq: product?.moq || '',
                packaging: product?.packaging || '',
            });

            if (product?.productImage) {
                setImagePreview(`${baseURL}${product.productImage}`);
            }
        } else {
            setFormData({
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
            });
            setImagePreview('');
        }
        setProductImageFile(null);
    }, [product, isEdit]);

    // Handle product image upload
    const handleProductImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                showMessage('error', 'Please select a valid image file (JPEG, PNG, etc.)');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                showMessage('error', 'Image size should be less than 5MB');
                return;
            }

            setProductImageFile(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeProductImage = () => {
        setImagePreview('');
        setProductImageFile(null);
    };

    const handleInputChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // Validation function
    const validateAndSubmit = () => {
        // Validation
        const requiredFields = ['productNo', 'productName', 'productComposition', 'size', 'fabricName', 'washingDetails', 'price'];
        const newErrors = {};

        requiredFields.forEach((field) => {
            if (!formData[field]) {
                newErrors[field] = `${field.replace(/([A-Z])/g, ' $1')} is required`;
            }
        });

        if (!isEdit && !productImageFile) {
            newErrors.productImage = 'Product image is required';
        }

        // Price validation
        const priceValue = formData.price ? parseFloat(String(formData.price).replace(/[^0-9.-]+/g, '')) : 0;
        if (isNaN(priceValue) || priceValue <= 0) {
            newErrors.price = 'Please enter a valid price';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showMessage('error', 'Please fill in all required fields correctly');
            return false; // Return false if validation fails
        }

        setErrors({});

        // Prepare data for parent component
        const submitData = {
            ...formData,
            productImageFile: productImageFile,
        };

        if (onSubmit) {
            onSubmit(submitData);
        }

        return true; // Return true if validation passes
    };

    // Expose the validateAndSubmit function to parent via ref
    useImperativeHandle(ref, () => ({
        validateAndSubmit: () => {
            return validateAndSubmit();
        },
    }));

    // Call onSubmit when form data changes
    useEffect(() => {
        if (onSubmit) {
            const currentData = {
                ...formData,
                productImageFile: productImageFile,
            };
            onSubmit(currentData);
        }
    }, [formData, productImageFile]);

    return (
        <div className="space-y-6">
            {/* Product Image Section */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <IconCamera className="w-5 h-5 mr-2 text-blue-600" />
                    Product Image
                    {!isEdit && <span className="text-red-500 ml-1">*</span>}
                </h3>

                <div className="flex items-center space-x-6">
                    <div className="flex-shrink-0">
                        {imagePreview ? (
                            <div className="relative">
                                <img src={imagePreview} crossOrigin="anonymous" alt="Product preview" className="w-24 h-24 rounded-xl object-cover border-2 border-gray-300 shadow-md" />
                                {/* <button
                                    type="button"
                                    onClick={removeProductImage}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors shadow-lg"
                                >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button> */}
                            </div>
                        ) : (
                            <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50">
                                <IconCamera className="w-8 h-8 text-gray-400" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <label className="block mb-2">
                            <span className="text-sm font-medium text-gray-700">{isEdit ? 'Change Product Image' : 'Upload Product Image'}</span>
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleProductImageUpload}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-2">Upload product image (JPEG, PNG, WebP - max 5MB)</p>
                        {errors.productImage && <p className="text-red-500 text-xs mt-1">{errors.productImage}</p>}
                    </div>
                </div>
            </div>

            {/* Product Form Fields */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-200">Product Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Number */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Number *</label>
                        <input
                            type="text"
                            value={formData.productNo}
                            onChange={(e) => handleInputChange('productNo', e.target.value)}
                            placeholder="PRD-001"
                            className={`w-full border rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                                errors.productNo ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.productNo && <p className="text-red-500 text-xs mt-1">{errors.productNo}</p>}
                    </div>

                    {/* Product Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                        <input
                            type="text"
                            value={formData.productName}
                            onChange={(e) => handleInputChange('productName', e.target.value)}
                            placeholder="Enter product name"
                            className={`w-full border rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                                errors.productName ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.productName && <p className="text-red-500 text-xs mt-1">{errors.productName}</p>}
                    </div>

                    {/* MOQ (Minimum Order Quantity) */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Minimum Order Quantity (MOQ)</label>
                        <input
                            type="text"
                            value={formData.moq}
                            onChange={(e) => handleInputChange('moq', e.target.value)}
                            placeholder="e.g., 100 pieces, 50 units"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional - Minimum quantity for orders</p>
                    </div>

                    {/* Packaging */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Packaging Details</label>
                        <input
                            type="text"
                            value={formData.packaging}
                            onChange={(e) => handleInputChange('packaging', e.target.value)}
                            placeholder="e.g., 10 pieces per carton"
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        />
                        <p className="text-xs text-gray-500 mt-1">Optional - Packaging information</p>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500">$</span>
                            </div>
                            <input
                                type="text"
                                value={formData.price}
                                onChange={(e) => handleInputChange('price', e.target.value)}
                                placeholder="45.00"
                                className={`w-full border rounded-xl pl-8 pr-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                                    errors.price ? 'border-red-300' : 'border-gray-300'
                                }`}
                            />
                        </div>
                        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                    </div>

                    {/* Size */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Size *</label>
                        <input
                            type="text"
                            value={formData.size}
                            onChange={(e) => handleInputChange('size', e.target.value)}
                            placeholder="e.g., 150x200 cm"
                            className={`w-full border rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                                errors.size ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.size && <p className="text-red-500 text-xs mt-1">{errors.size}</p>}
                    </div>

                    {/* Fabric Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Fabric Name *</label>
                        <input
                            type="text"
                            value={formData.fabricName}
                            onChange={(e) => handleInputChange('fabricName', e.target.value)}
                            placeholder="e.g., Premium Cotton"
                            className={`w-full border rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                                errors.fabricName ? 'border-red-300' : 'border-gray-300'
                            }`}
                        />
                        {errors.fabricName && <p className="text-red-500 text-xs mt-1">{errors.fabricName}</p>}
                    </div>
                </div>

                {/* Product Composition */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Composition *</label>
                    <input
                        type="text"
                        value={formData.productComposition}
                        onChange={(e) => handleInputChange('productComposition', e.target.value)}
                        placeholder="e.g., 100% Cotton, 80% Wool 20% Polyester"
                        className={`w-full border rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                            errors.productComposition ? 'border-red-300' : 'border-gray-300'
                        }`}
                    />
                    {errors.productComposition && <p className="text-red-500 text-xs mt-1">{errors.productComposition}</p>}
                </div>

                {/* Washing Details */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Washing Details *</label>
                    <textarea
                        value={formData.washingDetails}
                        onChange={(e) => handleInputChange('washingDetails', e.target.value)}
                        placeholder="Enter washing instructions and care details..."
                        rows={3}
                        className={`w-full border rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 ${
                            errors.washingDetails ? 'border-red-300' : 'border-gray-300'
                        }`}
                    />
                    {errors.washingDetails && <p className="text-red-500 text-xs mt-1">{errors.washingDetails}</p>}
                </div>

                {/* Filling Material */}
                <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Filling Material Details</label>
                    <textarea
                        value={formData.fillingMaterial}
                        onChange={(e) => handleInputChange('fillingMaterial', e.target.value)}
                        placeholder="Enter filling material information (if applicable)..."
                        rows={2}
                        className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    />
                </div>
            </div>
        </div>
    );
});

export default ProductFormContainer;