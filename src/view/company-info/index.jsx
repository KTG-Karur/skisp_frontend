import React, { useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, Spinner } from 'react-bootstrap';
import FormLayout from '../../util/formLayout';
import { useDispatch, useSelector } from 'react-redux';
import { employeeFormContainer } from './formFieldData';
import { findArrObj, showMessage } from '../../util/AllFunction';
import { getCompany, resetCompanyStatus, updateCompany } from '../../redux/companySlice';
import moment from 'moment';
import { baseURL } from '../../api/ApiConfig';
import { createUplode, resetUplodeStatus } from '../../redux/uplodeSlice';

let isEdit = false;

function Index() {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const pageAccessData = findArrObj(localData?.pagePermission, 'label', 'Company Info');
    const accessIds = (pageAccessData[0]?.access || '').split(',').map((id) => id.trim());
    const roleIdforRole = localData?.roleName;
    const dispatch = useDispatch();

    const { getCompanySuccess, companyData, getCompanyFailed, updateCompanySuccess, updateCompanyFailed, errorMessage } = useSelector((state) => ({
        getCompanySuccess: state.ComapnySlice.getCompanySuccess,
        companyData: state.ComapnySlice.companyData,
        getCompanyFailed: state.ComapnySlice.getCompanyFailed,

        updateCompanySuccess: state.ComapnySlice.updateCompanySuccess,
        updateCompanyFailed: state.ComapnySlice.updateCompanyFailed,

        errorMessage: state.ComapnySlice.errorMessage,
    }));

    const { error, uplodes, loading, createUplodeSuccess, createUplodeFailed } = useSelector((state) => ({
        error: state.UplodeSlice.error,
        uplodes: state.UplodeSlice.uplodes,
        loading: state.UplodeSlice.loading,
        createUplodeSuccess: state.UplodeSlice.createUplodeSuccess,
        createUplodeFailed: state.UplodeSlice.createUplodeFailed,
    }));

    const [state, setState] = useState({
        companyId: '',
        companyName: '',
        companyMobile: '',
        companyAltMobile: '',
        companyMail: '',
        companyAddressOne: '',
        companyGstNo: '',
        companyAddressTwo: '',
        companyLogo: '',
        logoPreview: '',
        userId: '',
        userName: '',
        password: '',
        updatedAt: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    
    const [filteredFormConfig, setFilteredFormConfig] = useState([]);

    const errorHandle = useRef();

    useEffect(() => {
        setIsLoading(true);
        dispatch(getCompany());
    }, []);

    useEffect(() => {
        if (roleIdforRole) {
            const filteredConfig = employeeFormContainer
                .map(section => {
                    if (roleIdforRole === 'Super Admin') {
                        return section;
                    }
                    
                    const filteredFields = section.formFields.filter(field => {
                        if (field.isAuthenticationSection || field.isAuthenticationField) {
                            return false;
                        }
                        if (field.isUpdateButton) {
                            return false;
                        }
                        return true;
                    });
                    
                    return filteredFields.length > 0 ? { ...section, formFields: filteredFields } : null;
                })
                .filter(section => section !== null);
            
            setFilteredFormConfig(filteredConfig);
        }
    }, [roleIdforRole]);

    useEffect(() => {
        if (getCompanySuccess) {
            dispatch(resetCompanyStatus());
            setIsLoading(false);
            const companyDataItem = companyData?.data[0];

            setState({
                companyId: companyDataItem?.companyId || '',
                companyName: companyDataItem?.companyName || '',
                companyMobile: companyDataItem?.companyMobile || '',
                companyAltMobile: companyDataItem?.companyAltMobile || '',
                companyMail: companyDataItem?.companyMail || '',
                companyAddressOne: companyDataItem?.companyAddressOne || '',
                companyGstNo: companyDataItem?.companyGstNo || '',
                companyAddressTwo: companyDataItem?.companyAddressTwo || '',
                companyLogo: companyDataItem?.companyLogo ? [companyDataItem?.companyLogo] : [],
                logoPreview: companyDataItem?.companyLogo ? `${baseURL}${companyDataItem?.companyLogo}` : '',
                userId: companyDataItem?.userId || '',
                userName: companyDataItem?.userName || '',
                password: companyDataItem?.password || '',
                updatedAt: companyDataItem?.updatedAt || null,
            });
            dispatch(resetCompanyStatus());
        } else if (getCompanyFailed) {
            setIsLoading(false);
            dispatch(resetCompanyStatus());
        }
    }, [getCompanySuccess, getCompanyFailed]);

    useEffect(() => {
        if (updateCompanySuccess) {
            if (state.companyLogo && state.companyLogo instanceof File) {
                const formData = new FormData();
                const originalFile = state.companyLogo;

                const renamedFile = new File([originalFile], `Ashok-Finance-logo-${Date.now()}-${originalFile.name || 'logo'}`, {
                    type: originalFile.type,
                });
                formData.append('company', renamedFile);
                dispatch(createUplode({ request: formData, id: state?.companyId }));
            } else {
                showMessage('success', 'Company data updated successfully');
                dispatch(getCompany());
                dispatch(resetCompanyStatus());
            }
            dispatch(resetCompanyStatus());
        } else if (updateCompanyFailed) {
            showMessage('warning', errorMessage);
            dispatch(resetCompanyStatus());
        }
    }, [updateCompanySuccess, updateCompanyFailed]);

    useEffect(() => {
        if (createUplodeSuccess) {
            showMessage('success', 'Company logo uploaded successfully');
            dispatch(resetUplodeStatus());
            dispatch(getCompany());
            dispatch(resetCompanyStatus());
        } else if (createUplodeFailed) {
            showMessage('warning', 'Logo upload failed, but company data was updated');
            dispatch(getCompany());
            dispatch(resetUplodeStatus());
            dispatch(resetCompanyStatus());
        }
    }, [createUplodeSuccess, createUplodeFailed]);

    const onFormClear = () => {
        setErrors([]);
        setState({
            companyId: '',
            companyName: '',
            companyMobile: '',
            companyAltMobile: '',
            companyMail: '',
            companyAddressOne: '',
            companyGstNo: '',
            companyAddressTwo: '',
            companyLogo: '',
            logoPreview: '',
            userId: '',
            userName: '',
            password: '',
            updatedAt: null,
        });
    };

    const handleValidation = () => {
        errorHandle.current.validateFormFields();
    };

    const onFormSubmit = async () => {
        const submitRequest = {
            companyName: state?.companyName || '',
            companyMobile: state?.companyMobile || '',
            companyAltMobile: state?.companyAltMobile || '',
            companyMail: state?.companyMail || '',
            companyAddressOne: state?.companyAddressOne || '',
            companyAddressTwo: state?.companyAddressTwo || '',
            companyGstNo: state?.companyGstNo || '',
            userId: state?.userId || '',
            userName: state?.userName || '',
            password: state?.password || '',
        };

        dispatch(
            updateCompany({
                request: submitRequest,
                companyInfoId: state?.companyId,
            })
        );
    };

    const formImage = async (e, formName, formField) => {
        if (Array.isArray(e) && e.length > 0) {
            const file = e[0].file;
            const imageURL = e[0].dataURL;

            setState((prevState) => {
                const newState = {
                    ...prevState,
                    companyLogo: file,
                    logoPreview: imageURL,
                };
                return newState;
            });
        } else if (e === null || e === undefined || (Array.isArray(e) && e.length === 0)) {
            setState((prevState) => ({
                ...prevState,
                companyLogo: '',
                logoPreview: '',
            }));
        } else {
            console.log(' Unknown format received:', e);
        }
    };

    return (
        <React.Fragment>
            {isLoading ? (
                <div className="bg-light opacity-0.25">
                    <div className="d-flex justify-content-center m-5">
                        <Spinner className="mt-5 mb-5" animation="border" />
                    </div>
                </div>
            ) : (
                <Card>
                    <Card.Body>
                        <FormLayout
                            dynamicForm={filteredFormConfig}
                            handleSubmit={onFormSubmit}
                            setState={setState}
                            state={state}
                            ref={errorHandle}
                            onClickCallBack={{
                                formUpdate: handleValidation,
                                onFormClear: onFormClear,
                            }}
                            onChangeCallBack={{ formImage: formImage }}
                            noOfColumns={1}
                            errors={errors}
                            setErrors={setErrors}
                        />

                        <div>{`Last Update on ${moment(state?.updatedAt || null).format('DD-MM-YYYY')}`}</div>
                    </Card.Body>
                </Card>
            )}
        </React.Fragment>
    );
}

export default Index;