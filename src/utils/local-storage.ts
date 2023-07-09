import { AES, enc } from "crypto-js";

export function saveLocalStorage(key: string, value: string): void {
    try {
        window.localStorage.setItem(key, value);
    } catch (e) {
        console.error(e);
    }
}

export function loadLocalStorage(key: string, fallback = ""): string {
    try {
        return window.localStorage.getItem(key) ?? fallback;
    } catch (e) {
        console.error(e);
    }
    return fallback;
}

export function deleteLocalStorage(key: string): void {
    try {
        window.localStorage.removeItem(key);
    } catch (e) {
        console.error(e);
    }
}

export function saveSessionStorage(key: string, value: string): void {
    try {
        window.sessionStorage.setItem(key, value);
    } catch (e) {
        console.error(e);
    }
}

export function loadSessionStorage(key: string, fallback = ""): string {
    try {
        return window.sessionStorage.getItem(key) ?? fallback;
    } catch (e) {
        console.error(e);
    }
    return fallback;
}

export function deleteSessionStorage(key: string): void {
    try {
        window.sessionStorage.removeItem(key);
    } catch (e) {
        console.error(e);
    }
}

export function encrypt(plaintext: string): string {
    return AES.encrypt(
        plaintext,
        "This is not cryptographically secure."
    ).toString();
}

export function decrypt(ciphertext: string): string {
    return AES.decrypt(
        ciphertext,
        "This is not cryptographically secure."
    ).toString(enc.Utf8);
}
