// Form Container
const FormContainer = [
    {
        formFields: [
            {
                label: 'Category Name',
                name: 'categoryName',
                inputType: 'text',
                placeholder: 'Enter category name',
                require: true,
                classStyle: 'col-span-12',
                validation: {
                    required: 'Category name is required',
                    minLength: {
                        value: 2,
                        message: 'Category name must be at least 2 characters'
                    },
                    maxLength: {
                        value: 100,
                        message: 'Category name must be less than 100 characters'
                    }
                }
            },
        ],
    },
];

export { FormContainer };