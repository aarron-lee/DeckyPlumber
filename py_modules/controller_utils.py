import decky_plugin
import time
import os
import subprocess
import file_timeout
import plugin_settings as settings
import plugin_enums

STATE_FILE = "/tmp/.deckyplumber.state"

# sync the state of the controller to the values in settings.json
def sync_controller_settings(current_game_id):
    s = settings.get_settings()

    controller_profile = s.get('controllerProfiles').get(current_game_id)

    mode = controller_profile.get('mode')

    if mode:
        set_controller_mode(mode)

def set_controller_mode(mode):
    try:
        with file_timeout.time_limit(2):
            decky_plugin.logger.info(f'setting mode {mode}')
            execute_mode_change(mode)
    except Exception as e:
        decky_plugin.logger.error(f'{__name__} error while trying to execute controller mode change')


def execute_mode_change(mode):
    if mode == plugin_enums.ControllerModes.DEFAULT.value:
        # handle for default
        decky_plugin.logger.info(f'handle for setting default mode')
        if os.path.exists(STATE_FILE):
            os.remove(STATE_FILE)
            cmd = f'systemctl restart inputplumber'
            subprocess.run(cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    else:
        cmd = f'busctl call org.shadowblip.InputPlumber /org/shadowblip/InputPlumber/CompositeDevice0 org.shadowblip.Input.CompositeDevice SetTargetDevices "as" 1 "{mode}"'
        subprocess.run(cmd, shell=True, check=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        with open (STATE_FILE,'w') as state:
            state.write(f'{mode}')
            state.close
