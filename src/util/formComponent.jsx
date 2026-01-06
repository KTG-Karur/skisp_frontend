import React, { useEffect, useState } from 'react';
import Select from 'react-select';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { formatDate, findObj, dateConversion, findMultiSelectObj } from './AllFunction';
import _ from 'lodash';
import ImageUploading, { ImageListType } from 'react-images-uploading';
import InputMask from 'react-input-mask';

function FormComponent(props) {
    const {
        formField,
        setState,
        errors,
        onChangeCallBack,
        onClickCallBack,
        removeHanldeErrors,
        state,
        toggleModal = null,
        showSelectmodel = [],
        onDeleteCallBack,
        optionListState,
        IsEditArrVal = false,
    } = props;
    const [menuIsOpen, setMenuIsOpen] = useState(false);
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);


    const handleChange = async (e, formType, formName, uniqueKey = null, selectIsMulti = false) => {
        // Clear field error when user starts typing
        if (fieldErrors[formName]) {
            setFieldErrors((prev) => ({ ...prev, [formName]: '' }));
        }

        switch (formType) {
            case 'text':
            case 'number':
            case 'textarea':
            case 'password':
                setState((prev) => ({
                    ...prev,
                    [formName]: e?.target?.value,
                }));
                break;
            case 'date':
                const formate = await formatDate(e?.target?.value);
                setState((prev) => ({
                    ...prev,
                    [formName]: formate,
                }));
                break;
            case 'time':
                setState((prev) => ({
                    ...prev,
                    [formName]: e.target.value,
                }));
                break;
            case 'select':
                setState((prev) => ({
                    ...prev,
                    [formName]: e[uniqueKey],
                }));
                break;
            case 'radio':
                setState((prev) => ({
                    ...prev,
                    [formName]: e,
                }));
                break;
            case 'multiSelect':
                setState((prevState) => ({
                    ...prevState,
                    [formName]: e,
                }));
                break;
            case 'file':
                setState((prev) => ({
                    ...prev,
                    [formName]: e || null,
                }));
                break;
            case 'multifile':
                setState((prev) => ({
                    ...prev,
                    [formName]: [e.target.files],
                }));
                break;
            case 'checkbox':
                setState((prev) => ({
                    ...prev,
                    [formName]: e.target.checked,
                }));
                break;
            default:
                console.log('formName ', formName);
        }
    };

    const validateField = (form, value) => {
        if (!form.validation) return '';

        const { validation } = form;

        if (validation.required && (!value || value.toString().trim().length === 0)) {
            return validation.required;
        }

        if (validation.minLength && value && value.length < validation.minLength.value) {
            return validation.minLength.message;
        }

        if (validation.maxLength && value && value.length > validation.maxLength.value) {
            return validation.maxLength.message;
        }

        if (validation.pattern && value && !validation.pattern.value.test(value)) {
            return validation.pattern.message;
        }

        if (validation.validate && value) {
            let valueToValidate = value;
            if (form.mask && (form.name.includes('number') || form.name === 'pincode')) {
                valueToValidate = value.replace(/\D/g, '');
            }

            const validationResult = validation.validate(valueToValidate, state);
            if (validationResult !== true) {
                return validationResult;
            }
        }

        return '';
    };

    const handleBlur = (form) => {
        const value = state[form.name] || '';
        const error = validateField(form, value);
        if (error) {
            setFieldErrors((prev) => ({ ...prev, [form.name]: error }));
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const getMultiSelectValue = (form) => {
        const fieldValue = state[form.name];
        const options = optionListState?.[form.optionList] || [];
        const uniqueKey = form.uniqueKey || 'value';

        if (!fieldValue || !Array.isArray(fieldValue)) {
            return [];
        }

        if (fieldValue.length > 0 && typeof fieldValue[0] === 'object') {
            return fieldValue;
        }

        const selectedOptions = options.filter((option) => fieldValue.includes(option[uniqueKey]));

        return selectedOptions;
    };

    return (
        <div className="grid grid-cols-12 gap-4 mt-5">
            {formField?.formFields.map((form, index) => {
                const fieldError = fieldErrors[form.name] || (errors?.includes(form.name) ? `Please Enter ${form.label}` : '');

                switch (form?.inputType) {
                    case 'title':
                        return (
                            <p
                                key={index}
                                className={`whitespace-nowrap text-black ${form?.fontSize ? '' : 'text-base'} ${form?.classStyle || ''}`}
                                style={form?.fontSize ? { fontSize: form?.fontSize } : {}}
                            >
                                <span>
                                    {form?.title || ''}
                                    {form?.asteriskSymbol && <span className="font-bold text-red-500 ml-1">*</span>}
                                    {(showSelectmodel || []).includes(form?.name) && (
                                        <button
                                            type="button"
                                            className="inline-flex items-center px-1 py-0.5 ml-2 text-white bg-pink-700 rounded hover:bg-pink-800 focus:outline-none focus:ring-2 focus:ring-pink-500"
                                            onClick={() => toggleModal(form)}
                                        >
                                            {form?.btnName}
                                        </button>
                                    )}
                                </span>
                            </p>
                        );
                    case 'preview':
                        return (
                            state[form?.name] && (
                                <img
                                    key={index}
                                    alt={form?.preview}
                                    src={state[form?.name]}
                                    crossOrigin="anonymous"
                                    className={`h-full ${form?.width ? '' : 'w-[200px]'} ${form?.classStyle || ''}`}
                                    style={form?.width ? { width: form?.width } : {}}
                                />
                            )
                        );
                    case 'description':
                        return (
                            <>
                                {state[form?.name] && (
                                    <p key={index} className={`${form?.classStyle || ''}`}>
                                        {form?.label && <span className="text-[#1b2559] font-bold text-lg pb-2 block">{form?.label}</span>}
                                        <span>
                                            {state[form?.name].split(',').map((item) => {
                                                const [key, value] = item.split(':').map((str) => str.trim());
                                                return (
                                                    <div className="grid grid-cols-3 gap-4">
                                                        <div className="font-bold">{key}</div>
                                                        <div className="text-center">:</div>
                                                        <div>{value}</div>
                                                    </div>
                                                );
                                            })}
                                        </span>
                                    </p>
                                )}
                            </>
                        );

                    case 'descriptionWithoutKey':
                        return (
                            <p key={index} className={`${form?.classStyle || ''}`}>
                                {state[form?.name] &&
                                    state[form?.name]
                                        .slice(1, -1)
                                        .split('\n')
                                        .map((item, idx) =>
                                            idx === 0 ? (
                                                <div key={idx} className="mb-2 font-bold">
                                                    {item.trim()}
                                                </div>
                                            ) : (
                                                <div key={idx} className="mb-1">
                                                    {item.trim()}
                                                </div>
                                            )
                                        )}
                            </p>
                        );
                    case 'button':
                        return (
                            <div key={index} className={`${form?.classStyle || ''}`}>
                                <button
                                    type="button"
                                    onClick={() => onClickCallBack[form?.onClick]()}
                                    className={`px-4 py-2 font-medium rounded text-white 
                                            ${form?.variant === 'success' ? 'bg-green-500 hover:bg-green-600' : ''}
                                            ${form?.variant === 'danger' ? 'bg-red-500 hover:bg-red-600' : ''}
                                            ${form?.variant === 'primary' ? 'bg-blue-500 hover:bg-blue-600' : ''}
                                            ${form?.variant === 'warning' ? 'bg-yellow-500 hover:bg-yellow-600 text-black' : ''}
                                            ${form?.variant === 'info' ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
                                        `}
                                >
                                    {IsEditArrVal ? 'Update' : form?.label || ''}
                                </button>
                            </div>
                        );
                    case 'icons':
                        return (
                            <div key={index} className={`${form?.classStyle || ''}`}>
                                <div
                                    onClick={() => onClickCallBack[form?.onClick](formField, index)}
                                    className={`px-4 py-2 font-medium rounded cursor-pointer
                                            ${form?.variant === 'success' ? 'text-green-500 hover:text-green-600' : ''}
                                            ${form?.variant === 'danger' ? 'text-red-500 hover:text-red-600' : ''}
                                            ${form?.variant === 'primary' ? 'text-blue-500 hover:text-blue-600' : ''}
                                            ${form?.variant === 'warning' ? 'text-yellow-500 hover:text-yellow-600 text-black' : ''}
                                            ${form?.variant === 'info' ? 'text-cyan-500 hover:text-cyan-600' : ''}
                                        `}
                                >
                                    {IsEditArrVal ? 'Update' : form?.label || ''}
                                </div>
                            </div>
                        );

                    case 'textarea':
                        return (
                            <div key={index} className={`${form?.classStyle || ''} mb-1`}>
                                {form?.label && (
                                    <label className="block mb-1 font-medium text-gray-700">
                                        {form?.label}
                                        {form?.require && <span className="text-red-600 font-bold ml-1">*</span>}
                                    </label>
                                )}
                                <textarea
                                    name={form?.name}
                                    rows={form?.rows || 4}
                                    placeholder={form?.placeholder}
                                    required={form?.require}
                                    disabled={form?.isDisabled}
                                    value={state[form?.name] || ''}
                                    onFocus={form?.require ? () => removeHanldeErrors(form?.name) : null}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setState((prev) => ({
                                            ...prev,
                                            [form?.name]: value,
                                        }));

                                        if (fieldErrors[form?.name]) {
                                            setFieldErrors((prev) => ({ ...prev, [form?.name]: '' }));
                                        }
                                    }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                {errors?.includes(form?.name) && <p className="text-red-600 font-bold mt-1">{`* Please Enter ${form?.label}`}</p>}

                                {/* Add clear button for textarea */}
                                {state[form?.name] && form?.clearable && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setState((prev) => ({
                                                ...prev,
                                                [form?.name]: '',
                                            }));
                                        }}
                                        className="mt-1 text-xs text-red-500 hover:text-red-700"
                                    >
                                        Clear
                                    </button>
                                )}
                            </div>
                        );

                    case 'text':
                        return (
                            <div key={index} className={`${form?.classStyle || ''} mb-1`}>
                                {form?.label && (
                                    <label className="block font-medium text-gray-700">
                                        {form?.label}
                                        {form?.require && <span className="text-red-500 font-bold ml-1">*</span>}
                                    </label>
                                )}
                                {
                                    <input
                                        type="text"
                                        name={form?.name || ''}
                                        placeholder={form?.placeholder}
                                        required={form?.require}
                                        value={form.isDynamic ? state.centerList.find((item) => item.uniqueId === formField.uniqueId)?.[form.name] || '' : state[form.name] || ''}
                                        disabled={form?.isDisabled || false}
                                        onChange={(e) => {
                                            form.onChange ? onChangeCallBack[form.onChange](e, form?.name, formField) : handleChange(e, 'text', form?.name);
                                        }}
                                        onBlur={() => handleBlur(form)}
                                        className={`w-full border ${
                                            fieldError ? 'border-red-500' : 'border-gray-300'
                                        } rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${form?.Styles}`}
                                    />
                                }
                                {fieldError && <p className="text-red-600 font-bold text-sm mt-1">* {fieldError}</p>}

                                {/* Real-time validation feedback */}
                                {form.validation && !fieldError && state[form.name] && (
                                    <div className="mt-1">
                                        {(() => {
                                            const value = state[form.name] || '';
                                            let cleanedValue = value;

                                            // Clean value for number validation
                                            if (form.mask && (form.name.includes('number') || form.name === 'pincode')) {
                                                cleanedValue = value.replace(/\D/g, '');
                                            }

                                            if (form.name === 'whatsapp_number' || form.name === 'mobile') {
                                                if (cleanedValue.length > 0 && cleanedValue.length < 10) {
                                                    return <p className="text-yellow-600 text-xs">{10 - cleanedValue.length} digits remaining</p>;
                                                }
                                                if (cleanedValue.length === 10) {
                                                    return <p className="text-green-600 text-xs">✓ Valid number</p>;
                                                }
                                            }

                                            if (form.name === 'aadhar_number' && cleanedValue.length > 0) {
                                                if (cleanedValue.length < 12) {
                                                    return <p className="text-yellow-600 text-xs">{12 - cleanedValue.length} digits remaining</p>;
                                                }
                                                if (cleanedValue.length === 12) {
                                                    return <p className="text-green-600 text-xs">✓ Valid Aadhar</p>;
                                                }
                                            }

                                            if (form.name === 'pincode' && cleanedValue.length > 0) {
                                                if (cleanedValue.length < 6) {
                                                    return <p className="text-yellow-600 text-xs">{6 - cleanedValue.length} digits remaining</p>;
                                                }
                                                if (cleanedValue.length === 6) {
                                                    return <p className="text-green-600 text-xs">✓ Valid pincode</p>;
                                                }
                                            }

                                            return null;
                                        })()}
                                    </div>
                                )}
                            </div>
                        );

                    case 'password':
                        return (
                            <div key={index} className={`${form?.classStyle || ''} mb-1`}>
                                {form?.label && (
                                    <label className="block text-sm font-medium text-gray-700">
                                        {form?.label}
                                        {form?.require && <span className="text-red-500 font-bold ml-1">*</span>}
                                    </label>
                                )}
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name={form?.name || ''}
                                        placeholder={form?.placeholder}
                                        required={form?.require}
                                        value={state[form.name] || ''}
                                        disabled={form?.isDisabled || false}
                                        onChange={(e) => {
                                            form.onChange ? onChangeCallBack[form.onChange](e, form?.name, formField) : handleChange(e, 'password', form?.name);
                                        }}
                                        onBlur={() => handleBlur(form)}
                                        className={`w-full border ${
                                            fieldError ? 'border-red-500' : 'border-gray-300'
                                        } rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed pr-10 ${form?.Styles}`}
                                    />
                                    <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800">
                                        {showPassword ? (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                                />
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                                {fieldError && <p className="text-red-600 font-bold text-sm mt-1">* {fieldError}</p>}

                                {/* Password strength indicator */}
                                {form.name === 'password' && state[form.name] && (
                                    <div className="mt-2">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <div className={`h-1 flex-1 rounded ${state[form.name].length < 6 ? 'bg-red-500' : state[form.name].length < 8 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                            <div className={`h-1 flex-1 rounded ${state[form.name].length < 6 ? 'bg-gray-300' : state[form.name].length < 8 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                                            <div className={`h-1 flex-1 rounded ${state[form.name].length < 8 ? 'bg-gray-300' : 'bg-green-500'}`}></div>
                                        </div>
                                        <p className="text-xs text-gray-600">{state[form.name].length < 6 ? 'Weak' : state[form.name].length < 8 ? 'Medium' : 'Strong'} password</p>
                                    </div>
                                )}
                            </div>
                        );

                    case 'file':
                        return (
                            <div key={index} className={`${form?.classStyle || ''} mb-1`}>
                                {form?.label && (
                                    <label className="block mb-1 font-medium text-gray-700">
                                        {form?.label}
                                        {form?.require && <span className="text-red-600 font-bold ml-1">*</span>}
                                    </label>
                                )}

                                <ImageUploading
                                    value={state[form?.name] || []}
                                    onChange={(e) => {
                                        if (form.onChange && onChangeCallBack && onChangeCallBack[form.onChange]) {
                                            onChangeCallBack[form.onChange](e, form?.name, formField);
                                        } else {
                                            handleChange(e, 'file', form?.name);
                                        }
                                    }}
                                    maxNumber={form?.maxNumber || 3}
                                    multiple={form?.multiple || false}
                                >
                                    {({ imageList, onImageUpload, onImageRemoveAll, onImageUpdate, onImageRemove, isDragging, dragProps }) => (
                                        <div className="upload__image-wrapper">
                                            <button
                                                type="button"
                                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                onClick={onImageUpload}
                                                disabled={form?.isDisabled}
                                                {...dragProps}
                                            >
                                                {form?.buttonText || 'Choose File...'}
                                            </button>

                                            {/* {Array.isArray(imageList) && imageList.length > 0 ? (
                                                <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                                    {imageList.map((image, idx) => (
                                                        <div key={idx} className="relative border rounded overflow-hidden">
                                                            <img src={image?.dataURL || image} alt="preview" className="w-full h-32 object-cover" crossOrigin="anonymous" />
                                                            <div className="absolute top-1 right-1 flex space-x-1">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => onImageUpdate(idx)}
                                                                    className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded hover:bg-blue-600"
                                                                >
                                                                    Update
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        onImageRemove(idx);
                                                                        if (onDeleteCallBack && onDeleteCallBack[form.onDelete]) {
                                                                            onDeleteCallBack[form.onDelete](image);
                                                                        }
                                                                    }}
                                                                    className="bg-red-500 text-white text-xs px-1 py-0.5 rounded hover:bg-red-600"
                                                                >
                                                                    Del
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : typeof imageList === 'string' && imageList ? (
                                                <div className="mt-3">
                                                    <img src={imageList} alt="preview" className="w-full h-32 object-cover border rounded" crossOrigin="anonymous" />
                                                </div>
                                            ) : state[form?.name] && typeof state[form?.name] === 'string' ? (
                                                <div className="mt-3">
                                                    <img src={state[form?.name]} alt="preview" className="w-full h-32 object-cover border rounded" crossOrigin="anonymous" />
                                                </div>
                                            ) : (
                                                <div className="mt-3 text-center p-4 border-2 border-dashed border-gray-300 rounded">
                                                    <img src="/assets/images/file-preview.svg" className="max-w-md w-full m-auto opacity-50" alt="file preview placeholder" />
                                                    <p className="text-gray-500 text-sm mt-2">No file selected</p>
                                                </div>
                                            )} */}
                                        </div>
                                    )}
                                </ImageUploading>

                                {errors?.includes(form?.name) && <p className="text-red-600 font-bold mt-1">{`* Please Enter ${form?.label}`}</p>}
                            </div>
                        );
                    case 'multifile':
                        return (
                            <div key={index} className={`${form?.classStyle || ''} mb-1`}>
                                {form?.label && (
                                    <label className="block mb-1 font-medium text-gray-700">
                                        {form?.label}
                                        {form?.require && <span className="text-red-600 font-bold ml-1">*</span>}
                                    </label>
                                )}
                                <input
                                    type="file"
                                    name={form?.name}
                                    multiple
                                    required={form?.require}
                                    disabled={form?.isDisabled}
                                    onFocus={form?.require ? () => removeHanldeErrors(form?.name) : null}
                                    onChange={(e) => handleChange(e, 'multifile', form?.name)}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                {errors?.includes(form?.name) && <p className="text-red-600 font-bold mt-1">{`* Please Enter ${form?.label}`}</p>}
                            </div>
                        );

                    case 'descriptionItem':
                        if (!state[form?.name]) {
                            return null;
                        }

                        if (Array.isArray(state[form?.name])) {
                            return (
                                <div key={index} className={`${form?.classStyle || ''} mb-4`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className={`whitespace-nowrap text-black font-bold ${form?.fontSize ? '' : 'text-base'}`} style={form?.fontSize ? { fontSize: form?.fontSize } : {}}>
                                            {form?.title || form?.label}
                                            {form?.require && <span className="font-bold text-red-500 ml-1">*</span>}
                                        </p>
                                        {form?.btnName && (
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                                                onClick={() => toggleModal(form)}
                                            >
                                                {form?.btnName}
                                            </button>
                                        )}
                                    </div>

                                    <div className="space-y-4">
                                        {state[form?.name].map((group, groupIndex) => (
                                            <div key={groupIndex} className="border rounded-lg p-4 bg-gray-50">
                                                {form?.showGroupNumbers && <p className="font-medium text-gray-700 mb-3 pb-2 border-b">Group {groupIndex + 1}</p>}

                                                <div className="space-y-3">
                                                    {Object.entries(group).map(([key, value]) => (
                                                        <div key={key} className="flex">
                                                            <span className="w-2/5 font-medium text-sm text-gray-600">{key}</span>
                                                            <span className="w-3/5 text-sm text-gray-900 break-words pl-2">{value || <span className="text-gray-400">-</span>}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {errors?.includes(form?.name) && <p className="text-red-600 font-medium mt-2">* Please provide {form?.title || form?.label}</p>}
                                </div>
                            );
                        }

                        if (typeof state[form?.name] === 'object') {
                            return (
                                <div key={index} className={`${form?.classStyle || ''} mb-4`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <p className={`whitespace-nowrap text-black font-bold ${form?.fontSize ? '' : 'text-base'}`} style={form?.fontSize ? { fontSize: form?.fontSize } : {}}>
                                            {form?.title || form?.label}
                                            {form?.require && <span className="font-bold text-red-500 ml-1">*</span>}
                                        </p>
                                        {form?.btnName && (
                                            <button
                                                type="button"
                                                className="inline-flex items-center px-3 py-1 text-sm text-white bg-blue-600 rounded hover:bg-blue-700"
                                                onClick={() => toggleModal(form)}
                                            >
                                                {form?.btnName}
                                            </button>
                                        )}
                                    </div>

                                    <div className="border rounded-lg p-4 bg-gray-50">
                                        <div className="space-y-3">
                                            {Object.entries(state[form?.name]).map(([key, value]) => (
                                                <div key={key} className="flex">
                                                    <span className="w-2/5 font-medium text-sm text-gray-600">{key}</span>
                                                    <span className="w-3/5 text-sm text-gray-900 break-words pl-2">{value || <span className="text-gray-400">-</span>}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {errors?.includes(form?.name) && <p className="text-red-600 font-medium mt-2">* Please provide {form?.title || form?.label}</p>}
                                </div>
                            );
                        }

                        return (
                            <div key={index} className={`${form?.classStyle || ''} mb-3`}>
                                <div className="flex">
                                    <span className="w-2/5 font-medium text-sm text-gray-600">
                                        {form?.label}
                                        {form?.require && <span className="text-red-500 ml-1">*</span>}
                                    </span>
                                    <span className="w-3/5 text-sm text-gray-900 break-words pl-2">{state[form?.name] || <span className="text-gray-400">-</span>}</span>
                                </div>
                                {errors?.includes(form?.name) && <p className="text-red-600 font-medium mt-1">* Please enter {form?.label}</p>}
                            </div>
                        );
                    case 'number':
                        return (
                            <div key={index} className={`${form?.classStyle || ''} mb-1`}>
                                {form?.label && (
                                    <label className="block mb-1 font-medium text-gray-700">
                                        {form?.label}
                                        {form?.require && <span className="text-red-600 font-bold ml-1">*</span>}
                                    </label>
                                )}
                                <input
                                    type="number"
                                    name={form?.name}
                                    placeholder={form?.placeholder}
                                    required={form?.require}
                                    value={state[form?.name] || ''}
                                    disabled={form?.isDisabled}
                                    onWheel={(e) => e.target.blur()}
                                    onFocus={form?.require ? () => removeHanldeErrors(form?.name) : null}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (!form?.maxlength || value.length <= form?.maxlength) {
                                            form.onChange ? onChangeCallBack[form.onChange](e, form?.name) : handleChange(e, 'number', form?.name);
                                        }
                                    }}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                {errors?.includes(form?.name) && <p className="text-red-600 font-bold mt-1">{`* Please Enter ${form?.label}`}</p>}
                            </div>
                        );

                    case 'date':
                        return (
                            <div key={index} className={`${form?.classStyle || ''} mb-1`}>
                                {form?.label && (
                                    <label className="block mb-1 font-medium text-gray-700">
                                        {form?.label}
                                        {form?.require && <span className="text-red-600 font-bold ml-1">*</span>}
                                    </label>
                                )}
                                <input
                                    type={form?.type || 'date'}
                                    name={form?.name}
                                    placeholder={form?.placeholder}
                                    required={form?.require}
                                    value={
                                        form?.type === 'month'
                                            ? state[form?.name]
                                                ? dateConversion(state[form?.name], 'YYYY-MM')
                                                : ''
                                            : state[form?.name]
                                            ? dateConversion(state[form?.name], 'YYYY-MM-DD')
                                            : ''
                                    }
                                    disabled={form?.isDisabled}
                                    onFocus={form?.require ? () => removeHanldeErrors(form?.name) : null}
                                    onChange={(e) => {
                                        form.onChange ? onChangeCallBack[form.onChange](e, form?.name) : handleChange(e, 'date', form?.name);
                                    }}
                                    min={form.minmumDate ? state[form.minmumDate] || form.minmumDate : ''}
                                    max={form.maximumDate ? state[form.maximumDate] || form.maximumDate : ''}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                {errors?.includes(form?.name) && <p className="text-red-600 font-bold mt-1">{`* Please Enter ${form?.label}`}</p>}
                            </div>
                        );

                    case 'time':
                        return (
                            <div key={index} className={`${form?.classStyle || ''} mb-1`}>
                                {form?.label && (
                                    <label className="block mb-1 font-medium text-gray-700">
                                        {form?.label}
                                        {form?.require && <span className="text-red-600 font-bold ml-1">*</span>}
                                    </label>
                                )}
                                <input
                                    type="time"
                                    name={form?.name}
                                    placeholder={form?.placeholder}
                                    required={form?.require}
                                    value={state[form?.name] || ''}
                                    disabled={form?.isDisabled}
                                    onFocus={form?.require ? () => removeHanldeErrors(form?.name) : null}
                                    onChange={(e) => {
                                        form.onChange ? onChangeCallBack[form.onChange](e, form?.name) : handleChange(e, 'time', form?.name);
                                    }}
                                    min={form.minmumTime || ''}
                                    max={form.maximumTime || ''}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                {errors?.includes(form?.name) && <p className="text-red-600 font-bold mt-1">{`* Please Enter ${form?.label}`}</p>}
                            </div>
                        );

                    case 'multiSelect':
                        const multiSelectValue = getMultiSelectValue(form);

                        return (
                            <div className={`${form?.classStyle || ''} mb-2`} key={index}>
                                {form?.label && (
                                    <Form.Label>
                                        <span>
                                            <label className="block mb-1 font-medium text-gray-700">
                                                {form?.label}
                                                {form?.require && <span className="text-red-600 font-bold ml-1">*</span>}
                                            </label>
                                            {
                                                // Add Option Modal Btn
                                                (showSelectmodel || []).includes(form?.name) && (
                                                    <Button
                                                        variant="success"
                                                        className="waves-effect waves-light mx-1"
                                                        style={{ padding: '3px', lineHeight: '1.0' }}
                                                        onClick={() => {
                                                            toggleModal(form);
                                                        }}
                                                    >
                                                        <i className="mdi mdi-plus-circle "></i>
                                                    </Button>
                                                )
                                            }
                                        </span>
                                    </Form.Label>
                                )}
                                <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    isMulti={true}
                                    required={form?.require || false}
                                    disabled={form?.isDisabled || false}
                                    onChange={(option) => {
                                        handleChange(option, 'multiSelect', form?.name, form.uniqueKey, true);
                                    }}
                                    getOptionLabel={(option) => (form.displayKey ? option[form.displayKey] : option.label)}
                                    getOptionValue={(option) => (form.uniqueKey ? option[form.uniqueKey] : option.value)}
                                    value={multiSelectValue}
                                    className="react-select react-select-container"
                                    classNamePrefix="react-select"
                                    isSearchable
                                    onFocus={form?.require ? () => removeHanldeErrors(form?.name) : null}
                                    options={optionListState?.[form?.optionList] || []}
                                    menuIsOpen={menuIsOpen}
                                    onMenuOpen={() => setMenuIsOpen(true)}
                                    onBlur={() => setMenuIsOpen(false)}
                                    styles={{
                                        option: (provided, state) => ({
                                            ...provided,
                                            fontSize: '16px',
                                            color: '#000',
                                            backgroundColor: state.isSelected ? '#e6f7ff' : state.isFocused ? '#71b6f98a' : '#fff',
                                            cursor: 'pointer',
                                        }),
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            fontSize: '16px',
                                            color: '#000',
                                        }),
                                        singleValue: (provided) => ({
                                            ...provided,
                                            fontSize: '16px',
                                            color: '#000',
                                        }),
                                        multiValueLabel: (provided) => ({
                                            ...provided,
                                            fontSize: '16px',
                                            color: '#000',
                                        }),
                                        input: (provided) => ({
                                            ...provided,
                                            fontSize: '16px',
                                            color: '#000',
                                        }),
                                    }}
                                />
                                {errors?.includes(form?.name) && <p className="text-danger font-bold">{`* Please Enter ${form?.label}`}</p>}
                            </div>
                        );
                    case 'select':
                        return (
                            <div className={`${form?.classStyle || ''} mb-2`} key={index}>
                                {form?.label && (
                                    <Form.Label>
                                        <span>
                                            {form?.label} {form?.require ? <span className="font-bold text-red-500">*</span> : null}
                                            {
                                                // Add Option Modal Btn
                                                (showSelectmodel || []).includes(form?.name) && (
                                                    <Button
                                                        variant="success"
                                                        className="waves-effect waves-light mx-1"
                                                        style={{ padding: '3px', lineHeight: '1.0' }}
                                                        onClick={() => {
                                                            toggleModal(form);
                                                        }}
                                                    >
                                                        <i className="mdi mdi-plus-circle "></i>
                                                    </Button>
                                                )
                                            }
                                        </span>
                                    </Form.Label>
                                )}
                                <Select
                                    menuPortalTarget={document.body}
                                    menuPosition="fixed"
                                    isMulti={form?.isMultiple || false}
                                    required={form?.require || false}
                                    disabled={form?.isDisabled || false}
                                    onChange={(option) => {
                                        form.onChange
                                            ? onChangeCallBack[form.onChange](option, form?.name, form.uniqueKey, form.displayKey)
                                            : handleChange(option, 'select', form?.name, form.uniqueKey, form?.isMultiple || false);
                                    }}
                                    getOptionLabel={(option) => (form.displayKey ? option[form.displayKey] : option.label)}
                                    getOptionValue={(option) => (form.uniqueKey ? option[form.uniqueKey] : option)}
                                    value={findObj(optionListState[form?.optionList], form.uniqueKey, state[form.name])}
                                    className="react-select react-select-container"
                                    classNamePrefix="react-select"
                                    isSearchable
                                    color="#000"
                                    onFocus={form?.require ? () => removeHanldeErrors(form?.name) : null}
                                    options={optionListState?.[form?.optionList] || []}
                                    styles={{
                                        option: (provided, state) => ({
                                            ...provided,
                                            fontSize: '16px',
                                            color: '#000',
                                            backgroundColor: state.isSelected ? '#e6f7ff' : state.isFocused ? '#71b6f98a' : '#fff',
                                            cursor: 'pointer',
                                        }),
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 9999,
                                        }),
                                        menu: (provided) => ({
                                            ...provided,
                                            fontSize: '16px',
                                            color: '#000',
                                        }),
                                        singleValue: (provided) => ({
                                            ...provided,
                                            fontSize: '16px',
                                            color: '#000',
                                        }),
                                        multiValueLabel: (provided) => ({
                                            ...provided,
                                            fontSize: '16px',
                                            color: '#000',
                                        }),
                                        input: (provided) => ({
                                            ...provided,
                                            fontSize: '16px',
                                            color: '#000',
                                        }),
                                    }}
                                />
                                {errors?.includes(form?.name) && <p className="text-danger font-bold">{`* Please Enter ${form?.label}`}</p>}
                            </div>
                        );
                    case 'checkbox':
                        return (
                            <div className={`${form?.classStyle || ''} mb-1`} key={index}>
                                <p className="block mb-1 font-medium text-gray-700">
                                    {form?.label}
                                    {form?.require && <span className="font-bold text-red-500 ml-1">*</span>}
                                </p>

                                {(optionListState?.[form?.optionList] || []).length > 0 ? (
                                    <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${form?.colValue || 3}, minmax(0, 1fr))` }}>
                                        {optionListState[form?.optionList].map((item, i) => (
                                            <label key={i} className="inline-flex items-center space-x-2 text-sm text-gray-800">
                                                <input
                                                    type="checkbox"
                                                    name={form?.name}
                                                    id={`checkbox-${i}`}
                                                    checked={Array.isArray(state[form?.name]) ? state[form?.name]?.includes(item[form?.uniqueKey]) : state[form?.name] === item[form?.uniqueKey]}
                                                    onChange={(e) => {
                                                        form.onChange ? onChangeCallBack[form.onChange](item[form?.uniqueKey], form.name) : handleChange(item[form?.uniqueKey], 'checkbox', form?.name);
                                                    }}
                                                    className="form-checkbox text-blue-600 focus:ring-blue-500"
                                                />
                                                <span>{form.displayKey ? item[form.displayKey] || form?.label : ''}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <label className="inline-flex items-center space-x-2 text-sm text-gray-800">
                                        <input
                                            type="checkbox"
                                            name={form?.name}
                                            id="checkbox-single"
                                            checked={state[form?.name] || false}
                                            onChange={(e) => {
                                                form.onChange ? onChangeCallBack[form.onChange](e, form.name) : handleChange(e, 'checkbox', form?.name);
                                            }}
                                            className="form-checkbox text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>{form?.displayLabel || ''}</span>
                                    </label>
                                )}

                                {errors?.includes(form?.name) && <p className="text-red-600 font-semibold mt-1">{`* Please Enter ${form?.label}`}</p>}
                            </div>
                        );
                    case 'radio':
                        return (
                            <div className={`${form?.classStyle || 'flex'} mb-1`} key={index}>
                                {form?.label && (
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        {form?.label}
                                        {form?.require && <span className="font-bold text-red-500 ml-1">*</span>}
                                    </label>
                                )}

                                <div className="flex flex-wrap gap-4">
                                    {(optionListState?.[form?.optionList] || []).length > 0 ? (
                                        optionListState[form?.optionList].map((item, i) => (
                                            <label key={i} className="inline-flex items-center space-x-2 text-sm text-gray-700">
                                                <input
                                                    type="radio"
                                                    name={form?.name || ''}
                                                    value={item[form.uniqueKey]}
                                                    checked={item[form.uniqueKey] == state[form?.name]}
                                                    onChange={() => (form.onChange ? onChangeCallBack[form.onChange](item, form.name) : handleChange(item[form.uniqueKey], 'radio', form?.name))}
                                                    className="form-radio text-blue-600 focus:ring-blue-500"
                                                />
                                                <span>{item[form.displayKey] || ''}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <label className="inline-flex items-center space-x-2 text-sm text-gray-700">
                                            <input
                                                type="radio"
                                                name={form?.name || ''}
                                                checked={!!state[form?.name]}
                                                value={state[form?.name] || ''}
                                                onChange={(e) => (form.onChange ? onChangeCallBack[form.onChange](e, form.name) : handleChange(e, 'radio', form?.name))}
                                                className="form-radio text-blue-600 focus:ring-blue-500"
                                            />
                                            <span>{form.displayKey || ''}</span>
                                        </label>
                                    )}
                                </div>
                            </div>
                        );

                    // ... other cases remain similar but with added onBlur and validation feedback

                    default:
                        console.log('form?.inputType : ', form?.inputType);
                        return null;
                }
            })}
        </div>
    );
}

export default FormComponent;
