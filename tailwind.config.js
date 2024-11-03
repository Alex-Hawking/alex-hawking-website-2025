/** @type {import('tailwindcss').Config} */
import { files } from "$service-worker";
import defaultTheme from "tailwindcss/defaultTheme";

export default {
  content: {
    files: ["./src/**/*.{html,js,svelte,ts}"],
    safelist: [
      {
        pattern: /text-(winter|summer|autumn)-leaf[1-4]/,
      },
      "text-brown",
      "wind-gust",
      "rain-fall",
      "snow-fall",
      "rain-drop",
      "snow-drop",
      "snow-highlight",
      "leaf",
      "tree-fade-in",
      "pulse",
    ],
  },
  theme: {
    fontFamily: {
      mono: ["Roboto Mono", ...defaultTheme.fontFamily.mono],
    },
    colors: {
      black: "#000505",
      bg: "#000D14",
      white: "#FFFFFF",
      yellow: "#FFD23F",
      blue: "#009FFD",
      red: "#F50000",
      brown: "#704E2E",
      orange: "#DD4B1A",
      green: "#51CB20",
      winter: {
        leaf1: "#009FFD",
        leaf2: "#EAF6FF",
        leaf3: "#B1EDE8",
        leaf4: "#A0D9E8",
      },
      autumn: {
        leaf1: "#DD4B1A",
        leaf2: "#FF7700",
        leaf3: "#E55812",
        leaf4: "#D94C1A",
      },
      summer: {
        leaf1: "#14591D",
        leaf2: "#51CB20",
        leaf3: "#32DE8A",
        leaf4: "#28A745",
      },
      background: {
        blue: "#001B29",
        brown: "#1D140C",
        black: "#000505",
      },
    },
    borderWidth: {
      DEFAULT: "0.5px",
    },
    keyframes: {
      windGust: {
        "0%": { transform: "translateX(0)" },
        "50%": { transform: "translateX(var(--wind-distance, 10px))" },
        "100%": { transform: "translateX(0px)" },
      },
      rainFall: {
        "0%": {
          transform: "translateY(0) translateX(0)",
          opacity: "1",
        },
        "100%": {
          transform:
            "translateY(100vh) translateX(calc(var(--wind-power, 0px)))",
          opacity: "0",
        },
      },
      snowFall: {
        "0%": {
          transform: "translateY(0) translateX(0)",
          opacity: "1",
        },
        "100%": {
          transform:
            "translateY(100vh) translateX(calc(var(--wind-power, 0px)))",
          opacity: "0",
        },
      },
      fadeIn: {
        "0%": { opacity: "0" },
        "100%": { opacity: "1" },
      },
      fadeOut: {
        "0%": { opacity: "1" },
        "100%": { opacity: "0" },
      },
      pulse: {
        "0%": { opacity: "1" },
        "50%": { opacity: "0.6" },
        "100%": { opacity: "1" },
      },
      spin: {
        "0%": { transform: "rotate(0deg)" },
        "100%": { transform: "rotate(360deg)" },
      },
      loadIn: {
        "0%": {
          opacity: "0",
          filter: "grayscale(100%)",
        },
        "45%": {
          opacity: "0.1",
          filter: "grayscale(100%)",
        },
        "75%": {
          filter: "grayscale(90%)",
        },
        "100%": {
          opacity: "1",
          filter: "grayscale(0%)",
        },
      },
    },
    animation: {
      "wind-gust": "windGust var(--wind-duration, 0.75s) ease-in-out forwards",
      "rain-fall": "rainFall 3s linear forwards",
      "snow-fall": "snowFall 7s linear forwards",
      "fade-in": "fadeIn 0.5s ease-in-out",
      "site-fade-in": "loadIn 1.5s ease-in",
      "fade-out": "fadeOut 0.5s ease-in-out",
      "tree-fade-in": "fadeIn 0.5s ease forwards",
      pulse: "pulse 5s ease-in-out infinite",
      spin: "spin 1s linear infinite",
    },
  },
  plugins: [],
};
