import os
import subprocess
from settings import SettingsManager
from collections import deque
from constants import DefaultSettings

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

def get_controller_profile_for_game_id(game_id):
    s = get_settings()
    per_game_profiles_enabled = s.get('perGameProfilesEnabled', False)

    controller_profile = s.get('controllerProfiles', {}).get(game_id if per_game_profiles_enabled else 'default')

    return controller_profile

def get_controller_mode_for_game_id(game_id):
    controller_profile = get_controller_profile_for_game_id(game_id)
    mode = controller_profile.get('mode',  None)

    return mode

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

def get_nested_setting(path):
  if not path:
    return None

  settings = get_settings()
  pathValues = deque(path.split('.'))

  result = settings

  while len(pathValues) > 0 and result:
    result = result.get(pathValues.popleft())
  
  return result