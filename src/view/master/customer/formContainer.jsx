// Form Container
const FormContainer = [
    {
        formFields: [
            {
                label: 'Expo Name',
                name: 'expoName',
                inputType: 'text',
                placeholder: 'Enter Expo Name',
                require: true,
                classStyle: 'col-span-6',
                validation: {
                    required: 'Expo Name is required',
                    minLength: {
                        value: 2,
                        message: 'Expo Name must be at least 2 characters'
                    },
                    maxLength: {
                        value: 100,
                        message: 'Expo Name must be less than 100 characters'
                    }
                }
            },
            {
                label: 'Country',
                name: 'country',
                inputType: 'text',
                placeholder: 'Enter Country',
                require: true,
                classStyle: 'col-span-6',
                validation: {
                    required: 'Country is required',
                    minLength: {
                        value: 2,
                        message: 'Country must be at least 2 characters'
                    },
                    maxLength: {
                        value: 100,
                        message: 'Country must be less than 100 characters'
                    }
                }
            },
            {
                label: 'Place',
                name: 'place',
                inputType: 'textarea',
                placeholder: 'Enter Place/Venue',
                rows: 1,
                require: true,
                classStyle: 'col-span-6',
                validation: {
                    required: 'Place is required',
                    minLength: {
                        value: 2,
                        message: 'Place must be at least 2 characters'
                    },
                    maxLength: {
                        value: 200,
                        message: 'Place must be less than 200 characters'
                    }
                }
            },
            {
                label: 'Staff Attending',
                name: 'staffIds',
                inputType: 'multiSelect',
                placeholder: 'Select Staff Members',
                require: true,
                classStyle: 'col-span-6',
                optionList: 'staffList', 
                uniqueKey: 'value',
                displayKey: 'label',
                validation: {
                    required: 'At least one staff member is required'
                }
            },
            {
                label: 'From Date',
                name: 'fromDate',
                inputType: 'date',
                placeholder: 'Select From Date',
                require: true,
                classStyle: 'col-span-3',
                validation: {
                    required: 'From Date is required'
                }
            },
            {
                label: 'To Date',
                name: 'toDate',
                inputType: 'date',
                placeholder: 'Select To Date',
                require: true,
                classStyle: 'col-span-3',
                validation: {
                    required: 'To Date is required'
                }
            },
            {
                label: 'Year',
                name: 'year',
                inputType: 'text',
                placeholder: 'Enter Year',
                require: true,
                classStyle: 'col-span-3',
                validation: {
                    required: 'Year is required',
                    pattern: {
                        value: /^(19|20)\d{2}$/,
                        message: 'Please enter a valid year'
                    }
                }
            },
            {
                label: 'Expo Completed',
                name: 'isCompleted',
                inputType: 'checkbox',
                placeholder: 'Mark if expo is completed',
                require: false,
                classStyle: 'col-span-3',
                options: [
                    {
                        label: 'Yes, this expo has been completed',
                        value: true
                    }
                ]
            }
        ],
    },
];

export { FormContainer };