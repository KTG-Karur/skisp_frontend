// Form Container
const FormContainer = [
    {
        formFields: [
            {
                label: 'Client Name',
                name: 'clientName',
                inputType: 'text',
                placeholder: 'Enter client name',
                require: true,
                classStyle: 'col-span-12',
                validation: {
                    required: 'Client name is required',
                    minLength: {
                        value: 2,
                        message: 'Client name must be at least 2 characters'
                    },
                    maxLength: {
                        value: 100,
                        message: 'Client name must be less than 100 characters'
                    }
                }
            },
        ],
    },
];

export { FormContainer };