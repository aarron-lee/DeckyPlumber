// Data-driven event type registry for the mapping editor.
// Adding new event types only requires extending this registry
// without changing UI component logic.

export type CapabilityConfig = {
  gamepad?: {
    button?: string;
    axis?: { name: string; direction?: string; deadzone?: number };
    trigger?: { name: string; deadzone?: number };
    gyro?: { name: string };
    accelerometer?: { name: string };
    dial?: { name: string; direction?: string };
  };
  keyboard?: string;
  mouse?: {
    button?: string;
    motion?: { direction?: string; speed_pps?: number };
    wheel?: { direction?: string };
  };
  dbus?: string;
  touchpad?: any;
  touchscreen?: any;
};

export type EventSubType = {
  label: string;
  values: string[];
  buildConfig: (value: string) => CapabilityConfig;
  parseConfig: (config: CapabilityConfig) => string | undefined;
};

export type EventCategory = {
  label: string;
  subTypes: Record<string, EventSubType>;
};

export type EventRegistry = Record<string, EventCategory>;

// Human-friendly aliases for raw capability values.
// Format in dropdowns: "A (South)", in short labels: "A"
export const VALUE_ALIASES: Record<string, string> = {
  // Face buttons (Xbox layout, matches Steam Deck labels)
  South: "A",
  East: "B",
  North: "Y",
  West: "X",
  // Shoulders & triggers
  LeftBumper: "LB",
  RightBumper: "RB",
  LeftTrigger: "LT",
  RightTrigger: "RT",
  // Sticks
  LeftStick: "LS",
  RightStick: "RS",
  LeftStickTouch: "LS Touch",
  RightStickTouch: "RS Touch",
  // DPad
  DPadUp: "D-Pad ↑",
  DPadDown: "D-Pad ↓",
  DPadLeft: "D-Pad ←",
  DPadRight: "D-Pad →",
  // Meta
  Start: "Menu ☰",
  Select: "View ⧉",
  Guide: "Home",
  QuickAccess: "QAM ···",
};

export function displayValue(value: string): string {
  const alias = VALUE_ALIASES[value];
  return alias ? `${alias} (${value})` : value;
}

export const EVENT_REGISTRY: EventRegistry = {
  gamepad: {
    label: "Gamepad",
    subTypes: {
      button: {
        label: "Button",
        values: [
          "South",
          "East",
          "North",
          "West",
          "DPadUp",
          "DPadDown",
          "DPadLeft",
          "DPadRight",
          "LeftBumper",
          "RightBumper",
          "LeftTrigger",
          "RightTrigger",
          "LeftStick",
          "RightStick",
          "LeftStickTouch",
          "RightStickTouch",
          "LeftTop",
          "RightTop",
          "LeftPaddle1",
          "LeftPaddle2",
          "LeftPaddle3",
          "RightPaddle1",
          "RightPaddle2",
          "RightPaddle3",
          "Start",
          "Select",
          "Guide",
          "QuickAccess",
          "QuickAccess2",
          "Screenshot",
          "Keyboard",
          "Mute",
        ],
        buildConfig: (value) => ({ gamepad: { button: value } }),
        parseConfig: (config) => config.gamepad?.button,
      },
      axis: {
        label: "Axis",
        values: [
          "LeftStick",
          "RightStick",
          "Hat0",
          "Hat1",
          "Hat2",
          "Hat3",
        ],
        buildConfig: (value) => ({ gamepad: { axis: { name: value } } }),
        parseConfig: (config) => config.gamepad?.axis?.name,
      },
      trigger: {
        label: "Trigger",
        values: [
          "LeftTrigger",
          "RightTrigger",
          "LeftTouchpadForce",
          "LeftStickForce",
          "RightTouchpadForce",
          "RightStickForce",
        ],
        buildConfig: (value) => ({ gamepad: { trigger: { name: value } } }),
        parseConfig: (config) => config.gamepad?.trigger?.name,
      },
      dial: {
        label: "Dial",
        values: ["LeftStickDial", "RightStickDial"],
        buildConfig: (value) => ({ gamepad: { dial: { name: value } } }),
        parseConfig: (config) => config.gamepad?.dial?.name,
      },
    },
  },
  keyboard: {
    label: "Keyboard",
    subTypes: {
      key: {
        label: "Key",
        values: [
          // Letters
          "KeyA", "KeyB", "KeyC", "KeyD", "KeyE", "KeyF", "KeyG",
          "KeyH", "KeyI", "KeyJ", "KeyK", "KeyL", "KeyM", "KeyN",
          "KeyO", "KeyP", "KeyQ", "KeyR", "KeyS", "KeyT", "KeyU",
          "KeyV", "KeyW", "KeyX", "KeyY", "KeyZ",
          // Numbers
          "Key0", "Key1", "Key2", "Key3", "Key4",
          "Key5", "Key6", "Key7", "Key8", "Key9",
          // Function keys
          "KeyF1", "KeyF2", "KeyF3", "KeyF4", "KeyF5", "KeyF6",
          "KeyF7", "KeyF8", "KeyF9", "KeyF10", "KeyF11", "KeyF12",
          "KeyF13", "KeyF14", "KeyF15", "KeyF16", "KeyF17", "KeyF18",
          "KeyF19", "KeyF20", "KeyF21", "KeyF22", "KeyF23", "KeyF24",
          // Modifiers
          "KeyLeftCtrl", "KeyRightCtrl",
          "KeyLeftShift", "KeyRightShift",
          "KeyLeftAlt", "KeyRightAlt",
          "KeyLeftMeta", "KeyRightMeta",
          "KeyCapslock", "KeyNumlock", "KeyScrollLock",
          "KeyCompose",
          // Navigation
          "KeyUp", "KeyDown", "KeyLeft", "KeyRight",
          "KeyHome", "KeyEnd", "KeyPageUp", "KeyPageDown",
          "KeyInsert", "KeyDelete",
          // Editing
          "KeyEsc", "KeyTab", "KeyBackspace", "KeyEnter", "KeySpace",
          "KeySysrq",
          // Punctuation / symbols
          "KeyMinus", "KeyEqual", "KeyLeftBrace", "KeyRightBrace",
          "KeyBackslash", "KeySemicolon", "KeyApostrophe",
          "KeyGrave", "KeyComma", "KeyDot", "KeySlash",
          "Key102nd",
          // Numpad
          "KeyKp0", "KeyKp1", "KeyKp2", "KeyKp3", "KeyKp4",
          "KeyKp5", "KeyKp6", "KeyKp7", "KeyKp8", "KeyKp9",
          "KeyKpAsterisk", "KeyKpComma", "KeyKpDot",
          "KeyKpEnter", "KeyKpEqual", "KeyKpJpComma",
          "KeyKpLeftParen", "KeyKpMinus", "KeyKpPlus",
          "KeyKpRightParen", "KeyKpSlash",
          // Media
          "KeyMute", "KeyVolumeDown", "KeyVolumeUp",
          "KeyBrightnessDown", "KeyBrightnessUp",
          "KeyPlayPause", "KeyNextSong", "KeyPreviousSong",
          "KeyStopCD", "KeyEjectCD", "KeyRecord",
          // System / misc
          "KeyPause", "KeyPower", "KeySleep",
          "KeyBack", "KeyForward", "KeyRefresh", "KeyStop",
          "KeyFind", "KeyHelp", "KeyOpen",
          "KeyCalc", "KeyWww", "KeyFront",
          "KeyEdit", "KeyProps",
          "KeyCopy", "KeyCut", "KeyPaste", "KeyUndo", "KeyAgain",
          "KeyScrollDown", "KeyScrollUp",
          "KeyProg1", "KeyProg2", "KeyProg3", "KeyProg4",
          // Japanese input
          "KeyHenkan", "KeyMuhenkan", "KeyKatakana", "KeyHiragana",
          "KeyKatakanaHiragana", "KeyZenkakuhankaku", "KeyRo", "KeyYen",
          "KeyHanja",
        ],
        buildConfig: (value) => ({ keyboard: value }),
        parseConfig: (config) => config.keyboard,
      },
    },
  },
  mouse: {
    label: "Mouse",
    subTypes: {
      button: {
        label: "Button",
        values: [
          "Left",
          "Right",
          "Middle",
          "WheelUp",
          "WheelDown",
          "WheelLeft",
          "WheelRight",
          "Extra1",
          "Extra2",
        ],
        buildConfig: (value) => ({ mouse: { button: value } }),
        parseConfig: (config) => config.mouse?.button,
      },
      motion: {
        label: "Motion",
        values: [
          "horizontal",
          "vertical",
          "left",
          "right",
          "up",
          "down",
        ],
        buildConfig: (value) => ({
          mouse: { motion: { direction: value } },
        }),
        parseConfig: (config) => config.mouse?.motion?.direction,
      },
    },
  },
};

