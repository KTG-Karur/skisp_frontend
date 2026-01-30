import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconEye from '../../../components/Icon/IconEye';
import IconUpload from '../../../components/Icon/IconUpload';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../../util/ModelViewBox';
import { findArrObj, showMessage } from '../../../util/AllFunction';
import _ from 'lodash';
import { getBanner, createBanner, updateBanner, deleteBanner, resetBannerStatus } from '../../../redux/bannerSlice';

let isEdit = false;

const Index = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Banner');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());

    const dispatch = useDispatch();

    const bannerState = useSelector((state) => state.BannerSlice || {});
    const { bannerData = [], loading = false, error = null, getBannerSuccess = false, createBannerSuccess = false, updateBannerSuccess = false, deleteBannerSuccess = false } = bannerState;

    const [modal, setModal] = useState(false);
    const [previewModal, setPreviewModal] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [selectedItem, setSelectedItem] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        dispatch(setPageTitle('Banner Management'));
        fetchBanners();
    }, []);

    useEffect(() => {
        if (createBannerSuccess) {
            showMessage('success', 'Banner created successfully');
            closeModel();
            fetchBanners();
            dispatch(resetBannerStatus());
        }

        if (updateBannerSuccess) {
            showMessage('success', 'Banner updated successfully');
            closeModel();
            fetchBanners();
            dispatch(resetBannerStatus());
        }

        if (deleteBannerSuccess) {
            showMessage('success', 'Banner deleted successfully');
            fetchBanners();
            dispatch(resetBannerStatus());
        }

        if (error) {
            showMessage('error', error);
            dispatch(resetBannerStatus());
        }
    }, [createBannerSuccess, updateBannerSuccess, deleteBannerSuccess, error]);

    const fetchBanners = () => {
        dispatch(getBanner({}));
    };

    const columns = [
        {
            Header: 'S.No',
            accessor: 'id',
            Cell: (row) => <div>{row?.row?.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Banner Image',
            accessor: 'image',
            Cell: ({ value, row }) => (
                <div className="flex items-center">
                    <div
                        className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer border border-gray-200 hover:border-primary"
                        onClick={() => {
                            setImagePreview(value);
                            setPreviewModal(true);
                        }}
                    >
                        <img
                            src={value}
                            crossOrigin="ananymous"
                            alt="Banner"
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                            onError={(e) => {
                                e.target.src = '/assets/images/no-image.png';
                                e.target.className = 'w-full h-full object-contain p-2';
                            }}
                        />
                    </div>
                    <Tippy content="Click to view full image">
                        <span
                            className="text-primary ms-2 cursor-pointer"
                            onClick={() => {
                                setImagePreview(value);
                                setPreviewModal(true);
                            }}
                        >
                            <IconEye />
                        </span>
                    </Tippy>
                </div>
            ),
            width: 120,
        },
        // {
        //     Header: 'Description',
        //     accessor: 'description',
        //     Cell: ({ value }) => (
        //         <div className="max-w-xs truncate" title={value}>
        //             {value || '-'}
        //         </div>
        //     ),
        //     width: 200,
        // },
        {
            Header: 'Status',
            accessor: 'isActive',
            Cell: ({ value, row }) => {
                const banner = row.original;
                return (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={value} onChange={(e) => handleStatusToggle(banner.bannerId, e.target.checked)} />
                        <div
                            className={`w-11 h-6 rounded-full peer ${value ? 'bg-primary' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary`}
                        ></div>
                        <span className="ms-3 text-sm font-medium text-gray-900">{value ? 'Active' : 'Inactive'}</span>
                    </label>
                );
            },
            width: 120,
        },
        // {
        //     Header: 'Created Date',
        //     accessor: 'createdAt',
        //     Cell: ({ value }) => {
        //         if (!value) return '-';
        //         const date = new Date(value);
        //         return date.toLocaleDateString();
        //     },
        //     width: 120,
        // },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => (
                <div className="flex items-center space-x-2">
                    {_.includes(accessIds, '3') && (
                        <Tippy content="Edit">
                            <span className="text-success me-2 cursor-pointer" onClick={() => onEditForm(row.original)}>
                                <IconPencil />
                            </span>
                        </Tippy>
                    )}
                    {/* {_.includes(accessIds, '4') && (
                        <Tippy content="Delete">
                            <span className="text-danger me-2 cursor-pointer" onClick={() => handleDeleteBanner(row.original.bannerId)}>
                                <IconTrashLines />
                            </span>
                        </Tippy>
                    )} */}
                </div>
            ),
            width: 120,
        },
    ];

    const closeModel = () => {
        setModal(false);
        isEdit = false;
        onFormClear();
    };

    const onFormClear = () => {
        setSelectedItem({});
        setImageFile(null);
        setImagePreviewUrl('');
        setDescription('');
        setIsActive(true);
    };

    const createModel = () => {
        onFormClear();
        isEdit = false;
        setModal(true);
    };

    const onEditForm = (data) => {
        setSelectedItem(data);
        setDescription(data.description || '');
        setIsActive(data.isActive);
        setImagePreviewUrl(data.image);
        isEdit = true;
        setModal(true);
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();

        console.log('Form submitted:', { isEdit, imageFile, description, isActive });

        // For create, image is required
        if (!isEdit && !imageFile) {
            showMessage('error', 'Please select an image');
            return;
        }

        try {
            const formData = new FormData();

            // Add image file if exists (required for create, optional for update)
            if (imageFile) {
                console.log('Adding image to formData:', imageFile.name, imageFile.type);
                formData.append('files', imageFile);
            }

            // Add description
            formData.append('description', description || '');

            // Add isActive status
            formData.append('isActive', isActive.toString());

            // Log FormData contents
            console.log('FormData contents before sending:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            if (isEdit) {
                console.log('Updating banner:', selectedItem.bannerId);
                dispatch(
                    updateBanner({
                        request: formData,
                        bannerId: selectedItem.bannerId,
                    }),
                );
            } else {
                console.log('Creating banner');
                dispatch(createBanner(formData));
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', 'Failed to save data');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showMessage('error', 'Please select a valid image file (JPEG, PNG, GIF, WebP)');
                return;
            }

            // Validate file size (10MB max)
            if (file.size > 10 * 1024 * 1024) {
                showMessage('error', 'File size should be less than 10MB');
                return;
            }

            setImageFile(file);

            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeleteBanner = (bannerId) => {
        showMessage('warning', 'Are you sure you want to delete this banner?', () => {
            dispatch(deleteBanner(bannerId));
        });
    };

    const handleStatusToggle = (bannerId, newStatus) => {
        // For simple status updates without files, we can use JSON
        const updateData = {
            isActive: newStatus,
            description: '', // Empty description
        };

        console.log('Status toggle:', { bannerId, newStatus, updateData });

        dispatch(
            updateBanner({
                request: updateData, // Plain object, not FormData
                bannerId: bannerId,
            }),
        ).then(() => {
            showMessage('success', `Banner ${newStatus ? 'activated' : 'deactivated'} successfully`);
        });
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };
    console.log('bannerData');
    console.log(bannerData);

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return bannerData.slice(startIndex, endIndex);
    };

    return (
        <div>
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Banner List'}
                    toggle={_.includes(accessIds, '2') ? createModel : false}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={bannerData.length}
                    totalPages={Math.ceil(bannerData.length / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={true}
                    isSortable={true}
                    btnName="Add Banner"
                    loading={loading}
                />
            </div>

            {/* Create/Edit Banner Modal */}
            <ModelViewBox
                modal={modal}
                modelHeader={isEdit ? 'Edit Banner' : 'Add Banner'}
                isEdit={isEdit}
                setModel={closeModel}
                handleSubmit={onFormSubmit}
                modelSize="md"
                submitBtnText={isEdit ? 'Update' : 'Create'}
                loading={loading}
            >
                <form onSubmit={onFormSubmit} className="space-y-4">
                    {/* Image Upload Section */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image {!isEdit && <span className="text-red-500">*</span>}</label>

                        <div className="space-y-2">
                            {/* File Input */}
                            <div className="relative">
                                <input type="file" id="banner-image" className="hidden" accept="image/*" onChange={handleFileChange} />
                                <label
                                    htmlFor="banner-image"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <IconUpload className="w-6 h-6 mb-2 text-gray-400" />
                                        <p className="text-xs text-gray-500">{imageFile || (isEdit && selectedItem.image) ? 'Change Image' : 'Click to upload'}</p>
                                        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP (max 10MB)</p>
                                    </div>
                                </label>
                            </div>

                            {/* Image Preview */}
                            {(imagePreviewUrl || (isEdit && selectedItem.image)) && (
                                <div className="mt-2">
                                    <p className="text-xs font-medium text-gray-700 mb-1">Preview:</p>
                                    <div className="w-32 h-32 border rounded-lg overflow-hidden mx-auto">
                                        <img
                                            src={imagePreviewUrl || selectedItem.image}
                                            crossOrigin="ananymous"
                                            alt="Preview"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = '/assets/images/no-image.png';
                                                e.target.className = 'w-full h-full object-contain p-2';
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Help text */}
                        <p className="mt-1 text-xs text-gray-500">{isEdit ? 'Leave empty to keep current image' : 'Required for new banner'}</p>
                    </div>

                    {/* Description Field */}
                    {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            rows="3"
                            placeholder="Enter banner description (optional)"
                            maxLength={500}
                        />
                        <p className="mt-1 text-xs text-gray-500">{description.length}/500 characters</p>
                    </div> */}

                    {/* Status Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                                <div
                                    className={`w-11 h-6 rounded-full peer ${isActive ? 'bg-primary' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary`}
                                ></div>
                                <span className="ms-3 text-sm font-medium text-gray-900">{isActive ? 'Active' : 'Inactive'}</span>
                            </label>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Active banners will be displayed on the website</p>
                    </div>
                </form>
            </ModelViewBox>

            {/* Image Preview Modal */}
            <ModelViewBox modal={previewModal} modelHeader="Banner Preview" setModel={() => setPreviewModal(false)} modelSize="lg" saveBtn={false}>
                <div className="flex justify-center p-4">
                    <img
                        src={imagePreview}
                        crossOrigin="ananymous"
                        alt="Banner Preview"
                        className="max-w-full max-h-[60vh] object-contain rounded-lg"
                        onError={(e) => {
                            e.target.src = '/assets/images/no-image.png';
                            e.target.className = 'max-w-full max-h-[60vh] object-contain p-8 rounded-lg';
                        }}
                    />
                </div>
            </ModelViewBox>
        </div>
    );
};

export default Index;
