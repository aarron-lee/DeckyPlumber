import file_timeout
import decky_plugin
from enum import Enum

class Devices(Enum):
  WIN_4_6800U = 'G1618-04'
  LEGION_GO = "83E1"
  ROG_ALLY = "ROG Ally RC71"
  ROG_ALLY_X = "ROG Ally X RC72"

DEVICE_NAME = None

def get_device_name():
  global DEVICE_NAME

  if not DEVICE_NAME:
    try:
      with file_timeout.time_limit(2):
        with open("/sys/devices/virtual/dmi/id/product_name", "r") as file:
          device_name = file.read().strip()
          file.close()

          DEVICE_NAME = device_name
    except Exception as e:
      decky_plugin.logger.error(f'{__name__} error while trying to read device name')
  return DEVICE_NAME or ''

def is_rog_ally_x():
  device_name = get_device_name()

  if Devices.ROG_ALLY_X.value in device_name:
    return True
  return False

def is_rog_ally():
  device_name = get_device_name()

  if Devices.ROG_ALLY.value in device_name:
    return True
  return False

def is_legion_go():
  device_name = get_device_name()

  if device_name == Devices.LEGION_GO.value:
    return True
  return False