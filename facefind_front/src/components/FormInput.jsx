import React from 'react';

const FormInput = ({ id, type = 'text', placeholder = '', value, onChange, name, className = '', ...rest }) => {
  return (
    <input
      id={id}
      name={name}
      type={type}
      className={["form-input", className].join(' ').trim()}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...rest}
    />
  );
};


export default FormInput;
