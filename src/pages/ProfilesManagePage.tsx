import { FC, useState, useCallback, useEffect } from "react";
import {
  ButtonItem,
  ConfirmModal,
  DialogBody,
  DialogButton,
  DialogControlsSection,
  DialogControlsSectionHeader,
  Field,
  Focusable,
  Menu,
  MenuItem,
  TextField,
  showContextMenu,
  showModal,
} from "@decky/ui";
import { FaEllipsisH } from "react-icons/fa";
import {
  getSettings,
  getProfileDetail,
  createCustomProfile,
  updateCustomProfile,
  deleteCustomProfile,
  duplicateProfile,
} from "../backend/utils";
import { controllerSlice, MappingProfileInfo } from "../redux-modules/controllerSlice";
import { store } from "../redux-modules/store";
import MappingEditModal, {
  ProfileMapping,
} from "../components/profile-editor/MappingEditModal";
import { capabilityLabel, mappingDescription } from "../components/profile-editor/eventRegistry";

const MenuButton: FC<{ onClick: (e: MouseEvent) => void }> = ({ onClick }) => (
  <DialogButton
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "10px",
      width: "40px",
      height: "40px",
      minWidth: "40px",
      maxWidth: "40px",
    }}
    onClick={onClick}
  >
    <FaEllipsisH />
  </DialogButton>
);

const refreshGlobalProfiles = async () => {
  const results = await getSettings();
  if (results?.mappingProfiles) {
    store.dispatch(
      controllerSlice.actions.setMappingProfiles(results.mappingProfiles)
    );
  }
};

// -----------------------------------------------------------------------
// Profile Edit Modal
// -----------------------------------------------------------------------

const ProfileEditModal: FC<{
  profileId: string;
  onDone: () => void;
  closeModal?: () => void;
}> = ({ profileId, onDone, closeModal }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [mappings, setMappings] = useState<ProfileMapping[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getProfileDetail(profileId).then((data) => {
      if (data) {
        setName(data.name);
        setDescription(data.description ?? "");
        setMappings(data.mapping ?? []);
      }
      setLoaded(true);
    });
  }, [profileId]);

  const handleSave = async () => {
    await updateCustomProfile(profileId, {
      name: name.trim() || "Untitled",
      description,
      mapping: mappings,
    });
    await refreshGlobalProfiles();
    onDone();
    closeModal?.();
  };

  const openAddMapping = () => {
    showModal(
      <MappingEditModal
        onSave={(m) => setMappings((prev) => [...prev, m])}
      />
    );
  };

  const openEditMapping = (index: number) => {
    showModal(
      <MappingEditModal
        mapping={mappings[index]}
        onSave={(m) =>
          setMappings((prev) => prev.map((old, i) => (i === index ? m : old)))
        }
      />
    );
  };

  const showMappingMenu = (index: number, e: any) => {
    showContextMenu(
      <Menu label={mappings[index]?.name ?? "Mapping"}>
        <MenuItem onClick={() => openEditMapping(index)}>
          Edit
        </MenuItem>
        <MenuItem
          tone="destructive"
          onClick={() => setMappings((prev) => prev.filter((_, i) => i !== index))}
        >
          Delete
        </MenuItem>
      </Menu>,
      e?.currentTarget ?? window,
    );
  };

  if (!loaded) {
    return (
      <ConfirmModal
        strTitle="Loading..."
        onOK={() => {}}
        onCancel={closeModal}
        strOKButtonText="OK"
        strCancelButtonText="Cancel"
      />
    );
  }

  return (
    <ConfirmModal
      strTitle={`Edit: ${name || "Untitled"}`}
      onOK={handleSave}
      onCancel={closeModal}
      strOKButtonText="Save"
      strCancelButtonText="Cancel"
    >
      <Focusable>
        <TextField
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Field label={`Mappings (${mappings.length})`} />

        {mappings.map((m, idx) => (
          <Field
            key={idx}
            label={m.name}
            description={mappingDescription(m.source_event, m.target_events)}
          >
            <Focusable style={{ display: "flex" }}>
              <MenuButton onClick={(e) => showMappingMenu(idx, e)} />
            </Focusable>
          </Field>
        ))}

        <ButtonItem layout="below" onClick={openAddMapping}>
          Add Mapping
        </ButtonItem>
      </Focusable>
    </ConfirmModal>
  );
};

