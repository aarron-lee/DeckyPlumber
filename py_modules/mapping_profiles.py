import os
import subprocess
import decky_plugin
import yaml
import file_timeout

PROFILES_DIR = os.path.join(os.path.dirname(__file__), "profiles")

_preset_profiles_cache = None


def _get_env():
    env = os.environ.copy()
    env["LD_LIBRARY_PATH"] = ""
    return env


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


def get_all_profiles():
    """Return profile list for frontend display (id + name only)."""
    profiles = load_preset_profiles()
    return [
        {"id": p["id"], "name": p["name"], "description": p["description"]}
        for p in profiles.values()
    ]


def build_combined_yaml(active_profile_ids):
    """Merge mappings from selected profiles into a single profile YAML."""
    profiles = load_preset_profiles()
    all_mappings = []

    for pid in active_profile_ids:
        profile = profiles.get(pid)
        if profile:
            all_mappings.extend(profile["data"].get("mapping", []))

    combined = {
        "version": 1,
        "kind": "DeviceProfile",
        "name": "Combined Profile",
        "mapping": all_mappings,
    }
    return yaml.dump(
        combined, default_flow_style=False, allow_unicode=True, sort_keys=False
    )


def apply_mapping_profiles(active_profile_ids):
    """Build combined YAML and apply via DBus LoadProfileFromYaml."""
    try:
        with file_timeout.time_limit(2):
            profile_yaml = build_combined_yaml(active_profile_ids or [])

            decky_plugin.logger.info(
                f"Applying mapping profiles: {active_profile_ids or '(none)'}"
            )

            cmd = [
                "busctl", "call",
                "org.shadowblip.InputPlumber",
                "/org/shadowblip/InputPlumber/CompositeDevice0",
                "org.shadowblip.Input.CompositeDevice",
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
    except Exception as e:
        decky_plugin.logger.error(
            f"Error applying mapping profiles: {e}",
            exc_info=True,
        )
