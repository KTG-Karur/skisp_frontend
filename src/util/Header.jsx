import React from 'react';
import IconArrowBackward from '../components/Icon/IconArrowBackward';

function Header(props) {
    const { Title, isEdit, callBack, isTitleOnly } = props;
    return (
        <div className="w-full">
            <div className="rounded p-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <h4 className="text-lg font-semibold leading-none">{`${isEdit ? 'Update' : isTitleOnly ? '' : 'Add'} ${Title}`}</h4>
                    <button
                        type="button"
                        className="flex items-center gap-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded shadow self-start md:self-auto"
                        onClick={() => {
                            // setMultiStateValue([{}]);
                            // setState({});
                            // closeModel();
                            callBack();
                        }}
                    >
                        <IconArrowBackward />
                        Back
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Header;
