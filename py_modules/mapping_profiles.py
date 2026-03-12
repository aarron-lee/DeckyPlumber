import os
import re
import subprocess
import decky_plugin
import yaml
import file_timeout
import plugin_settings

PROFILES_DIR = os.path.join(os.path.dirname(__file__), "profiles")
CUSTOM_PROFILES_DIR = os.path.join(
    decky_plugin.DECKY_PLUGIN_SETTINGS_DIR, "custom_profiles"
)

_preset_profiles_cache = None


def _get_env():
    env = os.environ.copy()
    env["LD_LIBRARY_PATH"] = ""
    return env


def _ensure_custom_dir():
    os.makedirs(CUSTOM_PROFILES_DIR, exist_ok=True)


def _sanitize_id(name):
    """Convert a display name into a safe filesystem ID."""
    slug = re.sub(r"[^a-zA-Z0-9_-]", "_", name.strip().lower())
    slug = re.sub(r"_+", "_", slug).strip("_")
    return slug or "profile"


def _unique_id(base_id):
    """Ensure the ID doesn't collide with existing preset or custom profiles."""
    _ensure_custom_dir()
    all_ids = set(load_preset_profiles().keys())
    for f in os.listdir(CUSTOM_PROFILES_DIR):
        if f.endswith(".yaml"):
            all_ids.add(f.replace(".yaml", ""))

    if base_id not in all_ids:
        return base_id
    counter = 1
    while f"{base_id}_{counter}" in all_ids:
        counter += 1
    return f"{base_id}_{counter}"


# ---------------------------------------------------------------------------
# Loading
# ---------------------------------------------------------------------------

def load_preset_profiles():
    global _preset_profiles_cache
    if _preset_profiles_cache is not None:
        return _preset_profiles_cache

    profiles = {}
    if not os.path.isdir(PROFILES_DIR):
        return profiles

    for filename in sorted(os.listdir(PROFILES_DIR)):
        if not filename.endswith(".yaml"):
            continue
        profile_id = filename.replace(".yaml", "")
        filepath = os.path.join(PROFILES_DIR, filename)
        try:
            with open(filepath, "r") as f:
                data = yaml.safe_load(f)
            profiles[profile_id] = {
                "id": profile_id,
                "name": data.get("name", profile_id),
                "description": data.get("description", ""),
                "data": data,
            }
        except Exception as e:
            decky_plugin.logger.error(
                f"Failed to load profile {filename}: {e}"
            )

    _preset_profiles_cache = profiles
    return profiles


def load_custom_profiles():
    _ensure_custom_dir()
    profiles = {}
    for filename in sorted(os.listdir(CUSTOM_PROFILES_DIR)):
        if not filename.endswith(".yaml"):
            continue
        profile_id = filename.replace(".yaml", "")
        filepath = os.path.join(CUSTOM_PROFILES_DIR, filename)
        try:
            with open(filepath, "r") as f:
                data = yaml.safe_load(f)
            profiles[profile_id] = {
                "id": profile_id,
                "name": data.get("name", profile_id),
                "description": data.get("description", ""),
                "data": data,
            }
        except Exception as e:
            decky_plugin.logger.error(
                f"Failed to load custom profile {filename}: {e}"
            )
    return profiles


def _get_all_profiles_dict():
    """Merged dict of preset + custom profiles."""
    merged = {}
    merged.update(load_preset_profiles())
    merged.update(load_custom_profiles())
    return merged


# ---------------------------------------------------------------------------
# Query APIs
# ---------------------------------------------------------------------------

def get_all_profiles():
    """Return profile list for frontend display, with isPreset flag."""
    preset = load_preset_profiles()
    custom = load_custom_profiles()
    result = []
    for p in preset.values():
        result.append({
            "id": p["id"],
            "name": p["name"],
            "description": p["description"],
            "isPreset": True,
        })
    for p in custom.values():
        result.append({
            "id": p["id"],
            "name": p["name"],
            "description": p["description"],
            "isPreset": False,
        })
    return result


def get_profile_detail(profile_id):
    """Return full profile data including mappings."""
    all_profiles = _get_all_profiles_dict()
    profile = all_profiles.get(profile_id)
    if not profile:
        return None
    is_preset = profile_id in load_preset_profiles()
    return {
        "id": profile["id"],
        "name": profile["name"],
        "description": profile["description"],
        "isPreset": is_preset,
        "mapping": profile["data"].get("mapping", []),
    }


# ---------------------------------------------------------------------------
# CRUD for custom profiles
# ---------------------------------------------------------------------------

