import decky_plugin
import time
import os
import subprocess
import file_timeout
import plugin_settings as settings
import plugin_enums

STATE_FILE = "/tmp/.deckyplumber.state"


def get_env():
    env = os.environ.copy()
    env["LD_LIBRARY_PATH"] = ""
    return env


# sync the state of the controller to the values in settings.json
def sync_controller_settings(current_game_id):
    controller_profile = settings.get_controller_profile_for_game_id(current_game_id)

    mode = controller_profile.get("mode")

    if mode:
        set_controller_mode(mode)


def set_controller_mode(mode):
    try:
        with file_timeout.time_limit(2):
            decky_plugin.logger.info(f"setting mode {mode}")

            if os.path.exists(STATE_FILE):
                state_file = open(STATE_FILE, "r")
                current_mode = state_file.read().strip()
                state_file.close()

                if current_mode == mode:
                    decky_plugin.logger.info(f"controller mode is already {mode}")
                    return

            execute_mode_change(mode)
    except Exception as e:
        decky_plugin.logger.error(
            f"{__name__} error while trying to execute controller mode change",
            exc_info=True,
        )


def execute_mode_change(mode):
    try:
        if mode == plugin_enums.ControllerModes.DEFAULT.value:
            # handle for default
            decky_plugin.logger.info("handle for setting default mode")
            if os.path.exists(STATE_FILE):
                os.remove(STATE_FILE)
                cmd = "systemctl restart inputplumber"
                subprocess.run(
                cmd,
                shell=True,
                check=True,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=get_env(),
            )
        else:
            cmd = f'busctl call org.shadowblip.InputPlumber /org/shadowblip/InputPlumber/CompositeDevice0 org.shadowblip.Input.CompositeDevice SetTargetDevices "as" 3 "{mode}" keyboard mouse'
            subprocess.run(
                cmd,
                shell=True,
                check=True,
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                env=get_env(),
            )
            with open(STATE_FILE, "w") as state:
                state.write(f"{mode}")
                state.close()
    except Exception as e:
        decky_plugin.logger.error(
            f"{__name__} error while trying to execute controller mode change",
            exc_info=True,
        )
