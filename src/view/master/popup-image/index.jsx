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
import { getPopupImage, createPopupImage, updatePopupImage, deletePopupImage, resetPopupImageStatus } from '../../../redux/popupImageSlice';

let isEdit = false;

const PopupImageIndex = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Popup Image');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());

    const dispatch = useDispatch();

    const popupImageState = useSelector((state) => state.PopupImageSlice || {});
    const { 
        popupImageData = [], 
        loading = false, 
        error = null, 
        getPopupImageSuccess = false, 
        createPopupImageSuccess = false, 
        updatePopupImageSuccess = false, 
        deletePopupImageSuccess = false 
    } = popupImageState;

    const [modal, setModal] = useState(false);
    const [previewModal, setPreviewModal] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [selectedItem, setSelectedItem] = useState({});
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isActive, setIsActive] = useState(true);

    useEffect(() => {
        dispatch(setPageTitle('Popup Image Management'));
        fetchPopupImages();
    }, []);

    useEffect(() => {
        if (createPopupImageSuccess) {
            showMessage('success', 'Popup image created successfully');
            closeModel();
            fetchPopupImages();
            dispatch(resetPopupImageStatus());
        }

        if (updatePopupImageSuccess) {
            showMessage('success', 'Popup image updated successfully');
            closeModel();
            fetchPopupImages();
            dispatch(resetPopupImageStatus());
        }

        if (deletePopupImageSuccess) {
            showMessage('success', 'Popup image deleted successfully');
            fetchPopupImages();
            dispatch(resetPopupImageStatus());
        }

        if (error) {
            showMessage('error', error);
            dispatch(resetPopupImageStatus());
        }
    }, [createPopupImageSuccess, updatePopupImageSuccess, deletePopupImageSuccess, error]);

    const fetchPopupImages = () => {
        dispatch(getPopupImage({}));
    };

    const columns = [
        {
            Header: 'S.No',
            accessor: 'id',
            Cell: (row) => <div>{row?.row?.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Popup Image',
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
                            crossOrigin="anonymous"
                            alt="Popup"
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
        {
            Header: 'Title',
            accessor: 'title',
            Cell: ({ value }) => (
                <div className="max-w-xs" title={value}>
                    {value || '-'}
                </div>
            ),
            width: 200,
        },
        {
            Header: 'Description',
            accessor: 'description',
            Cell: ({ value }) => (
                <div className="max-w-xs truncate" title={value}>
                    {value || '-'}
                </div>
            ),
            width: 250,
        },
        {
            Header: 'Status',
            accessor: 'isActive',
            Cell: ({ value, row }) => {
                const popup = row.original;
                return (
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            className="sr-only peer" 
                            checked={value} 
                            onChange={(e) => handleStatusToggle(popup.popupImageId, e.target.checked)} 
                        />
                        <div
                            className={`w-11 h-6 rounded-full peer ${value ? 'bg-primary' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary`}
                        ></div>
                        <span className="ms-3 text-sm font-medium text-gray-900">{value ? 'Active' : 'Inactive'}</span>
                    </label>
                );
            },
            width: 120,
        },
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
                            <span className="text-danger me-2 cursor-pointer" onClick={() => handleDeletePopupImage(row.original.popupImageId)}>
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
        setTitle('');
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
        setTitle(data.title || '');
        setDescription(data.description || '');
        setIsActive(data.isActive);
        setImagePreviewUrl(data.image);
        isEdit = true;
        setModal(true);
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();

        console.log('Form submitted:', { isEdit, imageFile, title, description, isActive });

        if (!isEdit && !imageFile) {
            showMessage('error', 'Please select an image');
            return;
        }

        try {
            const formData = new FormData();

            if (imageFile) {
                console.log('Adding image to formData:', imageFile.name, imageFile.type);
                formData.append('image', imageFile);
            }

            if (title) {
                formData.append('title', title);
            }

            if (description) {
                formData.append('description', description);
            }

            formData.append('isActive', isActive.toString());

            console.log('FormData contents before sending:');
            for (let [key, value] of formData.entries()) {
                if (value instanceof File) {
                    console.log(`${key}: File - ${value.name} (${value.type}, ${value.size} bytes)`);
                } else {
                    console.log(`${key}: ${value}`);
                }
            }

            if (isEdit) {
                console.log('Updating popup image:', selectedItem.popupImageId);
                dispatch(
                    updatePopupImage({
                        request: formData,
                        popupImageId: selectedItem.popupImageId,
                    }),
                );
            } else {
                console.log('Creating popup image');
                dispatch(createPopupImage(formData));
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', 'Failed to save data');
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(file.type)) {
                showMessage('error', 'Please select a valid image file (JPEG, PNG, GIF, WebP)');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                showMessage('error', 'File size should be less than 10MB');
                return;
            }

            setImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDeletePopupImage = (popupImageId) => {
        showMessage('warning', 'Are you sure you want to delete this popup image?', () => {
            dispatch(deletePopupImage(popupImageId));
        });
    };

    const handleStatusToggle = (popupImageId, newStatus) => {
        const updateData = {
            isActive: newStatus,
        };

        console.log('Status toggle:', { popupImageId, newStatus, updateData });

        dispatch(
            updatePopupImage({
                request: updateData, 
                popupImageId: popupImageId,
            }),
        ).then(() => {
            showMessage('success', `Popup image ${newStatus ? 'activated' : 'deactivated'} successfully`);
        });
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return popupImageData.slice(startIndex, endIndex);
    };

    return (
        <div>
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Popup Image List'}
                    // toggle={_.includes(accessIds, '2') ? createModel : false}
                    toggle={false}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={popupImageData.length}
                    totalPages={Math.ceil(popupImageData.length / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={true}
                    isSortable={true}
                    btnName="Add Popup Image"
                    loading={loading}
                />
            </div>

            {/* Create/Edit Popup Image Modal */}
            <ModelViewBox
                modal={modal}
                modelHeader={isEdit ? 'Edit Popup Image' : 'Add Popup Image'}
                isEdit={isEdit}
                setModel={closeModel}
                handleSubmit={onFormSubmit}
                modelSize="md"
                submitBtnText={isEdit ? 'Update' : 'Create'}
                loading={loading}
            >
                <form onSubmit={onFormSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Popup Image {!isEdit && <span className="text-red-500">*</span>}
                        </label>

                        <div className="space-y-2">
                            <div className="relative">
                                <input 
                                    type="file" 
                                    id="popup-image" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={handleFileChange} 
                                />
                                <label
                                    htmlFor="popup-image"
                                    className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                                >
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <IconUpload className="w-6 h-6 mb-2 text-gray-400" />
                                        <p className="text-xs text-gray-500">
                                            {imageFile || (isEdit && selectedItem.image) ? 'Change Image' : 'Click to upload'}
                                        </p>
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
                                            crossOrigin="anonymous"
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

                        <p className="mt-1 text-xs text-gray-500">
                            {isEdit ? 'Leave empty to keep current image' : 'Required for new popup image'}
                        </p>
                    </div>

                    {/* Title Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            placeholder="Enter popup title (optional)"
                            maxLength={255}
                        />
                        <p className="mt-1 text-xs text-gray-500">{title.length}/255 characters</p>
                    </div>

                    {/* Description Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                            rows="3"
                            placeholder="Enter popup description (optional)"
                            maxLength={500}
                        />
                        <p className="mt-1 text-xs text-gray-500">{description.length}/500 characters</p>
                    </div>

                    {/* Status Toggle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={isActive} 
                                    onChange={(e) => setIsActive(e.target.checked)} 
                                />
                                <div
                                    className={`w-11 h-6 rounded-full peer ${isActive ? 'bg-primary' : 'bg-gray-300'} peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary`}
                                ></div>
                                <span className="ms-3 text-sm font-medium text-gray-900">{isActive ? 'Active' : 'Inactive'}</span>
                            </label>
                        </div>
                        <p className="mt-1 text-xs text-gray-500">Active popups will be displayed on the website</p>
                    </div>
                </form>
            </ModelViewBox>

            {/* Image Preview Modal */}
            <ModelViewBox 
                modal={previewModal} 
                modelHeader="Popup Image Preview" 
                setModel={() => setPreviewModal(false)} 
                modelSize="lg" 
                saveBtn={false}
            >
                <div className="flex justify-center p-4">
                    <img
                        src={imagePreview}
                        crossOrigin="anonymous"
                        alt="Popup Preview"
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

export default PopupImageIndex;