def _validate_profile_data(data):
    """Basic validation; raises ValueError on bad data."""
    name = data.get("name", "").strip()
    if not name:
        raise ValueError("Profile name is required")
    mapping = data.get("mapping")
    if not isinstance(mapping, list):
        raise ValueError("mapping must be a list")
    for idx, m in enumerate(mapping):
        if "source_event" not in m:
            raise ValueError(f"mapping[{idx}] missing source_event")
        if "target_events" not in m or not isinstance(m["target_events"], list):
            raise ValueError(f"mapping[{idx}] missing or invalid target_events")


def create_custom_profile(data):
    """Create a new custom profile. Returns the created profile info."""
    _validate_profile_data(data)
    _ensure_custom_dir()

    base_id = _sanitize_id(data["name"])
    profile_id = _unique_id(base_id)

    profile_data = {
        "version": 1,
        "kind": "DeviceProfile",
        "name": data["name"].strip(),
        "description": data.get("description", ""),
        "mapping": data.get("mapping", []),
    }
    filepath = os.path.join(CUSTOM_PROFILES_DIR, f"{profile_id}.yaml")
    with open(filepath, "w") as f:
        yaml.dump(profile_data, f, default_flow_style=False,
                  allow_unicode=True, sort_keys=False)

    return {
        "id": profile_id,
        "name": profile_data["name"],
        "description": profile_data["description"],
        "isPreset": False,
    }


def update_custom_profile(profile_id, data):
    """Update an existing custom profile."""
    _ensure_custom_dir()
    filepath = os.path.join(CUSTOM_PROFILES_DIR, f"{profile_id}.yaml")
    if not os.path.isfile(filepath):
        raise FileNotFoundError(f"Custom profile '{profile_id}' not found")

    _validate_profile_data(data)

    profile_data = {
        "version": 1,
        "kind": "DeviceProfile",
        "name": data["name"].strip(),
        "description": data.get("description", ""),
        "mapping": data.get("mapping", []),
    }
    with open(filepath, "w") as f:
        yaml.dump(profile_data, f, default_flow_style=False,
                  allow_unicode=True, sort_keys=False)

    return {
        "id": profile_id,
        "name": profile_data["name"],
        "description": profile_data["description"],
        "isPreset": False,
    }


def delete_custom_profile(profile_id):
    """Delete a custom profile by ID."""
    _ensure_custom_dir()
    filepath = os.path.join(CUSTOM_PROFILES_DIR, f"{profile_id}.yaml")
    if not os.path.isfile(filepath):
        raise FileNotFoundError(f"Custom profile '{profile_id}' not found")
    os.remove(filepath)
    return True


def duplicate_profile(source_id, new_name):
    """Copy any profile (preset or custom) into a new custom profile."""
    all_profiles = _get_all_profiles_dict()
    source = all_profiles.get(source_id)
    if not source:
        raise FileNotFoundError(f"Source profile '{source_id}' not found")

    return create_custom_profile({
        "name": new_name,
        "description": source["data"].get("description", ""),
        "mapping": source["data"].get("mapping", []),
    })


# ---------------------------------------------------------------------------
# Current InputPlumber profile (cached before first apply)
# ---------------------------------------------------------------------------

_BUSCTL_DEST = "org.shadowblip.InputPlumber"
_BUSCTL_PATH = "/org/shadowblip/InputPlumber/CompositeDevice0"
_BUSCTL_IFACE = "org.shadowblip.Input.CompositeDevice"

_FALLBACK_BASE_PROFILE = "/usr/share/inputplumber/profiles/default.yaml"
_cached_base_profile_info = None


def _busctl_get_property(prop_name):
    """Read a single string property from InputPlumber CompositeDevice."""
    try:
        out = subprocess.run(
            ["busctl", "get-property", _BUSCTL_DEST, _BUSCTL_PATH,
             _BUSCTL_IFACE, prop_name],
            check=True, text=True,
            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
            env=_get_env(),
        )
        raw = out.stdout.strip()
        if raw.startswith('s "') and raw.endswith('"'):
            return raw[3:-1]
    except Exception as e:
        decky_plugin.logger.error(f"busctl get {prop_name} failed: {e}")
    return ""


def capture_base_profile():
    """Snapshot the current InputPlumber profile path/name.

    Priority:
      1. DBus ProfilePath (non-empty = InputPlumber still has its own profile)
      2. Previously persisted value in settings.json
      3. Well-known fallback /usr/share/inputplumber/profiles/default.yaml
    """
    global _cached_base_profile_info

    with file_timeout.time_limit(2):
        dbus_path = _busctl_get_property("ProfilePath")
        dbus_name = _busctl_get_property("ProfileName")

    if dbus_path:
        # Fresh from InputPlumber — persist for future restarts
        info = {"path": dbus_path, "name": dbus_name}
        plugin_settings.set_setting("baseProfileInfo", info)
        decky_plugin.logger.info(
            f"Captured base profile from DBus: {dbus_name!r} @ {dbus_path!r}"
        )
    else:
        # DBus path is empty (we already overwrote it) — try persisted cache
        saved = plugin_settings.get_settings().get("baseProfileInfo")
        if saved and saved.get("path"):
            info = saved
            decky_plugin.logger.info(
                f"Restored base profile from settings: {info['name']!r} @ {info['path']!r}"
            )
        else:
            # Last resort: well-known default
            info = {"path": _FALLBACK_BASE_PROFILE, "name": "Default"}
            plugin_settings.set_setting("baseProfileInfo", info)
            decky_plugin.logger.info(
                f"Using fallback base profile: {_FALLBACK_BASE_PROFILE}"
            )

    _cached_base_profile_info = info


