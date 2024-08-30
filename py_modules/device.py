import file_timeout
import decky_plugin
from enum import Enum

class Devices(Enum):
  WIN_4_6800U = 'G1618-04'

def get_device_name():
  try:
    with file_timeout.time_limit(2):
      with open("/sys/devices/virtual/dmi/id/product_name", "r") as file:
        device_name = file.read().strip()
        file.close()

        return device_name
  except Exception as e:
    decky_plugin.logger.error(f'{__name__} error while trying to read device name')
    return ''