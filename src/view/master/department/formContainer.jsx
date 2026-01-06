// Form Container
const FormContainer = [
    {
        formFields: [
            {
                label: 'Department Name',
                name: 'departmentName',
                inputType: 'text',
                placeholder: 'Enter department name',
                require: true,
                classStyle: 'col-span-12',
                validation: {
                    required: 'Department name is required',
                    minLength: {
                        value: 2,
                        message: 'Department name must be at least 2 characters'
                    },
                    maxLength: {
                        value: 100,
                        message: 'Department name must be less than 100 characters'
                    }
                }
            },
        ],
    },
];

export { FormContainer };