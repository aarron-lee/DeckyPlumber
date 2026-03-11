import { FC, useState } from "react";
import {
  ButtonItem,
  ConfirmModal,
  DialogButton,
  DialogControlsSection,
  DialogControlsSectionHeader,
  Field,
  Focusable,
  TextField,
} from "@decky/ui";
import { FaPen, FaTrash } from "react-icons/fa";
import EventSelector from "./EventSelector";
import { CapabilityConfig, capabilityLabel, shortCapabilityLabel } from "./eventRegistry";
import { L } from "../../i18n";
import { t } from "i18next";

export type ProfileMapping = {
  name: string;
  source_event: CapabilityConfig;
  target_events: CapabilityConfig[];
};

const DEFAULT_EVENT: CapabilityConfig = { gamepad: { button: "South" } };

const ICON_BTN_STYLE: React.CSSProperties = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "10px",
  width: "40px",
  height: "40px",
  minWidth: "40px",
  maxWidth: "40px",
};

type Props = {
  mapping?: ProfileMapping;
  onSave: (mapping: ProfileMapping) => void;
  closeModal?: () => void;
};

const MappingEditModal: FC<Props> = ({ mapping, onSave, closeModal }) => {
  const isNew = !mapping;
  const [name, setName] = useState(mapping?.name ?? "");
  const [sourceEvent, setSourceEvent] = useState<CapabilityConfig>(
    mapping?.source_event ?? { ...DEFAULT_EVENT }
  );
  const [targetEvents, setTargetEvents] = useState<CapabilityConfig[]>(
    mapping?.target_events ?? [{ ...DEFAULT_EVENT }]
  );
  const [editingTargetIdx, setEditingTargetIdx] = useState<number | null>(null);

  const handleConfirm = () => {
    const finalName =
      name.trim() ||
      `${capabilityLabel(sourceEvent)} → ${capabilityLabel(targetEvents[0])}`;
    onSave({
      name: finalName,
      source_event: sourceEvent,
      target_events: targetEvents,
    });
    closeModal?.();
  };

  const removeTarget = (index: number) => {
    setTargetEvents((prev) => prev.filter((_, i) => i !== index));
    if (editingTargetIdx === index) setEditingTargetIdx(null);
  };

  const addTarget = () => {
    setTargetEvents((prev) => [...prev, { ...DEFAULT_EVENT }]);
    setEditingTargetIdx(targetEvents.length);
  };

  return (
    <ConfirmModal
      strTitle={isNew ? t(L.ADD_MAPPING) : t(L.EDIT_MAPPING)}
      onOK={handleConfirm}
      onCancel={closeModal}
      strOKButtonText={t(L.SAVE)}
      strCancelButtonText={t(L.CANCEL)}
    >
      <Focusable>
        <DialogControlsSection>
          <DialogControlsSectionHeader>{t(L.GENERAL)}</DialogControlsSectionHeader>
          <TextField
            label={t(L.NAME)}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </DialogControlsSection>

        <DialogControlsSection>
          <DialogControlsSectionHeader>{t(L.SOURCE_EVENT)}</DialogControlsSectionHeader>
          <EventSelector
            value={sourceEvent}
            onChange={setSourceEvent}
          />
        </DialogControlsSection>

        <DialogControlsSection>
          <DialogControlsSectionHeader>
            {t(L.TARGET_EVENTS, { count: targetEvents.length })}
          </DialogControlsSectionHeader>

          {targetEvents.map((te, idx) => (
            <div key={idx}>
              <Field
                label={t(L.TARGET_N, { n: idx + 1 })}
                description={shortCapabilityLabel(te)}
              >
                <Focusable style={{ display: "flex", gap: "8px" }}>
                  <DialogButton
                    style={ICON_BTN_STYLE}
                    onClick={() =>
                      setEditingTargetIdx(editingTargetIdx === idx ? null : idx)
                    }
                  >
                    <FaPen />
                  </DialogButton>
                  {targetEvents.length > 1 && (
                    <DialogButton
                      style={ICON_BTN_STYLE}
                      onClick={() => removeTarget(idx)}
                    >
                      <FaTrash />
                    </DialogButton>
                  )}
                </Focusable>
              </Field>

              {editingTargetIdx === idx && (
                <EventSelector
                  value={te}
                  onChange={(c) =>
                    setTargetEvents((prev) =>
                      prev.map((t, i) => (i === idx ? c : t))
                    )
                  }
                />
              )}
            </div>
          ))}

          <ButtonItem layout="below" onClick={addTarget}>
            {t(L.ADD_TARGET)}
          </ButtonItem>
        </DialogControlsSection>
      </Focusable>
    </ConfirmModal>
  );
};

export default MappingEditModal;
