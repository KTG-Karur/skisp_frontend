import { Fragment } from 'react';

const FormLayout = ({
  dynamicForm,
  state,
  setState,
  errors,
  setErrors,
  handleSubmit,
  noOfColumns = 1,
  ref,
  children
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const renderFormFields = () => {
    return dynamicForm.map((section, sectionIndex) => (
      <div key={sectionIndex} className="mb-5">
        {section.sectionTitle && (
          <h5 className="font-semibold text-lg dark:text-white-light mb-5">
            {section.sectionTitle}
          </h5>
        )}
        <div className={`grid grid-cols-1 sm:grid-cols-${noOfColumns} gap-4`}>
          {section.formFields.map((field, fieldIndex) => (
            <div key={fieldIndex} className={field.classStyle || 'col-span-1'}>
              <label htmlFor={field.name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                {field.label} {field.require && <span className="text-red-500">*</span>}
              </label>
              {field.inputType === 'text' && (
                <input
                  type="text"
                  id={field.name}
                  name={field.name}
                  value={state[field.name] || ''}
                  onChange={handleChange}
                  placeholder={field.placeholder}
                  className={`form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                    errors[field.name] ? 'border-red-500' : ''
                  }`}
                  ref={ref}
                />
              )}
              {field.inputType === 'select' && (
                <select
                  id={field.name}
                  name={field.name}
                  value={state[field.name] || ''}
                  onChange={handleChange}
                  className={`form-select mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                    errors[field.name] ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">{field.placeholder || 'Select an option'}</option>
                  {field.options?.map((option, i) => (
                    <option key={i} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}
              {field.inputType === 'textarea' && (
                <textarea
                  id={field.name}
                  name={field.name}
                  value={state[field.name] || ''}
                  onChange={handleChange}
                  rows={field.rows || 3}
                  placeholder={field.placeholder}
                  className={`form-textarea mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                    errors[field.name] ? 'border-red-500' : ''
                  }`}
                />
              )}
              {field.inputType === 'checkbox' && (
                <div className="mt-2">
                  <label className="inline-flex items-center">
                    <input
                      type="checkbox"
                      id={field.name}
                      name={field.name}
                      checked={state[field.name] || false}
                      onChange={(e) => handleChange({
                        target: {
                          name: field.name,
                          value: e.target.checked
                        }
                      })}
                      className="form-checkbox rounded border-gray-300 text-primary shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 dark:border-gray-600 dark:bg-gray-700"
                    />
                    <span className="ml-2">{field.checkboxLabel || ''}</span>
                  </label>
                </div>
              )}
              {errors[field.name] && (
                <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    ));
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit();
    }}>
      {renderFormFields()}
      {children}
    </form>
  );
};

export default FormLayout;