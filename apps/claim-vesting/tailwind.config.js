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

        "color-secondary": "var(--cow-color-secondary)",

        "color-background": "var(--cow-color-background)",

        "color-paper": "var(--cow-color-paper)",
        "color-paper-darker": "var(--cow-color-paper-darker)",
        "color-paper-darkest": "var(--cow-color-paper-darkest)",

        "box-shadow": "var(--cow-box-shadow)",
        "box-shadow-2": "var(--cow-box-shadow-2)",

        "color-text": "var(--cow-color-text)",
        "color-text-paper": "var(--cow-color-text-paper)",

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
        "icon-color-normal": "var(--cow-icon-color-normal)",

        // States

        // Text
        "color-text1": "var(--cow-color-text1)",
        "color-text1-inactive": "var(--cow-color-text1-inactive)",
        "color-text2": "var(--cow-color-text2)",
        "color-link": "var(--cow-color-link)",

        // Animation
        "animation-duration": "var(--cow-animation-duration)",
        "animation-duration-slow": "var(--cow-animation-duration-slow)",
      },
      fontFamily: {
        "inter-sans": '"Inter var", sans-serif',
      },
      screens: {
        xsm: "420px",
      },
    },
  },
  plugins: [],
};
