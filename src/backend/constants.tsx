export type ControllerModeOption = {
  data: ControllerModes;
  label: string;
};

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
