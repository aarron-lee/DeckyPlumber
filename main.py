import os
import logging
import decky_plugin
import controller_utils
import device
import file_timeout
import plugin_update
import plugin_settings
from plugin_enums import ControllerModes
class Plugin:
    # Asyncio-compatible long-running code, executed in a task when the plugin is loaded
    async def _main(self):
        decky_plugin.logger.info("Hello World!")

    async def get_settings(self):
        results = plugin_settings.get_settings()

        try:
            results['pluginVersionNum'] = f'{decky_plugin.DECKY_PLUGIN_VERSION}'

            results['deviceName'] = device.get_device_name()
        except Exception as e:
            decky_plugin.logger.error(e)

        return results

    async def save_per_game_profiles_enabled(self, enabled: bool):
        return plugin_settings.set_setting('perGameProfilesEnabled', enabled)

    async def save_controller_settings(self, payload):
        currentGameId = payload.get('currentGameId')
        controllerProfiles = payload.get('controllerProfiles')
        result = plugin_settings.set_all_controller_profiles(controllerProfiles)

        if currentGameId:
            controller_utils.sync_controller_settings(currentGameId)
        return result

    async def on_suspend(self, currentGameId):
        mode = plugin_settings.get_controller_mode_for_game_id(currentGameId)

        if mode and mode == ControllerModes.STEAM_DECK.value:
            # Steam Deck Controller breaks on suspend, so temporarily set to default instead
            controller_utils.set_controller_mode(
                ControllerModes.DEFAULT.value
            )

    async def on_resume(self, currentGameId):
        mode = plugin_settings.get_controller_mode_for_game_id(currentGameId)

        if mode and mode == ControllerModes.STEAM_DECK.value:
             # if deck on_resume, enable STEAM_DECK
            controller_utils.set_controller_mode(
                ControllerModes.STEAM_DECK.value
            )

    # sync state in settings.json to actual controller hardware
    async def sync_controller_settings(self, currentGameId):
        return controller_utils.sync_controller_settings(currentGameId)

    async def ota_update(self):
        # trigger ota update
        try:
            with file_timeout.time_limit(15):
                plugin_update.ota_update()
        except Exception as e:
            logging.error(e)

    async def get_latest_version_num(self):
        return plugin_update.get_latest_version()

    # Function called first during the unload process, utilize this to handle your plugin being removed
    async def _unload(self):
        decky_plugin.logger.info("Goodbye World!")
        pass

    # Migrations that should be performed before entering `_main()`.
    async def _migration(self):
        decky_plugin.logger.info("Migrations")

    async def log_info(self, info):
        logging.info(info)