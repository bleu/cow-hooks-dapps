/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import("tailwindcss").Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@bleu.builders/ui/dist/**/*",
    "../../node_modules/@bleu.builders/ui/dist/**/*",
    "../../packages/cow-hooks-ui/src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/preline/dist/*.js",
    "../../node_modules/preline/dist/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["studiofeixen", ...defaultTheme.fontFamily.sans],
        serif: ["studiofeixenserif", ...defaultTheme.fontFamily.serif],
        mono: ["studiofeixenmono", ...defaultTheme.fontFamily.mono],
      },
      borderWidth: {
        1: "1px",
      },
      boxShadow: {
        cow: "0px 0px 5px 0.5px rgba(0,0,0,0.01)",
      },
      screens: {
        xsm: "420px",
      },
      fontSize: {
        xxs: "10px"
      },
      colors: {
        // V3
        "color-primary": "rgb(var(--cow-color-primary) / <alpha-value>)",
        "color-primary-lighter":
          "rgb(var(--cow-color-primary-lighter) / <alpha-value>)",
        "color-primary-darker":
          "rgb(var(--cow-color-primary-darker) / <alpha-value>)",
        "color-primary-darkest":
          "rgb(var(--cow-color-primary-darkest) / <alpha-value>)",
        "color-primary-paper":
          "rgb(var(--cow-color-primary-paper) / <alpha-value>)",

        "color-secondary": "rgb(var(--cow-color-secondary) / <alpha-value>)",

        "color-background": "rgb(var(--cow-color-background) / <alpha-value>)",

        "color-paper": "rgb(var(--cow-color-paper) / <alpha-value>)",
        "color-paper-darker":
          "var(--cow-color-paper-darker)",
        "color-paper-darker-hover":
          "rgb(var(--cow-color-paper-darker-hover) / <alpha-value>)",
        "color-paper-darkest":
          "rgb(var(--cow-color-paper-darkest) / <alpha-value>)",

        "box-shadow": "rgb(var(--cow-box-shadow) / <alpha-value>)",
        "box-shadow-2": "rgb(var(--cow-box-shadow-2) / <alpha-value>)",

        "color-text": "rgb(var(--cow-color-text) / <alpha-value>)",
        "color-text-paper": "rgb(var(--cow-color-text-paper) / <alpha-value>)",

        "color-secondary-text":
          "rgb(var(--cow-color-secondary-text) / <alpha-value>)",
        "color-disabled-text":
          "rgb(var(--cow-color-disabled-text) / <alpha-value>)",
        "color-button-text":
          "rgb(var(--cow-color-button-text) / <alpha-value>)",
        "color-button-text-disabled":
          "rgb(var(--cow-color-button-text-disabled) / <alpha-value>)",

        "color-dark-image-paper":
          "rgb(var(--cow-color-dark-image-paper) / <alpha-value>)",
        "color-dark-image-paper-text":
          "rgb(var(--cow-color-dark-image-paper-text) / <alpha-value>)",

        "color-warning": "rgb(var(--cow-color-warning) / <alpha-value>)",
        "color-warning-bg": "rgb(var(--cow-color-warning-bg) / <alpha-value>)",
        "color-warning-text":
          "rgb(var(--cow-color-warning-text) / <alpha-value>)",

        "color-success": "rgb(var(--cow-color-success) / <alpha-value>)",
        "color-success-bg": "rgb(var(--cow-color-success-bg) / <alpha-value>)",
        "color-success-text":
          "rgb(var(--cow-color-success-text) / <alpha-value>)",

        "color-info": "rgb(var(--cow-color-info) / <alpha-value>)",
        "color-info-bg": "rgb(var(--cow-color-info-bg) / <alpha-value>)",
        "color-info-text": "rgb(var(--cow-color-info-text) / <alpha-value>)",

        "color-alert": "rgb(var(--cow-color-alert) / <alpha-value>)",
        "color-alert-bg": "rgb(var(--cow-color-alert-bg) / <alpha-value>)",
        "color-alert-text": "rgb(var(--cow-color-alert-text) / <alpha-value>)",
        "color-alert-text-darker":
          "rgb(var(--cow-color-alert-text-darker) / <alpha-value>)",

        "color-danger": "rgb(var(--cow-color-danger) / <alpha-value>)",
        "color-danger-bg": "rgb(var(--cow-color-danger-bg) / <alpha-value>)",
        "color-danger-text":
          "rgb(var(--cow-color-danger-text) / <alpha-value>)",

        "color-badge-yellow-bg":
          "rgb(var(--cow-color-badge-yellow-bg) / <alpha-value>)",
        "color-badge-yellow-text":
          "rgb(var(--cow-color-badge-yellow-text) / <alpha-value>)",

        "color-white": "rgb(var(--cow-color-white) / <alpha-value>)",
        "color-blue": "rgb(var(--cow-color-blue) / <alpha-value>)",
        "color-yellow-light":
          "rgb(var(--cow-color-yellow-light) / <alpha-value>)",
        "color-green": "rgb(var(--cow-color-green) / <alpha-value>)",
        "color-red": "rgb(var(--cow-color-red) / <alpha-value>)",

        "color-border": "rgb(var(--cow-color-border) / <alpha-value>)",
        "color-container-bg-01":
          "rgb(var(--cow-container-bg-01) / <alpha-value>)",
        "color-container-bg-02":
          "rgb(var(--cow-container-bg-02) / <alpha-value>)",

        "modal-backdrop": "rgb(var(--cow-modal-backdrop) / <alpha-value>)",
        "border-radius-normal":
          "rgb(var(--cow-border-radius-normal) / <alpha-value>)",
        "border-radius-large":
          "rgb(var(--cow-border-radius-large) / <alpha-value>)",
        "padding-normal": "rgb(var(--cow-padding-normal) / <alpha-value>)",

        "icon-color-normal":
          "rgb(var(--cow-icon-color-normal) / <alpha-value>)",

        "color-text1": "rgb(var(--cow-color-text1) / <alpha-value>)",
        "color-text1-inactive":
          "rgb(var(--cow-color-text1-inactive) / <alpha-value>)",
        "color-text2": "rgb(var(--cow-color-text2) / <alpha-value>)",
        "color-link": "rgb(var(--cow-color-link) / <alpha-value>)",

        "animation-duration": "var(--cow-animation-duration)",
        "animation-duration-slow": "var(--cow-animation-duration-slow)",
        success: "rgb(var(--success) / <alpha-value>)",
        info: "rgb(var(--info) / <alpha-value>)",
        warning: "rgb(var(--warning) / <alpha-value>)",
        highlight: "rgb(var(--highlight) / <alpha-value>)",
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--input) / <alpha-value>)",
        ring: "rgb(var(--ring) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "rgb(var(--primary) / <alpha-value>)",
          foreground: "rgb(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive) / <alpha-value>)",
          foreground: "rgb(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "rgb(var(--muted) / <alpha-value>)",
          foreground: "rgb(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          foreground: "rgb(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--popover) / <alpha-value>)",
          foreground: "rgb(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--card) / <alpha-value>)",
          foreground: "rgb(var(--card-foreground) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [require("preline/plugin")],
};
