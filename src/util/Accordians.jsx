import { useState } from 'react';
import AnimateHeight from 'react-animate-height';
import IconCaretDown from '../components/Icon/IconCaretDown';
import IconAirplay from '../components/Icon/IconAirplay';
import IconArrowBackward from '../components/Icon/IconArrowBackward';

const Accordians = (props) => {
    const { tabs, children, AccordianFun, cols, Title, toggleAcc, handleSubmit, btnName, isEdit, saveBtn } = props;
    const [active, setActive] = useState(0);
    const toggle = (value) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    return (
        <div>
            <div className="w-full">
                <div className="rounded p-4">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        {/* Title */}
                        <h4 className="text-lg font-semibold leading-none">{`${Title}`}</h4>

                        {/* Back Button */}
                        <button
                            type="button"
                            className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded shadow self-start md:self-auto"
                            onClick={() => {
                                toggleAcc();
                            }}
                        >
                            <IconArrowBackward />
                            Back
                        </button>
                    </div>
                </div>
            </div>
            <div className="pt-5 space-y-8">
                <div className={`grid lg:grid-cols-${cols} grid-cols-1 gap-6 `}>
                    {tabs.map((item, i) => (
                        <div className="">
                            <div className="">
                                <div className="space-y-2 font-semibold">
                                    <div className="border border-[#d3d3d3] rounded dark:border-[#1b2e4b]">
                                        <button
                                            type="button"
                                            className={`p-4 w-full flex items-center text-white-dark dark:bg-[#1b2e4b] ${active === i ? '!text-primary' : ''}`}
                                            onClick={() => {
                                                toggle(i), AccordianFun(item, i);
                                            }}
                                        >
                                            {/* < className="ltr:mr-2 rtl:ml-2 text-primary shrink-0" /> */}
                                            <span className="ltr:mr-2 rtl:ml-2 text-primary shrink-0">{item.icon}</span>
                                            {item?.label || ''}
                                            <div className={`ltr:ml-auto rtl:mr-auto ${active === i ? 'rotate-180' : ''}`}>
                                                <IconCaretDown />
                                            </div>
                                        </button>
                                        <div>
                                            <AnimateHeight duration={300} height={active === i ? 'auto' : 0}>
                                                <div className="space-y-2 p-4 text-white-dark text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">{children}</div>
                                            </AnimateHeight>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>
                    <div className="flex justify-center gap-2 mt-4">
                        {/* {cancelBtn && (
                            <button onClick={handleClose} type="button" className="btn btn-outline-danger">
                                Cancel
                            </button>
                        )} */}
                        <div>
                            {saveBtn && (
                                <button type="button" onClick={handleSubmit} className="btn btn-outline-success ltr:ml-4 rtl:mr-4">
                                    {`${isEdit ? 'Update' : btnName ? btnName : 'Save'}`}
                                </button>
                            )}
                        </div>
                    </div>
            </div>
        </div>
    );
};

export default Accordians;
