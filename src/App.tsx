import type { Component } from "solid-js";
import Main from "@/views/Main";
import { ChatProvider } from "@/contexts/ChatContext";
import { PresetsProvider } from "./contexts/PresetsContext";

const App: Component = () => {
    return (
        <ChatProvider>
            <PresetsProvider>
                <Main />
            </PresetsProvider>
        </ChatProvider>
    );
};

export default App;
