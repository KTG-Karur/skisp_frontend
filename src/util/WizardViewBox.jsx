import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Row, Col, Card, Form, Button, Tab, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Wizard, Steps, Step } from 'react-albus';
import FormLayout from './formLayout';
import Table from './Table';
import { deleteData, showConfirmationDialog, updateData } from './AllFunction';
import IconCode from '../components/Icon/IconCode';
import IconHome from '../components/Icon/IconHome';
import IconUser from '../components/Icon/IconUser';
import IconThumbUp from '../components/Icon/IconThumbUp';
import IconArrowBackward from '../components/Icon/IconArrowBackward';
import IconArrowForward from '../components/Icon/IconArrowForward';
import Header from './Header';
import { v4 as uuidv4 } from 'uuid';

let submitWizardCall = false;
let reinsertIndex = 0;
let checkIsNotlastPrevious = '';

const WizardWithProgressbar = (props) => {
    let {
        //state
        arrVal,
        setArrVal,
        tabIndex,
        setTabIndex,
        isEdit,
        setTab,
        tab,
        state,
        setState,
        multiStateValue,
        setMultiStateValue,
        errors,
        setErrors,
        IsEditArrVal,
        setIsEditArrVal,
        perVal = 0,
        setPerVal,
        uploadImages,
        //const value
        Title,
        showSelectmodel,
        showMultiAdd,
        optionListState,
        columnsWizard,
        checkIsLoan = false,
        //function
        toggleModal,
        toggle,
        handleSubmit,
        onDeleteCallBack,
        onChangeCallBack,
        showLocalImg,
        tabList,
        temporarilyHidden,
        deletedItems,
        onTemporaryDelete,
        onRestoreItem,
        getDisplayData,
    } = props;

    const errorHandle = useRef();
    const [checkValidationforAddorNext, setCheckValidationforAddorNext] = useState(false);

    useEffect(() => {
        if (submitWizardCall) {
            handleSubmit();
            reinsertIndex = 0;
            submitWizardCall = false;
        }
    }, [multiStateValue]);

    useEffect(() => {
        if (isEdit) {
            const currentTabName = tabList?.[tabIndex]?.name;
            setState(multiStateValue[0]?.[currentTabName] || {});

            if (Array.isArray(multiStateValue[0]?.[currentTabName])) {
                setArrVal((prev) => ({
                    ...prev,
                    [currentTabName]: multiStateValue[0][currentTabName] || [],
                }));
                setState({});
            }
        }
    }, [tabIndex]);

    // Validation
    const checkValidation = (next, condition) => {
        setCheckValidationforAddorNext(condition);
        const currentTabName = tabList[tabIndex].name;
        const currentArray = arrVal[currentTabName] || [];

        if (showMultiAdd.includes(currentTabName) && currentArray.length !== 0 && next != null) {
            return handleNext(next);
        }
        setTimeout(() => {
            if (errorHandle.current && errorHandle.current.validateFormFields) {
                errorHandle.current.validateFormFields();
            }
        }, 0);
    };

    // Add
    const handleAdd = async () => {
        const currentTabName = tabList[tabIndex].name;

        if (IsEditArrVal) {
            const data = { ...state };
            if (perVal != 0) {
                if (data?.chargesAmount) {
                    data.chargesAmount = perVal;
                    setPerVal(0);
                }
            }

            // Update the specific tab's array
            setArrVal((prev) => ({
                ...prev,
                [currentTabName]: (prev[currentTabName] || []).map((item, index) => (index === state.selectedIdx ? data : item)),
            }));

            setIsEditArrVal(false);
            setState({});
        } else {
            const data = {
                id: (arrVal[currentTabName] || []).length,
                temp_id: `temp_${uuidv4()}`,
                ...state,
            };

            if (perVal != 0) {
                if (data?.chargesAmount) {
                    data.chargesAmount = perVal;
                    setPerVal(0);
                }
            }

            // Add to the specific tab's array
            setArrVal((prev) => ({
                ...prev,
                [currentTabName]: [...(prev[currentTabName] || []), data],
            }));
            setState({});
        }
    };

    // Next
    const handleNext = async (next) => {
        const currentTabName = tabList[tabIndex].name;
        const checkMultiAdd = showMultiAdd.includes(currentTabName);
        const currentArray = arrVal[currentTabName] || [];

        if (checkMultiAdd && currentArray.length === 0) {
            return;
        }

        let updatedStateValue;
        updatedStateValue = checkMultiAdd ? currentArray : state;

        const temp_state = [...multiStateValue];
        temp_state[reinsertIndex] = {
            ...temp_state[reinsertIndex],
            [currentTabName]: updatedStateValue,
        };
        setMultiStateValue(temp_state);

        if (tabIndex === tabList.length - 1) {
            submitWizardCall = true;
        } else {
            const nextTabName = tabList[tabIndex + 1].name;
            setTab(nextTabName);
            setTabIndex((prev) => prev + 1);
            setState(multiStateValue[reinsertIndex]?.[nextTabName] || {});

            if (showMultiAdd.includes(nextTabName)) {
                setArrVal((prev) => ({
                    ...prev,
                    [nextTabName]: multiStateValue[reinsertIndex]?.[nextTabName] || [],
                }));
                setState({});
            }
            if (next) next();
        }
    };

    // Previous
    const handlePrevious = (previous) => {
        const currentTabName = tabList[tabIndex].name;
        const previousTabName = tabList[tabIndex - 1]?.name;

        // Save current tab data before moving
        const checkMultiAdd = showMultiAdd.includes(currentTabName);
        const currentArray = arrVal[currentTabName] || [];
        let updatedStateValue = checkMultiAdd ? currentArray : state;

        const temp_state = [...multiStateValue];
        temp_state[reinsertIndex] = {
            ...temp_state[reinsertIndex],
            [currentTabName]: updatedStateValue,
        };
        setMultiStateValue(temp_state);

        setTab(previousTabName || '');
        setTabIndex((prev) => prev - 1);
        setState(multiStateValue[reinsertIndex]?.[previousTabName] || {});

        if (showMultiAdd.includes(previousTabName)) {
            setArrVal((prev) => ({
                ...prev,
                [previousTabName]: multiStateValue[reinsertIndex]?.[previousTabName] || [],
            }));
            setState({});
        }

        if (previous) previous();
    };

    // handleReinsert
    const handleReinsert = async (val) => {
        const currentTabName = tabList[tabIndex].name;
        const checkMultiAdd = showMultiAdd.includes(currentTabName);
        const currentArray = arrVal[currentTabName] || [];

        checkIsNotlastPrevious = val != 'isPrevious';

        if (checkMultiAdd && currentArray.length === 0) {
            return;
        }

        let updatedStateValue = checkMultiAdd ? currentArray : state;
        const temp_state = [...multiStateValue];
        temp_state[reinsertIndex] = {
            ...temp_state[reinsertIndex],
            [currentTabName]: updatedStateValue,
        };

        if (checkIsNotlastPrevious) {
            reinsertIndex = 1 + parseInt(reinsertIndex);
            temp_state[reinsertIndex] = {};
        }

        setMultiStateValue(temp_state);

        if (checkIsNotlastPrevious) {
            if (tabIndex === tabList.length - 1) {
                setTab('personalInfo');
                setTabIndex(0);
                setArrVal({});
            }
        }
    };

    const callBack = () => {
        setMultiStateValue([{}]);
        setState({});
        setArrVal({});
        if (toggle) toggle();
    };

    // Get data for table display - use parent's getDisplayData or fallback
    const getTableData = () => {
        const currentTabName = tabList[tabIndex].name;

        if (getDisplayData) {
            return getDisplayData(currentTabName);
        }

        // Fallback: just return the array data
        return arrVal[currentTabName] || [];
    };

    return (
        <Card>
            <Card.Body>
                <Header Title={Title} isEdit={isEdit} callBack={callBack} />

                <Wizard
                    render={() => (
                        <Steps>
                            <Tab.Container
                                id="left-tabs-example"
                                defaultActiveKey={tabList?.[0]?.defaultActiveKey || ''}
                                activeKey={tab ? tab : tabList?.[0]?.defaultActiveKey || ''}
                                onSelect={(k) => setTab(k)}
                            >
                                <div className="flex flex-wrap items-center justify-between relative my-10 gap-y-6">
                                    {tabList.map((item, i) => (
                                        <div key={i} className="flex-1 min-w-[80px] relative flex flex-col items-center text-center group">
                                            {/* Connector line */}
                                            {<div className={`absolute top-5 left-0 w-full h-1 ${i <= tabIndex ? 'bg-blue-500' : 'bg-gray-300'}`} style={{ zIndex: 0 }} />}

                                            <div
                                                className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full 
                                                ${i < tabIndex ? 'bg-blue-500 text-white' : i === tabIndex ? 'bg-white border-2 border-blue-500 text-blue-500' : 'bg-gray-300 text-gray-500'}`}
                                            >
                                                {item.icon ? item.icon : i + 1}
                                            </div>

                                            <span
                                                className={`mt-2 text-sm font-medium 
                                                ${i < tabIndex ? 'text-blue-500' : i === tabIndex ? 'text-blue-500' : 'text-gray-500'}`}
                                            >
                                                {item.label}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <Tab.Content className="pb-0 mb-0 pt-0">
                                    <Tab.Pane eventKey={tabList[tabIndex].name}>
                                        <Step
                                            id={tabList[tabIndex]?.name || ''}
                                            render={({ next, previous }) => {
                                                return (
                                                    <Form>
                                                        <FormLayout
                                                            optionListState={optionListState}
                                                            dynamicForm={tabList[tabIndex]?.children || ''}
                                                            handleSubmit={checkValidationforAddorNext ? () => handleAdd() : () => handleNext(next)}
                                                            isEdit={isEdit}
                                                            setState={setState}
                                                            showLocalImg={showLocalImg}
                                                            state={state}
                                                            ref={errorHandle}
                                                            onChangeCallBack={onChangeCallBack}
                                                            onDeleteCallBack={onDeleteCallBack}
                                                            noOfColumns={1}
                                                            errors={errors}
                                                            setErrors={setErrors}
                                                            toggleModal={toggleModal}
                                                            showSelectmodel={showSelectmodel}
                                                        />

                                                        {showMultiAdd.includes(tabList[tabIndex].name) && (
                                                            <div className="flex justify-end mt-4">
                                                                <button
                                                                    onClick={() => {
                                                                        checkValidation(null, true);
                                                                    }}
                                                                    type="button"
                                                                    className="bg-green-500 hover:bg-green-600 text-white font-medium px-4 py-2 rounded"
                                                                >
                                                                    {IsEditArrVal ? 'Update' : 'Add'}
                                                                </button>
                                                            </div>
                                                        )}

                                                        {showMultiAdd.includes(tabList[tabIndex].name) && (
                                                            <Table
                                                                columns={columnsWizard?.[tabList[tabIndex].name] || []}
                                                                Title={`${tabList[tabIndex].label} List`}
                                                                data={getTableData()}
                                                                pageSize={5}
                                                                sizePerPageList={5}
                                                                isSortable={true}
                                                                pagination={true}
                                                                isSearchable={true}
                                                            />
                                                        )}

                                                        <div className="flex justify-between mt-4">
                                                            {tabIndex !== 0 && (
                                                                <button
                                                                    onClick={async () => {
                                                                        if (!isEdit) {
                                                                            await handleReinsert('isPrevious');
                                                                        }
                                                                        await handlePrevious(previous);
                                                                    }}
                                                                    type="button"
                                                                    className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium px-4 py-2 rounded"
                                                                >
                                                                    Previous
                                                                </button>
                                                            )}

                                                            {tabIndex === tabList.length - 1 && checkIsLoan ? (
                                                                <button
                                                                    onClick={() => {
                                                                        handleSubmit();
                                                                    }}
                                                                    type="button"
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded ml-auto"
                                                                >
                                                                    {isEdit ? 'Update' : 'Submit'}
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    onClick={() => {
                                                                        checkValidation(next, false);
                                                                    }}
                                                                    type="button"
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded ml-auto"
                                                                >
                                                                    {tabIndex !== tabList.length - 1 ? 'Next' : isEdit ? 'Update' : 'Submit'}
                                                                </button>
                                                            )}
                                                        </div>
                                                    </Form>
                                                );
                                            }}
                                        />
                                    </Tab.Pane>
                                </Tab.Content>
                            </Tab.Container>
                        </Steps>
                    )}
                />
            </Card.Body>
        </Card>
    );
};

export { WizardWithProgressbar };
