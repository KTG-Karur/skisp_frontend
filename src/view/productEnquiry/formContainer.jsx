import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { showMessage, showConfirmationDialog } from '../../util/AllFunction';
import IconPlus from '../../components/Icon/IconPlus';
import IconTrashLines from '../../components/Icon/IconTrashLines';
import IconSave from '../../components/Icon/IconSave';
import Select from 'react-select';
import { baseURL } from '../../api/ApiConfig';
import { deleteVisitorCard } from '../../redux/productEnquirySlice';

const ProductEnquiryForm = ({ onSubmit, onReset, isEdit, selectedEnquiry, loading, expos, products }) => {
    const dispatch = useDispatch();

    // Get delete visitor card state from Redux
    const { deleteVisitorCardSuccess, deleteVisitorCardFailed, deleteVisitorCardLoading } = useSelector((state) => ({
        deleteVisitorCardSuccess: state.ProductEnquirySlice.deleteVisitorCardSuccess,
        deleteVisitorCardFailed: state.ProductEnquirySlice.deleteVisitorCardFailed,
        deleteVisitorCardLoading: state.ProductEnquirySlice.loading,
    }));

    const [formState, setFormState] = useState({
        expo_id: '',
        visitor_name: '',
        company_name: '',
        contact_number: '',
        visiting_card: '',
        city: '',
        country: '',
        email: '',
        nature_of_enquiry: '',
        remarks: '',
        products: [],
    });

    const [errors, setErrors] = useState([]);
    const [isExpanded, setIsExpanded] = useState(!isEdit);
    const [visitorImages, setVisitorImages] = useState([]);
    const [visitorImageFiles, setVisitorImageFiles] = useState([]);
    const [existingVisitorImages, setExistingVisitorImages] = useState([]); // Track existing images from backend

    // Country options
    const countryOptions = [
        { value: 'India', label: 'India' },
        { value: 'United States', label: 'United States' },
        { value: 'United Kingdom', label: 'United Kingdom' },
        { value: 'Germany', label: 'Germany' },
        { value: 'France', label: 'France' },
        { value: 'Italy', label: 'Italy' },
        { value: 'Spain', label: 'Spain' },
        { value: 'China', label: 'China' },
        { value: 'Japan', label: 'Japan' },
        { value: 'South Korea', label: 'South Korea' },
        { value: 'Australia', label: 'Australia' },
        { value: 'Canada', label: 'Canada' },
        { value: 'Brazil', label: 'Brazil' },
        { value: 'Mexico', label: 'Mexico' },
        { value: 'Russia', label: 'Russia' },
        { value: 'Turkey', label: 'Turkey' },
        { value: 'United Arab Emirates', label: 'United Arab Emirates' },
        { value: 'Saudi Arabia', label: 'Saudi Arabia' },
        { value: 'South Africa', label: 'South Africa' },
        { value: 'Bangladesh', label: 'Bangladesh' },
        { value: 'Sri Lanka', label: 'Sri Lanka' },
        { value: 'Pakistan', label: 'Pakistan' },
        { value: 'Vietnam', label: 'Vietnam' },
        { value: 'Thailand', label: 'Thailand' },
        { value: 'Indonesia', label: 'Indonesia' },
        { value: 'Malaysia', label: 'Malaysia' },
        { value: 'Singapore', label: 'Singapore' },
    ];

    // Expo options
    const expoOptions = expos
        .filter((expo) => expo.isActive === 1)
        .map((expo) => ({
            value: expo.id,
            label: expo.expoName,
        }));

    // Product options with enhanced data
    const productOptions = products
        .filter((product) => product.isActive)
        .map((product) => ({
            value: product.productId,
            label: `${product.productNo} - ${product.productName}`,
            productNo: product.productNo,
            productName: product.productName,
            productComposition: product.productComposition,
            size: product.size,
            fabricName: product.fabricName,
            washingDetails: product.washingDetails,
            fillingMaterial: product.fillingMaterial,
            price: product.price,
            image: product.productImage,
        }));

    // Reset form when isEdit changes to false
    useEffect(() => {
        if (!isEdit && !selectedEnquiry) {
            resetForm();
        }
    }, [isEdit, selectedEnquiry]);

    // Set form state when editing
    useEffect(() => {
        if (isEdit && selectedEnquiry) {
            setFormState({
                expo_id: selectedEnquiry.expoId || '',
                visitor_name: selectedEnquiry.visitorName || '',
                company_name: selectedEnquiry.companyName || '',
                contact_number: selectedEnquiry.contactNumber || '',
                visiting_card: selectedEnquiry.visitingCard || '',
                city: selectedEnquiry.city || '',
                country: selectedEnquiry.country || '',
                email: selectedEnquiry.email || '',
                nature_of_enquiry: selectedEnquiry.natureOfEnquiry || '',
                remarks: selectedEnquiry.remarks || '',
                products:
                    selectedEnquiry.products?.map((p) => ({
                        productId: p.productId,
                        sampleRequired: p.sampleRequired || false,
                        quantity: p.quantity || 0,
                        remarks: p.remarks || '',
                    })) || [],
            });

            // Handle multiple visiting card images
            if (selectedEnquiry.visitingCard) {
                try {
                    const parsedImages = JSON.parse(selectedEnquiry.visitingCard);
                    if (Array.isArray(parsedImages)) {
                        setExistingVisitorImages(parsedImages); // Store original image paths
                        setVisitorImages(parsedImages.map((img) => `${baseURL}${img}`));
                    } else {
                        setExistingVisitorImages([selectedEnquiry.visitingCard]);
                        setVisitorImages([`${baseURL}${selectedEnquiry.visitingCard}`]);
                    }
                } catch (error) {
                    // If it's not valid JSON, treat it as single image
                    setExistingVisitorImages([selectedEnquiry.visitingCard]);
                    setVisitorImages([`${baseURL}${selectedEnquiry.visitingCard}`]);
                }
            }
            setIsExpanded(true);
        }
    }, [isEdit, selectedEnquiry]);

    // Handle delete visitor card success/failure
    useEffect(() => {
        if (deleteVisitorCardSuccess) {
            showMessage('success', 'Visitor card image deleted successfully');
            // The parent component will refresh the data, so we don't need to update local state
        }
        if (deleteVisitorCardFailed) {
            showMessage('error', 'Failed to delete visitor card image');
        }
    }, [deleteVisitorCardSuccess, deleteVisitorCardFailed]);

    // Reset form function
    const resetForm = () => {
        setFormState({
            expo_id: '',
            visitor_name: '',
            company_name: '',
            contact_number: '',
            visiting_card: '',
            city: '',
            country: '',
            email: '',
            nature_of_enquiry: '',
            remarks: '',
            products: [],
        });
        setVisitorImages([]);
        setVisitorImageFiles([]);
        setExistingVisitorImages([]);
        setErrors([]);
    };

    const handleInputChange = (field, value) => {
        setFormState((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const addProduct = () => {
        setFormState((prev) => ({
            ...prev,
            products: [
                ...prev.products,
                {
                    productId: '',
                    sampleRequired: false,
                    quantity: 0,
                    remarks: '',
                },
            ],
        }));
    };

    const removeProduct = (index) => {
        setFormState((prev) => ({
            ...prev,
            products: prev.products.filter((_, i) => i !== index),
        }));
    };

    const updateProduct = (index, field, value) => {
        setFormState((prev) => ({
            ...prev,
            products: prev.products.map((product, i) => (i === index ? { ...product, [field]: value } : product)),
        }));
    };

    const handleVisitorImageUpload = (event) => {
        const files = Array.from(event.target.files);

        // Check total images limit (5)
        if (visitorImages.length + files.length > 5) {
            showMessage('error', 'Maximum 5 images allowed. Please remove some images before adding more.');
            return;
        }

        const validFiles = files.filter((file) => {
            if (!file.type.startsWith('image/')) {
                showMessage('error', 'Please select valid image files only');
                return false;
            }
            if (file.size > 5 * 1024 * 1024) {
                showMessage('error', 'Image size should be less than 5MB');
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) return;

        // Add new files to state
        setVisitorImageFiles((prev) => [...prev, ...validFiles]);

        // Create preview URLs for new images
        validFiles.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setVisitorImages((prev) => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeVisitorImage = async (index) => {
        const imageToRemove = visitorImages[index];

        // Check if this is an existing image (has baseURL) or a new upload
        const isExistingImage = imageToRemove.includes(baseURL);

        if (isExistingImage && isEdit && selectedEnquiry) {
            // Extract the image name from the full URL
            const imageName = imageToRemove.replace(`${baseURL}`, '');

            const confirmed = await showConfirmationDialog('Are you sure you want to delete this visiting card image?', 'Yes, Delete', 'This image will be permanently removed from the server.');

            if (confirmed) {
                try {
                    await dispatch(
                        deleteVisitorCard({
                            enquiryId: selectedEnquiry.enquiryId,
                            imageName,
                        })
                    ).unwrap();

                    // Remove from local state immediately for better UX
                    setVisitorImages((prev) => prev.filter((_, i) => i !== index));
                    setExistingVisitorImages((prev) => prev.filter((_, i) => i !== index));
                } catch (error) {
                    showMessage('error', `Failed to delete image: ${error.message}`);
                }
            }
        } else {
            // For new uploads, just remove from local state
            setVisitorImages((prev) => prev.filter((_, i) => i !== index));
            setVisitorImageFiles((prev) => prev.filter((_, i) => i !== index));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const requiredFields = {
            'Expo/Fair Name': formState.expo_id,
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => !value)
            .map(([field]) => field);

        if (missingFields.length > 0) {
            showMessage('error', `Please fill in required fields: ${missingFields.join(', ')}`);
            return;
        }

        // Validate all products have productId
        const productsWithoutSelection = formState.products.filter((p) => !p.productId);
        if (productsWithoutSelection.length > 0) {
            showMessage('error', 'Please select a product for all items');
            return;
        }

        // Prepare form data
        const submitData = {
            expo_id: formState.expo_id,
            ...(formState.visitor_name && { visitor_name: formState.visitor_name }),
            ...(formState.company_name && { company_name: formState.company_name }),
            ...(formState.contact_number && { contact_number: formState.contact_number }),
            ...(formState.visiting_card && { visiting_card: formState.visiting_card }),
            ...(formState.city && { city: formState.city }),
            ...(formState.country && { country: formState.country }),
            ...(formState.email && { email: formState.email }),
            ...(formState.nature_of_enquiry && { nature_of_enquiry: formState.nature_of_enquiry }),
            ...(formState.remarks && { remarks: formState.remarks }),
            products: formState.products,
        };

        onSubmit(submitData, visitorImageFiles);
    };

    const handleCancel = () => {
        resetForm();
        setIsExpanded(false);
        onReset();
    };

    const toggleForm = () => {
        setIsExpanded(!isExpanded);
        if (isExpanded && isEdit) {
            handleCancel();
        }
    };

    const getAvailableProducts = useMemo(() => {
        const selectedProductIds = formState.products.map((p) => p.productId).filter((id) => id);
        return productOptions.filter((product) => !selectedProductIds.includes(product.value));
    }, [formState.products, productOptions]);

    const getProductDetails = (productId) => {
        return productOptions.find((p) => p.value === productId);
    };

    // Custom styles for React Select
    const customStyles = {
        control: (provided) => ({
            ...provided,
            border: '1px solid #d1d5db',
            borderRadius: '12px',
            padding: '8px 4px',
            boxShadow: 'none',
            '&:hover': {
                borderColor: '#3b82f6',
            },
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#eff6ff' : 'white',
            color: state.isSelected ? 'white' : '#374151',
            padding: '12px 16px',
        }),
        menu: (provided) => ({
            ...provided,
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        }),
    };

    return (
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300">
            {/* Form Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4 cursor-pointer" onClick={toggleForm}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <IconPlus className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Enquiry' : 'Create New Enquiry'}</h2>
                    </div>
                    <div className="text-white">
                        <svg className={`w-5 h-5 transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            {isExpanded && (
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Required Field with Asterisk */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Expo/Fair Name <span className="text-red-500">*</span>
                            </label>
                            <Select
                                options={expoOptions}
                                value={expoOptions.find((option) => option.value === formState.expo_id)}
                                onChange={(selected) => handleInputChange('expo_id', selected?.value || '')}
                                placeholder="Select Expo/Fair"
                                styles={customStyles}
                                isClearable
                            />
                        </div>

                        {/* Optional Fields without Asterisk */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Visitor Name</label>
                            <input
                                type="text"
                                value={formState.visitor_name}
                                onChange={(e) => handleInputChange('visitor_name', e.target.value)}
                                placeholder="Enter visitor full name"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name</label>
                            <input
                                type="text"
                                value={formState.company_name}
                                onChange={(e) => handleInputChange('company_name', e.target.value)}
                                placeholder="Enter company name"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                            <input
                                type="text"
                                value={formState.contact_number}
                                onChange={(e) => handleInputChange('contact_number', e.target.value)}
                                placeholder="+91 1234567890"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                            <input
                                type="text"
                                value={formState.city}
                                onChange={(e) => handleInputChange('city', e.target.value)}
                                placeholder="Enter city"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Country</label>
                            <Select
                                options={countryOptions}
                                value={countryOptions.find((option) => option.value === formState.country)}
                                onChange={(selected) => handleInputChange('country', selected?.value || '')}
                                placeholder="Select Country"
                                styles={customStyles}
                                isClearable
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={formState.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                placeholder="visitor@company.com"
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>

                        {/* Multiple Visiting Card Images */}
                        <div className="md:col-span-3">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Visiting Card Images ({visitorImages.length}/5)</label>

                            <div className="space-y-4">
                                {/* Image Grid */}
                                {visitorImages.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                        {visitorImages.map((image, index) => {
                                            const isExistingImage = image.includes(baseURL);
                                            return (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={image}
                                                        crossOrigin="anonymous"
                                                        alt={`Visitor card ${index + 1}`}
                                                        className="w-full h-32 rounded-xl object-cover border-2 border-gray-300 shadow-sm"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeVisitorImage(index)}
                                                        disabled={deleteVisitorCardLoading}
                                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {deleteVisitorCardLoading ? (
                                                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                <path
                                                                    className="opacity-75"
                                                                    fill="currentColor"
                                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                                ></path>
                                                            </svg>
                                                        ) : (
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                        )}
                                                    </button>
                                                    {isExistingImage && <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">Existing</div>}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}

                                {/* Upload Area */}
                                {visitorImages.length < 5 && (
                                    <div className="space-y-2">
                                        <div className="flex flex-wrap gap-3">
                                            {/* Camera Capture Option */}
                                            <label className="block">
                                                <input type="file" accept="image/*" capture="environment" onChange={handleVisitorImageUpload} className="hidden" />
                                                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-3 rounded-xl flex items-center space-x-2 hover:shadow-lg transition-all duration-200 cursor-pointer min-w-[180px]">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                                        />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span>Take Photo</span>
                                                </div>
                                            </label>

                                            {/* Gallery Upload Option */}
                                            <label className="block">
                                                <input type="file" accept="image/*" multiple onChange={handleVisitorImageUpload} className="hidden" />
                                                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-3 rounded-xl flex items-center space-x-2 hover:shadow-lg transition-all duration-200 cursor-pointer min-w-[180px]">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                        />
                                                    </svg>
                                                    <span>From Gallery</span>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="text-center">
                                            <p className="text-xs text-gray-500">Upload up to {5 - visitorImages.length} more images (JPEG, PNG, max 5MB each)</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Nature of Enquiry */}
                        <div className="md:col-span-3">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Nature of Enquiry</label>
                            <textarea
                                value={formState.nature_of_enquiry}
                                onChange={(e) => handleInputChange('nature_of_enquiry', e.target.value)}
                                placeholder="Describe the enquiry in detail..."
                                rows={5}
                                className="w-full border border-gray-300 rounded-xl px-4 py-3 
            resize-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Products Section */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Products</h3>
                                <p className="text-sm text-gray-600">Add products that the visitor is interested in</p>
                            </div>
                            <button
                                type="button"
                                onClick={addProduct}
                                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-xl flex items-center space-x-2 hover:shadow-lg transition-all duration-200 transform hover:-translate-y-0.5"
                            >
                                <IconPlus className="w-4 h-4" />
                                <span>Add Product</span>
                            </button>
                        </div>

                        {formState.products.length === 0 ? (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                                <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                                    />
                                </svg>
                                <p className="mt-4 text-lg font-medium">No products added</p>
                                <p className="text-sm">Click "Add Product" to start adding products to this enquiry</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {formState.products.map((product, index) => {
                                    const productDetails = getProductDetails(product.productId);
                                    return (
                                        <div key={index} className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="font-bold text-gray-800 text-lg">Product {index + 1}</h4>
                                                {formState.products.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeProduct(index)}
                                                        className="text-red-600 hover:text-red-800 p-2 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                                                    >
                                                        <IconTrashLines className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                                <div className="lg:col-span-2">
                                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Select Product</label>
                                                    <Select
                                                        options={getAvailableProducts}
                                                        value={productOptions.find((option) => option.value === product.productId)}
                                                        onChange={(selected) => updateProduct(index, 'productId', selected?.value || '')}
                                                        placeholder="Choose a product"
                                                        styles={customStyles}
                                                        isClearable
                                                    />
                                                    {!product.productId && <p className="text-xs text-red-500 mt-1">Please select a product</p>}
                                                </div>

                                                <div className="lg:col-span-2 flex justify-center">
                                                    {productDetails && (
                                                        <div className="text-center">
                                                            <img
                                                                src={`${baseURL}${productDetails.image}`}
                                                                alt="Product"
                                                                className="w-32 h-32 rounded-xl object-cover border border-gray-300 shadow-sm mx-auto"
                                                                crossOrigin="anonymous"
                                                                onError={(e) => {
                                                                    e.target.src = '/assets/images/default-product.jpg';
                                                                }}
                                                            />
                                                            <p className="text-xs text-gray-600 mt-2 truncate">{productDetails.productName}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                {productDetails && (
                                                    <div className="lg:col-span-4">
                                                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                                                            <h5 className="font-semibold text-blue-800 mb-3">Product Details</h5>
                                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Composition:</span>
                                                                    <p className="text-gray-600">{productDetails.productComposition}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Size:</span>
                                                                    <p className="text-gray-600">{productDetails.size}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Fabric:</span>
                                                                    <p className="text-gray-600">{productDetails.fabricName}</p>
                                                                </div>
                                                                <div>
                                                                    <span className="font-medium text-gray-700">Price:</span>
                                                                    <p className="text-gray-600">${productDetails.price}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Product Options */}
                                                <div className="lg:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="flex items-center bg-gray-50 p-4 rounded-xl space-x-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={product.sampleRequired}
                                                            onChange={(e) => updateProduct(index, 'sampleRequired', e.target.checked)}
                                                            className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                                        />
                                                        <label className="text-sm font-semibold text-gray-700">Sample Required</label>
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                                                        <input
                                                            type="text"
                                                            value={product.quantity || ''}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '' || /^\d+$/.test(value)) {
                                                                    updateProduct(index, 'quantity', value === '' ? 0 : parseInt(value));
                                                                }
                                                            }}
                                                            placeholder="Enter quantity"
                                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className="block text-sm font-semibold text-gray-700 mb-2">Remarks</label>
                                                        <textarea
                                                            value={product.remarks}
                                                            onChange={(e) => updateProduct(index, 'remarks', e.target.value)}
                                                            placeholder="Product remarks..."
                                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Remarks */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Additional Remarks</label>
                        <textarea
                            value={formState.remarks}
                            onChange={(e) => handleInputChange('remarks', e.target.value)}
                            placeholder="Additional comments or notes..."
                            rows={2}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                        />
                    </div>

                    {/* Form Actions */}
                    <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-3 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || deleteVisitorCardLoading}
                            className="px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-xl transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                        >
                            <IconSave className="w-4 h-4" />
                            <span>{loading ? 'Saving...' : isEdit ? 'Update Enquiry' : 'Create Enquiry'}</span>
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ProductEnquiryForm;
