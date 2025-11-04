import React from 'react';

export const Select = ({ children, className = '', value, onValueChange, ...props }) => {
  // Extract SelectValue placeholder and SelectItems from children
  const items = [];
  let placeholder = '';
  
  // Recursively extract SelectItems from nested children (including fragments)
  const extractItems = (children) => {
    React.Children.forEach(children, (child) => {
      if (!child) return;
      
      if (child.type === SelectItem) {
        items.push(child);
      } else if (child.props?.children) {
        // Recursively search nested children (handles fragments and other wrappers)
        extractItems(child.props.children);
      }
    });
  };
  
  React.Children.forEach(children, (child) => {
    if (child?.type === SelectTrigger) {
      React.Children.forEach(child.props.children, (triggerChild) => {
        if (triggerChild?.type === SelectValue) {
          placeholder = triggerChild.props.placeholder || '';
        }
      });
    } else if (child?.type === SelectContent) {
      extractItems(child.props.children);
    }
  });

  return (
    <select
      className={`
        w-full px-3 sm:px-5 py-2 sm:py-3
        bg-white border-2 border-gray-200 rounded-xl
        text-gray-900 text-sm font-medium
        focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
        transition-all duration-300
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
        hover:border-gray-300 hover:shadow-md
        cursor-pointer shadow-sm
        ${className}
      `}
      value={value || ''}
      onChange={(e) => onValueChange && onValueChange(e.target.value)}
      {...props}
    >
      {placeholder && !value && <option value="">{placeholder}</option>}
      {items.map((item) => (
        <option key={item.props.value} value={item.props.value}>
          {item.props.children}
        </option>
      ))}
    </select>
  );
};

export const SelectContent = ({ children }) => null;
export const SelectItem = ({ children, value }) => null;
export const SelectTrigger = ({ children }) => null;
export const SelectValue = ({ placeholder }) => null;

export default Select;
