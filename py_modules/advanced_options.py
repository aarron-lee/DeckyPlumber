import os
import decky_plugin
from plugin_settings import get_nested_setting
from enum import Enum

class DefaultSettings(Enum):
  ALWAYS_USE_DEFAULT = 'ALWAYS_USE_DEFAULT'

def get_setting(setting_name = ''):
  return get_nested_setting(f'advanced.{setting_name}')

def get_value(setting, default_value = False):
  current_val = get_nested_setting(
    f'advanced.{setting.value}'
  )

  if isinstance(current_val, bool):
    return current_val
  else:
    return default_value

def get_options():
  options = []

  default_controller_mode = {
    'name': 'Always use Default controller mode',
    'type': 'boolean',
    'defaultValue': False,
    'description': "When a new per-game profile gets created, it always sets it as the default controller mode, not the default profile's mode",
    'currentValue': get_value(DefaultSettings.ALWAYS_USE_DEFAULT, False),
    'statePath': DefaultSettings.ALWAYS_USE_DEFAULT.value
  }

  options.append(default_controller_mode)

  return options

def handle_advanced_option_change(new_values):
  decky_plugin.logger.info(f'handle_advanced_option_change {new_values}')