/** Application display name */
export const APP_NAME = "EnVault";

/** Application version */
export const APP_VERSION = "1.0.0";

/** Application tagline */
export const APP_TAGLINE = "Your environment secrets, secured.";

/** Minimum master password length */
export const MIN_PASSWORD_LENGTH = 8;

/** Auto-lock the vault after 5 minutes of inactivity */
export const AUTO_LOCK_MS = 5 * 60 * 1000;

/** Clear copied secrets from clipboard after 30 seconds */
export const CLIPBOARD_CLEAR_MS = 30 * 1000;

/** Cache svgl icon responses for 7 days */
export const SVGL_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

/** svgl API base URL */
export const SVGL_API_URL = "https://api.svgl.app";

/** localStorage key for svgl icon cache */
export const SVGL_CACHE_KEY = "envault:svgl-cache";

/** localStorage key for UI preferences */
export const UI_PREFS_KEY = "envault:ui-prefs";

/** Default sidebar width in pixels */
export const DEFAULT_SIDEBAR_WIDTH = 220;

/** Default project list width in pixels */
export const DEFAULT_LIST_WIDTH = 300;

/** Minimum sidebar width in pixels */
export const MIN_SIDEBAR_WIDTH = 180;

/** Maximum sidebar width in pixels */
export const MAX_SIDEBAR_WIDTH = 320;

/** Minimum project list width in pixels */
export const MIN_LIST_WIDTH = 240;

/** Maximum project list width in pixels */
export const MAX_LIST_WIDTH = 480;

/** Toast auto-dismiss delay in milliseconds */
export const TOAST_DISMISS_MS = 3000;

/** Maximum number of toasts shown at once */
export const MAX_TOASTS = 5;

/** Default environment names created with new projects */
export const DEFAULT_ENVIRONMENTS = ["Development", "Staging", "Production"];

/** Debounce delay for search input in milliseconds */
export const SEARCH_DEBOUNCE_MS = 200;

/** Vault file format version */
export const VAULT_VERSION = 1;
