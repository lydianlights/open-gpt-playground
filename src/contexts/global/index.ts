import { createSignal } from "solid-js";
import {
    decrypt,
    deleteLocalStorage,
    encrypt,
    loadLocalStorage,
    saveLocalStorage,
} from "@/utils/local-storage";
import { isTruthy } from "@/utils/string-helpers";
import { createEffectOn } from "@/utils/solid-helpers";
import { STORAGE } from "@/constants/local-storage";

export const [apiKey, setAPIKey] = createSignal<string>(loadAPIKey());

export const [rememberAPIKey, setRememberAPIKey] = createSignal<boolean>(
    isTruthy(loadLocalStorage(STORAGE.REMEMBER_API_KEY))
);

createEffectOn([apiKey, rememberAPIKey], () => {
    saveLocalStorage(
        STORAGE.REMEMBER_API_KEY,
        rememberAPIKey() ? "true" : "false"
    );
    if (!rememberAPIKey()) {
        deleteLocalStorage(STORAGE.API_KEY);
    } else {
        saveAPIKey(apiKey());
    }
});

function saveAPIKey(apiKey: string) {
    const encoded = apiKey ? encrypt(apiKey) : "";
    saveLocalStorage(STORAGE.API_KEY, encoded);
}

function loadAPIKey(): string {
    const encoded = loadLocalStorage(STORAGE.API_KEY);
    if (!encoded) return "";
    return decrypt(encoded);
}
