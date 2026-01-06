import { useState, Fragment, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconRestore from '../../../components/Icon/IconRestore';
import Table from '../../../util/Table';
import Tippy from '@tippyjs/react';
import ModelViewBox from '../../../util/ModelViewBox';
import FormLayout from '../../../util/formLayout';
import { findArrObj, showMessage } from '../../../util/AllFunction';
import _ from 'lodash';
import { FormContainer } from './formContainer';
import { getEmployee, resetEmployeeStatus } from '../../../redux/employeeSlice';
import { getExpo, createExpo, updateExpo, deleteExpo, resetExpoStatus } from '../../../redux/expoSlice';

let isEdit = false;

const Index = () => {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Expo');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());

    const dispatch = useDispatch();

    const { getExpoSuccess, getExpoFailed, createExpoSuccess, createExpoFailed, updateExpoSuccess, updateExpoFailed, deleteExpoSuccess, deleteExpoFailed, expoData, loading, error } = useSelector(
        (state) => state.ExpoSlice
    );

    const { getEmployeeSuccess, employeeData } = useSelector((state) => state.EmployeeSlice);

    const [modal, setModal] = useState(false);
    const [state, setState] = useState({
        expoName: '',
        country: '',
        fromDate: '',
        toDate: '',
        year: new Date().getFullYear().toString(),
        place: '',
        staffIds: [],
        isCompleted: false,
    });
    const [formContain, setFormContain] = useState(FormContainer);
    const [errors, setErrors] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [staffList, setStaffList] = useState([]);
    const [localExpoData, setLocalExpoData] = useState([]);

    useEffect(() => {
        if (expoData && expoData.length > 0) {
            setLocalExpoData(expoData);
        }
    }, [expoData]);

    useEffect(() => {
        if (getExpoFailed) {
            showMessage('error', error || 'Failed to load expo data');
            dispatch(resetExpoStatus());
        }
        if (createExpoSuccess) {
            showMessage('success', 'Expo created successfully');
            dispatch(getExpo({ showAll: true }));
            dispatch(resetExpoStatus());
            closeModel();
        }
        if (createExpoFailed) {
            showMessage('error', error || 'Failed to create expo');
            dispatch(resetExpoStatus());
        }
        if (updateExpoSuccess) {
            showMessage('success', 'Expo updated successfully');
            dispatch(getExpo({ showAll: true }));
            dispatch(resetExpoStatus());
            closeModel();
        }
        if (updateExpoFailed) {
            showMessage('error', error || 'Failed to update expo');
            dispatch(resetExpoStatus());
        }
        if (deleteExpoSuccess) {
            showMessage('success', 'Expo deleted successfully');
            dispatch(getExpo({ showAll: true }));
            dispatch(resetExpoStatus());
        }
        if (deleteExpoFailed) {
            showMessage('error', error || 'Failed to delete expo');
            dispatch(resetExpoStatus());
        }
    }, [getExpoSuccess, getExpoFailed, createExpoSuccess, createExpoFailed, updateExpoSuccess, updateExpoFailed, deleteExpoSuccess, deleteExpoFailed, error, dispatch, selectedItem]);

    useEffect(() => {
        dispatch(setPageTitle('Expo Management'));
        dispatch(getEmployee({}));
        dispatch(getExpo({ showAll: true }));
    }, [dispatch]);

    useEffect(() => {
        if (getEmployeeSuccess && employeeData) {
            const staffOptions = employeeData
                .filter((emp) => emp.isActive === 1)
                .map((emp) => ({
                    label: emp.employeeName,
                    value: emp.employeeId,
                }));
            setStaffList(staffOptions);
        }
    }, [getEmployeeSuccess, employeeData]);

    const columns = [
        {
            Header: 'S.No',
            accessor: 'id',
            Cell: (row) => <div>{row?.row?.index + 1}</div>,
            width: 80,
        },
        {
            Header: 'Expo Name',
            accessor: 'expoName',
            sort: true,
        },
        {
            Header: 'Country',
            accessor: 'country',
            sort: true,
        },
        {
            Header: 'Year',
            accessor: 'year',
            sort: true,
        },
        {
            Header: 'Place',
            accessor: 'place',
            sort: true,
        },
        {
            Header: 'From Date',
            accessor: 'fromDate',
            Cell: ({ value }) => (value ? new Date(value).toLocaleDateString() : '-'),
            sort: true,
        },
        {
            Header: 'To Date',
            accessor: 'toDate',
            Cell: ({ value }) => (value ? new Date(value).toLocaleDateString() : '-'),
            sort: true,
        },
        {
            Header: 'Staff Count',
            accessor: 'staffIds',
            Cell: ({ value }) => <span>{value?.length || 0}</span>,
        },
        {
            Header: 'Completed',
            accessor: 'isCompleted',
            Cell: ({ value, row }) => (
                <div className="flex items-center">
                    <button
                        onClick={() => toggleExpoCompletion(row.original.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
                            value ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg' : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white shadow-lg'
                        }`}
                    >
                        {value ? 'Yes' : 'No'}
                    </button>
                </div>
            ),
        },
        {
            Header: 'Status',
            accessor: 'isActive',
            Cell: ({ value }) => (
                <span
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300
            ${value === 1 ? 'bg-gradient-to-r from-green-400 to-green-600 text-white shadow-lg' : 'bg-gradient-to-r from-red-400 to-red-600 text-white shadow-lg'}`}
                >
                    {value === 1 ? 'Active' : 'Deleted'}
                </span>
            ),
            sort: true,
        },
        {
            Header: 'Actions',
            accessor: 'actions',
            Cell: ({ row }) => {
                const expo = row.original;
                const isActive = expo.isActive === 1;

                return (
                    <div className="flex items-center space-x-2">
                        {isActive ? (
                            <>
                                {_.includes(accessIds, '3') && (
                                    <Tippy content="Edit">
                                        <span className="text-success me-2 cursor-pointer" onClick={() => onEditForm(expo)}>
                                            <IconPencil />
                                        </span>
                                    </Tippy>
                                )}
                                {_.includes(accessIds, '4') && (
                                    <Tippy content="Delete">
                                        <span className="text-danger me-2 cursor-pointer" onClick={() => handleDeleteExpo(expo)}>
                                            <IconTrashLines />
                                        </span>
                                    </Tippy>
                                )}
                            </>
                        ) : (
                            <>
                                {_.includes(accessIds, '6') && (
                                    <Tippy content="Restore">
                                        <span className="text-warning me-2 cursor-pointer" onClick={() => handleRestoreExpo(expo)}>
                                            <IconRestore />
                                        </span>
                                    </Tippy>
                                )}
                            </>
                        )}
                    </div>
                );
            },
            width: 120,
        },
    ];

    const closeModel = () => {
        setModal(false);
        isEdit = false;
        onFormClear();
    };

    const onFormClear = () => {
        setSelectedItem(null);
        setErrors([]);
        setState({
            expoName: '',
            country: '',
            fromDate: '',
            toDate: '',
            year: new Date().getFullYear().toString(),
            place: '',
            staffIds: [],
            isCompleted: false,
        });
    };

    const createModel = () => {
        onFormClear();
        isEdit = false;
        setModal(true);
    };

    const onEditForm = (data) => {
        if (data.isActive !== 1) {
            showMessage('error', 'Cannot edit deleted expo. Please restore it first.');
            return;
        }

        const staffIdsArray = Array.isArray(data.staffIds) ? data.staffIds : [];

        const selectedStaffOptions = staffList.filter((staff) => staffIdsArray.includes(staff.value));

        const newState = {
            expoName: data.expoName || '',
            country: data.country || '',
            fromDate: data.fromDate || '',
            toDate: data.toDate || '',
            year: data.year || new Date().getFullYear().toString(),
            place: data.place || '',
            staffIds: selectedStaffOptions,
            isCompleted: Boolean(data.isCompleted),
        };

        setState(newState);

        isEdit = true;
        setSelectedItem(data);
        setModal(true);
    };

    const onFormSubmit = async (e) => {
        if (e) e.preventDefault();

        if (!state.expoName?.trim()) {
            showMessage('error', 'Please enter expo name');
            return;
        }
        if (!state.country?.trim()) {
            showMessage('error', 'Please enter country');
            return;
        }
        if (!state.fromDate) {
            showMessage('error', 'Please select from date');
            return;
        }
        if (!state.toDate) {
            showMessage('error', 'Please select to date');
            return;
        }
        if (!state.year) {
            showMessage('error', 'Please enter year');
            return;
        }
        if (!state.place?.trim()) {
            showMessage('error', 'Please enter place');
            return;
        }
        if (!state.staffIds?.length) {
            showMessage('error', 'Please select at least one staff member');
            return;
        }

        if (new Date(state.fromDate) > new Date(state.toDate)) {
            showMessage('error', 'To date cannot be before from date');
            return;
        }

        try {
            const staffIds = Array.isArray(state.staffIds) ? state.staffIds.map((staff) => (typeof staff === 'object' ? staff.value : staff)) : [];

            const expoDataToSave = {
                expo_name: state.expoName.trim(),
                country: state.country.trim(),
                place: state.place.trim(),
                from_date: state.fromDate,
                to_date: state.toDate,
                year: state.year,
                is_completed: state.isCompleted || false,
                staff: staffIds,
            };


            if (isEdit && selectedItem) {
                dispatch(
                    updateExpo({
                        request: expoDataToSave,
                        expoId: selectedItem.id,
                    })
                );
            } else {
                dispatch(createExpo(expoDataToSave));
            }
        } catch (error) {
            showMessage('error', 'Failed to save expo data');
        }
    };

    const handleInputChange = (e, name) => {
        let value;
        if (e.target.type === 'checkbox') {
            value = e.target.checked;
        } else {
            value = e.target.value;
        }

        setState((prev) => ({ ...prev, [name]: value }));

        if (errors.length > 0) {
            setErrors(errors.filter((error) => error.field !== name));
        }
    };

    const handleMultiSelectChange = (selectedOptions, name) => {

        setState((prev) => ({ ...prev, [name]: selectedOptions }));

        if (errors.length > 0) {
            setErrors(errors.filter((error) => error.field !== name));
        }
    };

    const handleDeleteExpo = (expo) => {
        if (expo.isActive !== 1) {
            showMessage('error', 'This expo is already deleted.');
            return;
        }

        setSelectedItem(expo);
        showMessage('warning', 'Are you sure you want to delete this expo?', () => {
            dispatch(deleteExpo(expo.id));
        });
    };

    const handleRestoreExpo = (expo) => {
        if (expo.isActive === 1) {
            showMessage('error', 'This expo is already active.');
            return;
        }

        setSelectedItem(expo);
        showMessage('warning', 'Are you sure you want to restore this expo?', () => {
            const restoreData = {
                is_active: 1,
            };

            dispatch(
                updateExpo({
                    request: restoreData,
                    expoId: expo.id,
                })
            );
        });
    };

    const toggleExpoCompletion = (id) => {
        const expo = localExpoData.find((item) => item.id === id && item.isActive === 1);
        if (!expo) {
            showMessage('error', 'Cannot update completion status of deleted expo.');
            return;
        }

        const updatedData = {
            expo_name: expo.expoName,
            country: expo.country,
            place: exo.place,
            from_date: expo.fromDate,
            to_date: expo.toDate,
            year: expo.year,
            is_completed: !expo.isCompleted,
            staff: expo.staffIds,
        };
        dispatch(
            updateExpo({
                request: updatedData,
                expoId: id,
            })
        );
    };

    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const dataArray = localExpoData || [];
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return dataArray.slice(startIndex, endIndex);
    };

    const getTotalCount = () => {
        return localExpoData.length;
    };

    const getRecordCounts = () => {
        const activeCount = localExpoData.filter((item) => item.isActive === 1).length;
        const deletedCount = localExpoData.filter((item) => item.isActive === 0).length;
        return { activeCount, deletedCount };
    };

    const { activeCount, deletedCount } = getRecordCounts();

    return (
        <div>
            <div className="datatables">
                <Table
                    columns={columns}
                    Title={'Expo Management - All Records'}
                    toggle={_.includes(accessIds, '2') ? createModel : false}
                    data={getPaginatedData()}
                    pageSize={pageSize}
                    pageIndex={currentPage}
                    totalCount={getTotalCount()}
                    totalPages={Math.ceil(getTotalCount() / pageSize)}
                    onPaginationChange={handlePaginationChange}
                    pagination={true}
                    isSearchable={true}
                    isSortable={true}
                    btnName="Add Expo"
                    loadings={loading}
                />
            </div>

            <ModelViewBox
                key={isEdit ? `edit-${selectedItem?.id}` : 'create'}
                modal={modal}
                modelHeader={isEdit ? 'Edit Expo' : 'Add Expo'}
                isEdit={isEdit}
                setModel={closeModel}
                handleSubmit={onFormSubmit}
                modelSize="lg"
                submitBtnText={isEdit ? 'Update' : 'Create'}
                loadings={loading}
            >
                <FormLayout
                    dynamicForm={formContain}
                    handleSubmit={onFormSubmit}
                    setState={setState}
                    state={state}
                    onChangeCallBack={{
                        handleInputChange: handleInputChange,
                        handleMultiSelectChange: handleMultiSelectChange,
                    }}
                    errors={errors}
                    setErrors={setErrors}
                    loadings={loading}
                    optionListState={{
                        staffList: staffList,
                    }}
                />
            </ModelViewBox>
        </div>
    );
};

export default Index;
