import type { Component } from "solid-js";
import Main from "@/views/Main";
import { ChatProvider } from "@/contexts/ChatContext";

const App: Component = () => {
    return (
        <ChatProvider>
            <Main />
        </ChatProvider>
    );
};

export default App;
