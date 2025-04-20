// VALUE can be:
// DualSense: ds5
// DualSense Edge: ds5-edge
// SteamDeck: deck
// Xbox: xbox-series
// Xbox Elite: xbox-elite

export enum ControllerModes {
  DEFAULT = "default",
  XBOX = "xbox-series",
  XBOX_ELITE = "xbox-elite",
  DUAL_SENSE = "ds5",
  DUAL_SENSE_EDGE = "ds5-edge",
  HORI_STEAM = "hori-steam",
  STEAM_DECK = "deck",
  DECK_UHID = "deck-uhid",
}

export enum AdvancedOptionsEnum {
  ALWAYS_USE_DEFAULT = "ALWAYS_USE_DEFAULT",
}
