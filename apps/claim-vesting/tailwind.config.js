/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@bleu/ui/dist/**/*",
    "../../packages/cow-hooks-ui/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // V3
        "color-primary": "var(--cow-color-primary)",
        "color-primary-lighter": "var(--cow-color-primary-lighter)",
        "color-primary-darker": "var(--cow-color-primary-darker)",
        "color-primary-darkest": "var(--cow-color-primary-darkest)",
        "color-primary-paper": "var(--cow-color-primary-paper)",
        "color-primary-opacity-80": "var(--cow-color-primary-opacity-80)",
        "color-primary-opacity-70": "var(--cow-color-primary-opacity-70)",
        "color-primary-opacity-50": "var(--cow-color-primary-opacity-50)",
        "color-primary-opacity-25": "var(--cow-color-primary-opacity-25)",
        "color-primary-opacity-10": "var(--cow-color-primary-opacity-10)",

        "color-secondary": "var(--cow-color-secondary)",

        "color-background": "var(--cow-color-background)",

        "color-paper": "var(--cow-color-paper)",
        "color-paper-opacity-99": "var(--cow-color-paper-opacity-99)",
        "color-paper-darker": "var(--cow-color-paper-darker)",
        "color-paper-darkest": "var(--cow-color-paper-darkest)",

        "box-shadow": "var(--cow-box-shadow)",
        "box-shadow-2": "var(--cow-box-shadow-2)",

        "color-text": "var(--cow-color-text)",
        "color-text-paper": "var(--cow-color-text-paper)",

        "color-text-opacity-70": "var(--cow-color-text-opacity-70)",
        "color-text-opacity-50": "var(--cow-color-text-opacity-50)",
        "color-text-opacity-25": "var(--cow-color-text-opacity-25)",
        "color-text-opacity-10": "var(--cow-color-text-opacity-10)",

        "color-secondary-text": "var(--cow-color-secondary-text)",
        "color-disabled-text": "var(--cow-color-disabled-text)",
        "color-button-text": "var(--cow-color-button-text)",
        "color-button-text-disabled": "var(--cow-color-button-text-disabled)",

        "color-dark-image-paper": "var(--cow-color-dark-image-paper)",
        "color-dark-image-paper-text": "var(--cow-color-dark-image-paper-text)",

        "color-warning": "var(--cow-color-warning)",
        "color-warning-bg": "var(--cow-color-warning-bg)",
        "color-warning-text": "var(--cow-color-warning-text)",

        "color-success": "var(--cow-color-success)",
        "color-success-bg": "var(--cow-color-success-bg)",
        "color-success-text": "var(--cow-color-success-text)",

        "color-info": "var(--cow-color-info)",
        "color-info-bg": "var(--cow-color-info-bg)",
        "color-info-text": "var(--cow-color-info-text)",

        "color-alert": "var(--cow-color-alert)",
        "color-alert-bg": "var(--cow-color-alert-bg)",
        "color-alert-text": "var(--cow-color-alert-text)",
        "color-alert-text-darker": "var(--cow-color-alert-text-darker)",

        "color-danger": "var(--cow-color-danger)",
        "color-danger-bg": "var(--cow-color-danger-bg)",
        "color-danger-text": "var(--cow-color-danger-text)",

        // ================================================================================

        // Badge
        "color-badge-yellow-bg": "var(--cow-color-badge-yellow-bg)",
        "color-badge-yellow-text": "var(--cow-color-badge-yellow-text)",

        // Colors
        "color-white": "var(--cow-color-white)",
        "color-blue": "var(--cow-color-blue)",
        "color-light-blue-opacity-90": "var(--cow-color-lightBlue-opacity-90)",
        "color-light-blue-opacity-80": "var(--cow-color-lightBlue-opacity-80)",
        "color-yellow-light": "var(--cow-color-yellow-light)",
        "color-green": "var(--cow-color-green)",
        "color-red": "var(--cow-color-red)",

        // Elements
        "color-border": "var(--cow-color-border)",
        "color-container-bg-01": "var(--cow-container-bg-01)",
        "color-container-bg-02": "var(--cow-container-bg-02)",

        // Misc
        "modal-backdrop": "var(--cow-modal-backdrop)",
        "border-radius-normal": "var(--cow-border-radius-normal)",
        "border-radius-large": "var(--cow-border-radius-large)",
        "padding-normal": "var(--cow-padding-normal)",

        // Icons
        "icon-size-normal": "var(--cow-icon-size-normal)",
        "icon-size-small": "var(--cow-icon-size-small)",
        "icon-size-xsmall": "var(--cow-icon-size-xsmall)",
        "icon-size-tiny": "var(--cow-icon-size-tiny)",
        "icon-size-large": "var(--cow-icon-size-large)",
        "icon-color-normal": "var(--cow-icon-color-normal)",

        // States

        // Text
        "color-text1": "var(--cow-color-text1)",
        "color-text1-inactive": "var(--cow-color-text1-inactive)",
        "color-text1-opacity-25": "var(--cow-color-text1-opacity-25)",
        "color-text1-opacity-10": "var(--cow-color-text1-opacity-10)",
        "color-text2": "var(--cow-color-text2)",
        "color-link": "var(--cow-color-link)",
        "color-link-opacity-10": "var(--cow-color-link-opacity-10)",
        "font-weight-normal": "var(--cow-font-weight-normal)",
        "font-weight-medium": "var(--cow-font-weight-medium)",
        "font-weight-bold": "var(--cow-font-weight-bold)",
        "font-size-smaller": "var(--cow-font-size-smaller)",
        "font-size-small": "var(--cow-font-size-small)",
        "font-size-normal": "var(--cow-font-size-normal)",
        "font-size-medium": "var(--cow-font-size-medium)",
        "font-size-large": "var(--cow-font-size-large)",
        "font-size-larger": "var(--cow-font-size-larger)",
        "font-size-largest": "var(--cow-font-size-largest)",

        // Animation
        "animation-duration": "var(--cow-animation-duration)",
        "animation-duration-slow": "var(--cow-animation-duration-slow)",
      },
    },
  },
  plugins: [],
};