def get_base_profile_info():
    """Return the cached base profile info (path + name)."""
    if _cached_base_profile_info is None:
        capture_base_profile()
    return _cached_base_profile_info


def _get_base_profile_mappings():
    """Read the base profile file and return its mappings."""
    info = get_base_profile_info()
    path = info.get("path", "")
    if not path or not os.path.isfile(path):
        return []
    try:
        with open(path, "r") as f:
            data = yaml.safe_load(f)
        return data.get("mapping", [])
    except Exception as e:
        decky_plugin.logger.error(f"Failed to read base profile {path}: {e}")
        return []


# ---------------------------------------------------------------------------
# Apply
# ---------------------------------------------------------------------------

def build_combined_yaml(active_profile_ids, merge_base=False):
    """Merge mappings from selected profiles into a single profile YAML.

    When merge_base is True, the current InputPlumber profile mappings are
    used as a base layer. Custom mappings with matching source_event override
    the base; others are preserved.
    """
    all_profiles = _get_all_profiles_dict()
    custom_mappings = []

    for pid in active_profile_ids:
        profile = all_profiles.get(pid)
        if profile:
            custom_mappings.extend(profile["data"].get("mapping", []))

    if merge_base and custom_mappings:
        base_mappings = _get_base_profile_mappings()
        # Build a set of source_events from custom mappings for dedup
        custom_sources = set()
        for m in custom_mappings:
            src = yaml.dump(m.get("source_event", {}), default_flow_style=True)
            custom_sources.add(src)

        # Keep base mappings whose source_event is not overridden
        merged = []
        for m in base_mappings:
            src = yaml.dump(m.get("source_event", {}), default_flow_style=True)
            if src not in custom_sources:
                merged.append(m)
        merged.extend(custom_mappings)
        all_mappings = merged
    else:
        all_mappings = custom_mappings

    combined = {
        "version": 1,
        "kind": "DeviceProfile",
        "name": "Combined Profile",
        "mapping": all_mappings,
    }
    return yaml.dump(
        combined, default_flow_style=False, allow_unicode=True, sort_keys=False
    )


def _load_profile_yaml(profile_yaml):
    """Send a profile YAML string to InputPlumber via DBus."""
    cmd = [
        "busctl", "call",
        _BUSCTL_DEST, _BUSCTL_PATH, _BUSCTL_IFACE,
        "LoadProfileFromYaml",
        "s", profile_yaml,
    ]
    subprocess.run(
        cmd,
        check=True,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        env=_get_env(),
    )


def _restore_base_profile():
    """Reload the base profile to undo any custom LoadProfileFromYaml."""
    info = get_base_profile_info()
    path = info.get("path", "")
    if not path or not os.path.isfile(path):
        decky_plugin.logger.warning(
            f"[apply] Cannot restore base profile — file not found: {path!r}"
        )
        return

    try:
        with open(path, "r") as f:
            base_yaml = f.read()
        decky_plugin.logger.debug(f"[apply] Restoring base profile from {path}")
        _load_profile_yaml(base_yaml)
    except Exception as e:
        decky_plugin.logger.error(f"Failed to restore base profile: {e}", exc_info=True)


def apply_mapping_profiles(active_profile_ids, merge_base=False):
    """Build combined YAML and apply via DBus LoadProfileFromYaml.

    When no profiles are active, restores the base profile so that
    InputPlumber returns to its default configuration.
    """
    decky_plugin.logger.debug(
        f"[apply] called with ids={active_profile_ids!r}, merge_base={merge_base}"
    )
    if not active_profile_ids:
        decky_plugin.logger.debug(
            "[apply] No active mapping profiles — restoring base profile"
        )
        _restore_base_profile()
        return

    try:
        with file_timeout.time_limit(2):
            profile_yaml = build_combined_yaml(
                active_profile_ids, merge_base=merge_base
            )

            decky_plugin.logger.debug(
                f"[apply] YAML to send:\n{profile_yaml}"
            )

            _load_profile_yaml(profile_yaml)
    except Exception as e:
        decky_plugin.logger.error(
            f"Error applying mapping profiles: {e}",
            exc_info=True,
        )