// -----------------------------------------------------------------------
// Profiles Manage Page
// -----------------------------------------------------------------------

const ProfilesManagePage: FC = () => {
  const [profiles, setProfiles] = useState<MappingProfileInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const results = await getSettings();
    if (results?.mappingProfiles) {
      setProfiles(results.mappingProfiles);
      store.dispatch(
        controllerSlice.actions.setMappingProfiles(results.mappingProfiles)
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const customProfiles = profiles.filter((p) => !p.isPreset);
  const presetProfiles = profiles.filter((p) => p.isPreset);

  const openEditModal = useCallback((profileId: string) => {
    showModal(
      <ProfileEditModal profileId={profileId} onDone={reload} />
    );
  }, [reload]);

  const showCustomProfileMenu = useCallback((profile: MappingProfileInfo, e: any) => {
    showContextMenu(
      <Menu label={profile.name}>
        <MenuItem onClick={() => openEditModal(profile.id)}>
          Edit
        </MenuItem>
        <MenuItem onClick={() => {
          duplicateProfile(profile.id, `${profile.name} (Copy)`).then(reload);
        }}>
          Duplicate
        </MenuItem>
        <MenuItem
          tone="destructive"
          onClick={() => {
            showModal(
              <ConfirmModal
                strTitle="Delete Profile"
                strDescription={`Delete "${profile.name}"? This cannot be undone.`}
                strOKButtonText="Delete"
                strCancelButtonText="Cancel"
                onOK={async () => {
                  await deleteCustomProfile(profile.id);
                  await reload();
                }}
              />
            );
          }}
        >
          Delete
        </MenuItem>
      </Menu>,
      e?.currentTarget ?? window,
    );
  }, [openEditModal, reload]);

  const showPresetProfileMenu = useCallback((profile: MappingProfileInfo, e: any) => {
    showContextMenu(
      <Menu label={profile.name}>
        <MenuItem onClick={() => {
          duplicateProfile(profile.id, `${profile.name} (Copy)`).then(reload);
        }}>
          Copy to Custom
        </MenuItem>
      </Menu>,
      e?.currentTarget ?? window,
    );
  }, [reload]);

  const handleCreate = useCallback(async () => {
    const result = await createCustomProfile({
      name: "New Profile",
      description: "",
      mapping: [],
    });
    if (result && !result.error) {
      await reload();
      openEditModal(result.id);
    }
  }, [openEditModal, reload]);

  if (loading) {
    return <DialogBody><Field label="Loading..." /></DialogBody>;
  }

  return (
    <DialogBody>
      <DialogControlsSection>
        <DialogControlsSectionHeader>Custom Profiles</DialogControlsSectionHeader>
        {customProfiles.length === 0 ? (
          <Field label="No custom profiles yet." />
        ) : (
          customProfiles.map((p) => (
            <Field
              key={p.id}
              label={p.name}
              description={p.description || "No description"}
            >
              <Focusable style={{ display: "flex" }}>
                <MenuButton onClick={(e) => showCustomProfileMenu(p, e)} />
              </Focusable>
            </Field>
          ))
        )}
      </DialogControlsSection>

      {presetProfiles.length > 0 && (
        <DialogControlsSection>
          <DialogControlsSectionHeader>Preset Profiles</DialogControlsSectionHeader>
          {presetProfiles.map((p) => (
            <Field
              key={p.id}
              label={p.name}
              description={p.description || "Built-in preset"}
            >
              <Focusable style={{ display: "flex" }}>
                <MenuButton onClick={(e) => showPresetProfileMenu(p, e)} />
              </Focusable>
            </Field>
          ))}
        </DialogControlsSection>
      )}

      <DialogControlsSection>
        <DialogControlsSectionHeader>Actions</DialogControlsSectionHeader>
        <ButtonItem layout="below" onClick={handleCreate}>
          New Profile
        </ButtonItem>
      </DialogControlsSection>
    </DialogBody>
  );
};

export default ProfilesManagePage;
