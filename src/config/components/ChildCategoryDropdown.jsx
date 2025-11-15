import React, { useState, useEffect } from 'react';
import { FormGroup, Label, Select } from '@adminjs/design-system';

const ChildCategoryDropdown = (props) => {
  const { record, onChange, property } = props;
  const [childCategories, setChildCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchChildCategories = async () => {
      const categoryId = record.params.category;
      const subCategoryId = record.params.subCategory;

      if (!categoryId || !subCategoryId) {
        setChildCategories([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `/api/categories/${categoryId}/subcategories/${subCategoryId}/children`
        );
        const data = await response.json();
        const options = Array.isArray(data)
          ? data.map(child => ({
              value: child._id,
              label: child.name,
            }))
          : [];
        setChildCategories(options);
      } catch (error) {
        setChildCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchChildCategories();
  }, [record.params.category, record.params.subCategory]);

  // Ensure selected value is an option object for correct Select display
  const selectedValue = record.params[property.path];
  const selectedOption = childCategories.find(opt => opt.value === selectedValue) || null;

  return (
    <FormGroup>
      <Label>{property.label}</Label>
      <Select
        value={selectedOption}
        onChange={selected => onChange(property.path, selected ? selected.value : null)}
        options={childCategories}
        isDisabled={!record.params.subCategory || loading}
        isClearable
        placeholder={loading ? "Loading..." : "Select child category"}
      />
      {!loading && childCategories.length === 0 && record.params.subCategory && (
        <div style={{ color: "orange", fontSize: "12px", marginTop: "4px" }}>
          No child categories found for this subcategory
        </div>
      )}
    </FormGroup>
  );
};

export default ChildCategoryDropdown;
