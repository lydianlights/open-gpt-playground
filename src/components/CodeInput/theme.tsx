import { EditorView } from "@codemirror/view";
import { Extension } from "@codemirror/state";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// https://github.com/dennis84/codemirror-themes/blob/main/theme/solarized-light.ts
export const config = {
    name: "customized",
    dark: false,
    background: "#ffffff",
    foreground: "currentColor",
    gutterBackground: "#e9e9e9",
    gutterForeground: "currentColor",
    selection: "#c9ddf7",
    cursor: "#657b83",
    dropdownBackground: "#ffffff",
    dropdownBorder: "#c5c5c5",
    activeLine: "#f0f0f0",
    matchingBracket: "#f0f0f0",
    keyword: "#859900",
    storage: "#354207",
    variable: "#657b83",
    parameter: "#657b83",
    function: "#268BD2",
    string: "#2AA198",
    constant: "#CB4B16",
    type: "#b58900",
    class: "#268BD2",
    number: "#D33682",
    comment: "#93A1A1",
    heading: "#268BD2",
    invalid: "currentColor",
    regexp: "#D30102",
};

export const customizedTheme = EditorView.theme(
    {
        "&": {
            color: config.foreground,
            backgroundColor: config.background,
        },

        "&.cm-editor.cm-focused": {
            outline: "none",
        },

        ".cm-content": { caretColor: config.cursor },

        ".cm-cursor, .cm-dropCursor": { borderLeftColor: config.cursor },
        "&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
            { backgroundColor: config.selection },

        ".cm-panels": {
            backgroundColor: config.dropdownBackground,
            color: config.foreground,
        },
        ".cm-panels.cm-panels-top": { borderBottom: "2px solid black" },
        ".cm-panels.cm-panels-bottom": { borderTop: "2px solid black" },

        ".cm-searchMatch": {
            backgroundColor: config.dropdownBackground,
            outline: `1px solid ${config.dropdownBorder}`,
        },
        ".cm-searchMatch.cm-searchMatch-selected": {
            backgroundColor: config.selection,
        },

        ".cm-activeLine": { backgroundColor: config.activeLine },
        ".cm-selectionMatch": { backgroundColor: config.selection },

        "&.cm-focused .cm-matchingBracket, &.cm-focused .cm-nonmatchingBracket":
            {
                backgroundColor: config.matchingBracket,
                outline: "none",
            },

        ".cm-gutters": {
            backgroundColor: config.gutterBackground,
            color: config.gutterForeground,
            border: "none",
        },
        ".cm-activeLineGutter": { backgroundColor: config.activeLine },

        ".cm-foldPlaceholder": {
            backgroundColor: "transparent",
            border: "none",
            color: config.foreground,
        },
        ".cm-tooltip": {
            border: `1px solid ${config.dropdownBorder}`,
            backgroundColor: config.dropdownBackground,
            color: config.foreground,
        },
        ".cm-tooltip .cm-tooltip-arrow:before": {
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
        },
        ".cm-tooltip .cm-tooltip-arrow:after": {
            borderTopColor: config.foreground,
            borderBottomColor: config.foreground,
        },
        ".cm-tooltip-autocomplete": {
            "& > ul > li[aria-selected]": {
                background: config.selection,
                color: config.foreground,
            },
        },
    },
    { dark: config.dark }
);

export const customizedHighlightStyle = HighlightStyle.define([
    { tag: t.keyword, color: config.keyword },
    {
        tag: [t.name, t.deleted, t.character, t.macroName],
        color: config.variable,
    },
    { tag: [t.propertyName], color: config.function },
    {
        tag: [
            t.processingInstruction,
            t.string,
            t.inserted,
            t.special(t.string),
        ],
        color: config.string,
    },
    { tag: [t.function(t.variableName), t.labelName], color: config.function },
    {
        tag: [t.color, t.constant(t.name), t.standard(t.name)],
        color: config.constant,
    },
    { tag: [t.definition(t.name), t.separator], color: config.variable },
    { tag: [t.className], color: config.class },
    {
        tag: [
            t.number,
            t.changed,
            t.annotation,
            t.modifier,
            t.self,
            t.namespace,
        ],
        color: config.number,
    },
    { tag: [t.typeName], color: config.type, fontStyle: config.type },
    { tag: [t.operator, t.operatorKeyword], color: config.keyword },
    { tag: [t.url, t.escape, t.regexp, t.link], color: config.regexp },
    { tag: [t.meta, t.comment], color: config.comment },
    { tag: t.strong, fontWeight: "bold" },
    { tag: t.emphasis, fontStyle: "italic" },
    { tag: t.link, textDecoration: "underline" },
    { tag: t.heading, fontWeight: "bold", color: config.heading },
    {
        tag: [t.atom, t.bool, t.special(t.variableName)],
        color: config.variable,
    },
    { tag: t.invalid, color: config.invalid },
    { tag: t.strikethrough, textDecoration: "line-through" },
]);

export const customized: Extension = [
    customizedTheme,
    syntaxHighlighting(customizedHighlightStyle),
];
