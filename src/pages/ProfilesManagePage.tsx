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
import { mappingDescription } from "../components/profile-editor/eventRegistry";
import { L } from "../i18n";
import { t } from "i18next";

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
      name: name.trim() || t(L.UNTITLED),
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
          {t(L.EDIT)}
        </MenuItem>
        <MenuItem
          tone="destructive"
          onClick={() => setMappings((prev) => prev.filter((_, i) => i !== index))}
        >
          {t(L.DELETE)}
        </MenuItem>
      </Menu>,
      e?.currentTarget ?? window,
    );
  };

  if (!loaded) {
    return (
      <ConfirmModal
        strTitle={t(L.LOADING)}
        onOK={() => {}}
        onCancel={closeModal}
        strOKButtonText={t(L.OK)}
        strCancelButtonText={t(L.CANCEL)}
      />
    );
  }

  return (
    <ConfirmModal
      strTitle={`${t(L.EDIT)}: ${name || t(L.UNTITLED)}`}
      onOK={handleSave}
      onCancel={closeModal}
      strOKButtonText={t(L.SAVE)}
      strCancelButtonText={t(L.CANCEL)}
    >
      <Focusable>
        <TextField
          label={t(L.NAME)}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label={t(L.DESCRIPTION)}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Field label={t(L.MAPPINGS_COUNT, { count: mappings.length })} />

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
          {t(L.ADD_MAPPING)}
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
          {t(L.EDIT)}
        </MenuItem>
        <MenuItem onClick={() => {
          duplicateProfile(profile.id, `${profile.name} (Copy)`).then(reload);
        }}>
          {t(L.DUPLICATE)}
        </MenuItem>
        <MenuItem
          tone="destructive"
          onClick={() => {
            showModal(
              <ConfirmModal
                strTitle={t(L.DELETE_PROFILE)}
                strDescription={t(L.DELETE_CONFIRM, { name: profile.name })}
                strOKButtonText={t(L.DELETE)}
                strCancelButtonText={t(L.CANCEL)}
                onOK={async () => {
                  await deleteCustomProfile(profile.id);
                  await reload();
                }}
              />
            );
          }}
        >
          {t(L.DELETE)}
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
          {t(L.COPY_TO_CUSTOM)}
        </MenuItem>
      </Menu>,
      e?.currentTarget ?? window,
    );
  }, [reload]);

  const handleCreate = useCallback(async () => {
    const result = await createCustomProfile({
      name: t(L.NEW_PROFILE),
      description: "",
      mapping: [],
    });
    if (result && !result.error) {
      await reload();
      openEditModal(result.id);
    }
  }, [openEditModal, reload]);

  if (loading) {
    return <DialogBody><Field label={t(L.LOADING)} /></DialogBody>;
  }

  return (
    <DialogBody>
      <DialogControlsSection>
        <DialogControlsSectionHeader>{t(L.CUSTOM_PROFILES)}</DialogControlsSectionHeader>
        {customProfiles.length === 0 ? (
          <Field label={t(L.NO_CUSTOM_PROFILES)} />
        ) : (
          customProfiles.map((p) => (
            <Field
              key={p.id}
              label={p.name}
              description={p.description || t(L.NO_DESCRIPTION)}
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
          <DialogControlsSectionHeader>{t(L.PRESET_PROFILES)}</DialogControlsSectionHeader>
          {presetProfiles.map((p) => (
            <Field
              key={p.id}
              label={p.name}
              description={p.description || t(L.BUILT_IN_PRESET)}
            >
              <Focusable style={{ display: "flex" }}>
                <MenuButton onClick={(e) => showPresetProfileMenu(p, e)} />
              </Focusable>
            </Field>
          ))}
        </DialogControlsSection>
      )}

      <DialogControlsSection>
        <DialogControlsSectionHeader>{t(L.ACTIONS)}</DialogControlsSectionHeader>
        <ButtonItem layout="below" onClick={handleCreate}>
          {t(L.NEW_PROFILE)}
        </ButtonItem>
      </DialogControlsSection>
    </DialogBody>
  );
};

export default ProfilesManagePage;
