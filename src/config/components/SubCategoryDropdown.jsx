import React, { useState, useEffect } from 'react';
import { FormGroup, Label, Select } from '@adminjs/design-system';

const SubCategoryDropdown = (props) => {
  const { record, onChange, property } = props;
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSubCategories = async () => {
      const categoryId = record.params.category;
      if (!categoryId) {
        setSubCategories([]);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`/api/categories/${categoryId}/subcategories`);
        const data = await response.json();
        const options = Array.isArray(data)
          ? data.map(sub => ({
              value: sub._id,
              label: sub.name,
            }))
          : [];
        setSubCategories(options);
      } catch (error) {
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSubCategories();
  }, [record.params.category]);

  // Find the option object for the current value (important for correct Select behavior)
  const selectedValue = record.params[property.path];
  const selectedOption = subCategories.find(opt => opt.value === selectedValue) || null;

  return (
    <FormGroup>
      <Label>{property.label}</Label>
      <Select
        value={selectedOption}
        onChange={selected =>
          onChange(property.path, selected ? selected.value : null)
        }
        options={subCategories}
        isDisabled={!record.params.category || loading}
        isClearable
        placeholder={loading ? "Loading..." : "Select subcategory"}
      />
      {!loading && subCategories.length === 0 && record.params.category && (
        <div style={{ color: "red", fontSize: "12px", marginTop: "4px" }}>
          No subcategories found for this category
        </div>
      )}
    </FormGroup>
  );
};

export default SubCategoryDropdown;
