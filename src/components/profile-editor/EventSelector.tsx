import { FC, useEffect, useMemo } from "react";
import { DropdownItem } from "@decky/ui";
import {
  EVENT_REGISTRY,
  CapabilityConfig,
  describeCapability,
  displayValue,
} from "./eventRegistry";
import { L } from "../../i18n";
import { t } from "i18next";

type Props = {
  value: CapabilityConfig;
  onChange: (config: CapabilityConfig) => void;
  label?: string;
};

const EventSelector: FC<Props> = ({ value, onChange, label }) => {
  const parsed = useMemo(() => describeCapability(value), [value]);

  const selectedCategory = parsed?.category ?? "";
  const selectedSubType = parsed?.subType ?? "";
  const selectedValue = parsed?.value ?? "";

  const categoryOptions = useMemo(
    () =>
      Object.entries(EVENT_REGISTRY).map(([key, cat]) => ({
        data: key,
        label: cat.label,
      })),
    []
  );

  const subTypeOptions = useMemo(() => {
    if (!selectedCategory) return [];
    const cat = EVENT_REGISTRY[selectedCategory];
    if (!cat) return [];
    return Object.entries(cat.subTypes).map(([key, st]) => ({
      data: key,
      label: st.label,
    }));
  }, [selectedCategory]);

  const valueOptions = useMemo(() => {
    if (!selectedCategory || !selectedSubType) return [];
    const st = EVENT_REGISTRY[selectedCategory]?.subTypes[selectedSubType];
    if (!st) return [];
    return st.values.map((v) => ({ data: v, label: displayValue(v) }));
  }, [selectedCategory, selectedSubType]);

  // When a category is chosen but no subType matches, auto-select the first subType
  useEffect(() => {
    if (selectedCategory && !selectedSubType && subTypeOptions.length > 0) {
      const firstSt = subTypeOptions[0].data;
      const cat = EVENT_REGISTRY[selectedCategory];
      const st = cat?.subTypes[firstSt];
      if (st && st.values.length > 0) {
        onChange(st.buildConfig(st.values[0]));
      }
    }
  }, [selectedCategory, selectedSubType, subTypeOptions, onChange]);

  const handleCategoryChange = (data: { data: string }) => {
    const catKey = data.data;
    const cat = EVENT_REGISTRY[catKey];
    if (!cat) return;
    const firstStKey = Object.keys(cat.subTypes)[0];
    const firstSt = cat.subTypes[firstStKey];
    if (firstSt && firstSt.values.length > 0) {
      onChange(firstSt.buildConfig(firstSt.values[0]));
    }
  };

  const handleSubTypeChange = (data: { data: string }) => {
    const stKey = data.data;
    const st = EVENT_REGISTRY[selectedCategory]?.subTypes[stKey];
    if (st && st.values.length > 0) {
      onChange(st.buildConfig(st.values[0]));
    }
  };

  const handleValueChange = (data: { data: string }) => {
    const st = EVENT_REGISTRY[selectedCategory]?.subTypes[selectedSubType];
    if (st) {
      onChange(st.buildConfig(data.data));
    }
  };

  return (
    <>
      <DropdownItem
        label={label ? `${label} — ${t(L.TYPE)}` : t(L.TYPE)}
        rgOptions={categoryOptions}
        selectedOption={selectedCategory}
        onChange={handleCategoryChange}
      />
      {subTypeOptions.length > 1 && (
        <DropdownItem
          label={label ? `${label} — ${t(L.SUB_TYPE)}` : t(L.SUB_TYPE)}
          rgOptions={subTypeOptions}
          selectedOption={selectedSubType}
          onChange={handleSubTypeChange}
        />
      )}
      <DropdownItem
        label={label ? `${label} — ${t(L.VALUE)}` : t(L.VALUE)}
        rgOptions={valueOptions}
        selectedOption={selectedValue}
        onChange={handleValueChange}
      />
    </>
  );
};

export default EventSelector;
