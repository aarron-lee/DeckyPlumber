import os
import subprocess

import decky_plugin
from plugin_enums import ControllerModes

_DEFAULT_OPTION = {"data": ControllerModes.DEFAULT.value, "label": "Default"}

MODE_OPTIONS = [
    {"data": ControllerModes.XBOX.value, "label": "Xbox Series"},
    {"data": ControllerModes.XBOX_ELITE.value, "label": "Xbox Elite"},
    {"data": ControllerModes.DUAL_SENSE.value, "label": "DualSense"},
    {"data": ControllerModes.DUAL_SENSE_EDGE.value, "label": "DualSense Edge"},
    {"data": ControllerModes.HORI_STEAM.value, "label": "Hori Steam"},
    {"data": ControllerModes.STEAM_DECK.value, "label": "Steam Deck"},
    {"data": ControllerModes.BITDO_ULTIMATE_2.value, "label": "8BitDo Ultimate 2"},
]


def get_controller_mode_options():
    supported_target_ids = _get_supported_target_ids()

    if len(supported_target_ids) > 0:
        # filter MODE_OPTIONS
        options = [
            item for item in MODE_OPTIONS if item.get("data") in supported_target_ids
        ]

        return [_DEFAULT_OPTION] + options

    return [_DEFAULT_OPTION] + MODE_OPTIONS


def _get_supported_target_ids() -> list:
    """Query InputPlumber Manager for supported target device IDs.

    Returns a list of ID strings (e.g. ["xbox-series", "ds5", ...]),
    or an empty list if the query fails (older InputPlumber without Manager API).
    """
    try:
        result = subprocess.run(
            [
                "busctl",
                "get-property",
                "org.shadowblip.InputPlumber",
                "/org/shadowblip/InputPlumber/Manager",
                "org.shadowblip.InputManager",
                "SupportedTargetDeviceIds",
            ],
            text=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=get_env(),
        )
        if result.returncode != 0:
            decky_plugin.logger.warning(
                f"SupportedTargetDeviceIds query failed: {result.stderr.strip()}"
            )
            return []
        # Output format: as <count> "id1" "id2" ...
        output = result.stdout.strip()
        if not output.startswith("as "):
            return []
        parts = output.split()
        return [p.strip('"') for p in parts[2:]]
    except Exception:
        decky_plugin.logger.warning(
            "Failed to query SupportedTargetDeviceIds", exc_info=True
        )
        return []


def get_env():
    env = os.environ.copy()
    env["LD_LIBRARY_PATH"] = ""
    return env
