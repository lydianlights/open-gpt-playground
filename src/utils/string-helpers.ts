// https://stackoverflow.com/questions/990904/remove-accents-diacritics-in-a-string-in-javascript
export function normalizeString(str: string): string {
    return str
        .normalize("NFKD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
}

export function isTruthy(str: string): boolean {
    return str.toLowerCase() !== "false" && !!str;
}
