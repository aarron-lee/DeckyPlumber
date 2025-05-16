import decky_plugin
from plugin_settings import set_all_controller_profiles, get_settings

def migrate_deck_target():
  try:
    settings = get_settings()
    if not settings.get('controllerProfiles'):
      # no controller profiles exist yet, safe to exit
      return
    controller_profiles = settings.get('controllerProfiles')

    migration_count = 0

    for game_id in controller_profiles:
      profile = controller_profiles[game_id]

      mode = profile.get('mode', None)

      if mode == 'deck':
        profile['mode'] = 'deck-uhid'
        migration_count += 1

    if migration_count > 0:
      set_all_controller_profiles(controller_profiles)
  except Exception as e:
    decky_plugin.logger.error(f"{__name__} error while migrating to deck-uhid {e}")