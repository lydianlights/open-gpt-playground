import type { Config } from "tailwindcss";
import colors from "tailwindcss/colors";
import plugin from "tailwindcss/plugin";

const config: Config = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx,css,md,mdx,html,json,scss}",
    ],
    darkMode: "class",
    theme: {
        extend: {},
        colors: {
            transparent: "transparent",
            current: "currentColor",
            black: "#222",
            white: "#fff",
            grey: {
                0: "#fdfdfd",
                ...colors.zinc,
            },
            primary: {
                light: "#19c37d",
                DEFAULT: "#10a37f",
                dark: "#1a7f64",
            },
            danger: {
                light: colors.red[500],
                DEFAULT: colors.red[600],
                dark: colors.red[700],
            },
        },
    },
    plugins: [
        plugin(function ({ addVariant }) {
            addVariant("hocus", ["&:hover", "&:focus"]);
            addVariant("hocus-within", ["&:hover", "&:focus-within"]);
            addVariant("hocus-visible", ["&:hover", "&:focus-visible"]);
        }),
    ],
};

export default config;
