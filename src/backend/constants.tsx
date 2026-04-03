// VALUE can be:
// DualSense: ds5
// DualSense Edge: ds5-edge
// SteamDeck: deck
// Xbox: xbox-series
// Xbox Elite: xbox-elite
// 8BitDo Ultimate 2: 8bitdo-u2

export enum ControllerModes {
  DEFAULT = "default",
  XBOX = "xbox-series",
  XBOX_ELITE = "xbox-elite",
  DUAL_SENSE = "ds5",
  DUAL_SENSE_EDGE = "ds5-edge",
  HORI_STEAM = "hori-steam",
  STEAM_DECK = "deck-uhid",
  BITDO_ULTIMATE_2 = "8bitdo-u2",
}

export enum AdvancedOptionsEnum {
  ALWAYS_USE_DEFAULT = "ALWAYS_USE_DEFAULT",
}
