/* eslint-disable @typescript-eslint/no-unused-vars */
const OFF = 0;
const WARN = 1;
const ERROR = 2;

module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    parser: "@typescript-eslint/parser",
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    plugins: ["@typescript-eslint", "solid", "prettier"],
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:solid/typescript",
        "prettier",
    ],
    overrides: [
        {
            env: {
                node: true,
            },
            files: [".eslintrc.js", ".prettier.js", "postcss.config.js"],
            parserOptions: {
                sourceType: "script",
            },
        },
    ],
    rules: {
        "prettier/prettier": ERROR,
        "@typescript-eslint/no-non-null-assertion": OFF,
        "@typescript-eslint/no-explicit-any": OFF,
        "@typescript-eslint/ban-types": [
            ERROR,
            {
                extendDefaults: true,
                types: {
                    "{}": false,
                },
            },
        ],
        "@typescript-eslint/consistent-type-imports": [
            ERROR,
            {
                prefer: "type-imports",
                disallowTypeAnnotations: true,
                fixStyle: "separate-type-imports",
            },
        ],
    },
};
