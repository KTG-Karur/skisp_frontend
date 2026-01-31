// Form Container
const FormContainer = [
    {
        formFields: [
            {
                label: 'Banner Image',
                name: 'image',
                inputType: 'file',
                require: true,
                classStyle: 'col-span-12',
                accept: 'image/*',
                validation: {
                    required: 'Banner image is required',
                    validate: {
                        fileSize: (files) => {
                            if (files && files[0]) {
                                const file = files[0];
                                const fileSize = file.size / 1024 / 1024; // in MB
                                return fileSize <= 10 || 'File size must be less than 10MB';
                            }
                            return true;
                        },
                        fileType: (files) => {
                            if (files && files[0]) {
                                const file = files[0];
                                const acceptedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                                return acceptedTypes.includes(file.type) || 'Only image files are allowed (JPEG, PNG, GIF, WebP)';
                            }
                            return true;
                        }
                    }
                }
            },
            {
                label: 'Status',
                name: 'isActive',
                inputType: 'radio',
                require: false,
                classStyle: 'col-span-12',
                options: [
                    { label: 'Active', value: true },
                    { label: 'Inactive', value: false }
                ],
                defaultValue: true
            }
        ],
    },
];

export { FormContainer };