/**
 * Resolve a CapabilityConfig to a human-readable label and its
 * position in the registry (category, subType, value).
 */
export function describeCapability(config: CapabilityConfig): {
  category: string;
  subType: string;
  value: string;
  label: string;
} | null {
  for (const [catKey, cat] of Object.entries(EVENT_REGISTRY)) {
    for (const [stKey, st] of Object.entries(cat.subTypes)) {
      const val = st.parseConfig(config);
      if (val !== undefined) {
        return {
          category: catKey,
          subType: stKey,
          value: val,
          label: `${cat.label} > ${st.label} > ${val}`,
        };
      }
    }
  }
  // Fallback for unsupported event types
  return null;
}

export function capabilityLabel(config: CapabilityConfig): string {
  return describeCapability(config)?.label ?? JSON.stringify(config);
}

/**
 * Compact label that keeps only the essential value.
 * Gamepad Button "South" → "South", Keyboard "KeyA" → "KeyA",
 * Mouse Button "Left" → "Mouse:Left", Axis "LeftStick" → "Axis:LeftStick"
 */
export function shortCapabilityLabel(config: CapabilityConfig): string {
  const desc = describeCapability(config);
  if (!desc) return JSON.stringify(config);

  const { category, subType, value } = desc;
  const alias = VALUE_ALIASES[value];

  if (category === "gamepad" && subType === "button") return alias ?? value;
  if (category === "keyboard") return value;
  if (category === "mouse" && subType === "button") return `Mouse:${value}`;

  const cat = EVENT_REGISTRY[category];
  const st = cat?.subTypes[subType];
  const short = alias ?? value;
  return `${st?.label ?? subType}:${short}`;
}

const MAX_INLINE_TARGETS = 3;

export function mappingDescription(
  source: CapabilityConfig,
  targets: CapabilityConfig[]
): string {
  const src = shortCapabilityLabel(source);

  if (targets.length === 0) return `${src} → (none)`;

  const shown = targets.slice(0, MAX_INLINE_TARGETS).map(shortCapabilityLabel);
  const rest = targets.length - MAX_INLINE_TARGETS;
  const tgt = rest > 0 ? `${shown.join(" + ")} +${rest} more` : shown.join(" + ");

  return `${src} → ${tgt}`;
}
