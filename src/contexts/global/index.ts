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

export const LS_KEY = {
    API_KEY: "apiKey",
    REMEMBER_API_KEY: "rememberAPIKey",
};

export const [apiKey, setAPIKey] = createSignal<string>(loadAPIKey());

export const [rememberAPIKey, setRememberAPIKey] = createSignal<boolean>(
    isTruthy(loadLocalStorage(LS_KEY.REMEMBER_API_KEY))
);

createEffectOn([apiKey, rememberAPIKey], () => {
    saveLocalStorage(
        LS_KEY.REMEMBER_API_KEY,
        rememberAPIKey() ? "true" : "false"
    );
    if (!rememberAPIKey()) {
        deleteLocalStorage(LS_KEY.API_KEY);
    } else {
        saveAPIKey(apiKey());
    }
});

function saveAPIKey(apiKey: string) {
    const encoded = apiKey ? encrypt(apiKey) : "";
    saveLocalStorage(LS_KEY.API_KEY, encoded);
}

function loadAPIKey(): string {
    const encoded = loadLocalStorage(LS_KEY.API_KEY);
    if (!encoded) return "";
    return decrypt(encoded);
}
