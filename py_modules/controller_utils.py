import decky_plugin
import device
import time
import os
import subprocess
import file_timeout
import plugin_settings as settings
import plugin_enums
import mapping_profiles

STATE_FILE = "/tmp/.inputplumber.state"


def get_env():
    env = os.environ.copy()
    env["LD_LIBRARY_PATH"] = ""
    return env


def sync_controller_settings(current_game_id):
    controller_profile = settings.get_controller_profile_for_game_id(current_game_id)

    mode = controller_profile.get("mode")

    restarted = False
    if mode:
        restarted = set_controller_mode(mode)

    if restarted:
        _wait_for_inputplumber_dbus()
        mapping_profiles.capture_base_profile()

    active_profiles = controller_profile.get("activeProfiles", [])
    merge_base = settings.get_settings().get("mergeBaseProfile", True)
    mapping_profiles.apply_mapping_profiles(active_profiles, merge_base=merge_base)


def set_controller_mode(mode):
    """Set controller mode. Returns True if InputPlumber was restarted."""
    try:
        with file_timeout.time_limit(10):
            decky_plugin.logger.info(f"setting mode {mode}")

            if os.path.exists(STATE_FILE):
                state_file = open(STATE_FILE, "r")
                current_mode = state_file.read().strip()
                state_file.close()

                if current_mode == mode:
                    decky_plugin.logger.info(f"controller mode is already {mode}")
                    return False

            return execute_mode_change(mode)
    except Exception as e:
        decky_plugin.logger.error(
            f"{__name__} error while trying to execute controller mode change",
            exc_info=True,
        )
    return False


def _wait_for_inputplumber_dbus(timeout=5, interval=0.5):
    """Poll until InputPlumber's DBus interface is reachable."""
    elapsed = 0.0
    while elapsed < timeout:
        try:
            result = subprocess.run(
                ["busctl", "get-property",
                 "org.shadowblip.InputPlumber",
                 "/org/shadowblip/InputPlumber/CompositeDevice0",
                 "org.shadowblip.Input.CompositeDevice",
                 "ProfileName"],
                check=True, text=True,
                stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                env=get_env(),
            )
            if result.returncode == 0:
                decky_plugin.logger.info(
                    f"InputPlumber DBus ready after {elapsed:.1f}s"
                )
                return True
        except Exception:
            pass
        time.sleep(interval)
        elapsed += interval
    decky_plugin.logger.warning(
        f"InputPlumber DBus not ready after {timeout}s"
    )
    return False


def execute_mode_change(mode):
    """Execute mode change. Returns True if InputPlumber was restarted."""
    try:
        if mode == plugin_enums.ControllerModes.DEFAULT.value:
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
                return True
            return False
        else:
            inputplumber_args = f'3 "{mode}" keyboard mouse'

            if device.is_legion_go():
                inputplumber_args = f'3 "{mode}" keyboard touchpad'
            if device.is_ayaneo_flip():
                inputplumber_args = f'4 "{mode}" keyboard mouse touchscreen'

            cmd = f'busctl call org.shadowblip.InputPlumber /org/shadowblip/InputPlumber/CompositeDevice0 org.shadowblip.Input.CompositeDevice SetTargetDevices "as" {inputplumber_args}'
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
            return False
    except Exception as e:
        decky_plugin.logger.error(
            f"{__name__} error while trying to execute controller mode change",
            exc_info=True,
        )
    return False
