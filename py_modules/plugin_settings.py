import os
import subprocess
from settings import SettingsManager

settings_directory = os.environ["DECKY_PLUGIN_SETTINGS_DIR"]
settings_path = os.path.join(settings_directory, 'settings.json')
setting_file = SettingsManager(name="settings", settings_directory=settings_directory)
setting_file.read()

def deep_merge(origin, destination):
    for k, v in origin.items():
        if isinstance(v, dict):
            n = destination.setdefault(k, {})
            deep_merge(v, n)
        else:
            destination[k] = v

    return destination

def get_settings():
    setting_file.read()
    return setting_file.settings

def set_setting(name: str, value):
    return setting_file.setSetting(name, value)

DEFAULT_CONTROLLER_VALUES = {
  "mode": "default"
}

def bootstrap_controller_settings(profileName: str):
    settings = get_settings()

    if not settings.get('controllerProfiles'):
        settings['controllerProfiles'] = {}
    controller_profiles = settings['controllerProfiles']
    if not controller_profiles.get(profileName):
        controller_profiles[profileName] = {}
    controller_profile = controller_profiles[profileName]
    default_controller_profile = controller_profiles.get('default')

    if not controller_profile:
        controller_profile = default_controller_profile or DEFAULT_CONTROLLER_VALUES

def set_controller_profile_value(profileName: str, key: str, value):
    bootstrap_controller_settings(profileName)

    setting_file.settings['controllerProfiles'][profileName][key] = value
    setting_file.commit()

def set_controller_profile_values(profileName: str, values):
    bootstrap_controller_settings(profileName)

    profile = setting_file.settings['controllerProfiles'][profileName]

    deep_merge(values, profile)

    setting_file.settings['controllerProfiles'][profileName] = profile

    setting_file.commit()

def set_all_controller_profiles(controller_profiles):
    for profileName, controllerProfile in controller_profiles.items():
        set_controller_profile_values(
            profileName=profileName,
            values=controllerProfile
        )
