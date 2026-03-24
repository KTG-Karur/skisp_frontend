const PopupImageFormContainer = [
    {
        formFields: [
            {
                label: 'Popup Image',
                name: 'image',
                inputType: 'file',
                require: true,
                classStyle: 'col-span-12',
                accept: 'image/*',
                validation: {
                    required: 'Popup image is required',
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
                label: 'Title',
                name: 'title',
                inputType: 'text',
                require: false,
                classStyle: 'col-span-12',
                placeholder: 'Enter popup title (optional)',
                validation: {
                    maxLength: {
                        value: 255,
                        message: 'Title cannot exceed 255 characters'
                    }
                }
            },
            {
                label: 'Description',
                name: 'description',
                inputType: 'textarea',
                require: false,
                classStyle: 'col-span-12',
                placeholder: 'Enter popup description (optional)',
                rows: 3,
                validation: {
                    maxLength: {
                        value: 500,
                        message: 'Description cannot exceed 500 characters'
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

export { PopupImageFormContainer };