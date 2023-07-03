import type { Component } from "solid-js";
import SiteHeader from "@/views/SiteHeader";
import ChatSection from "@/views/ChatSection";
import FunctionSection from "@/views/FunctionSection";
import SettingsSection from "@/views/SettingsSection";
import SystemSection from "@/views/SystemSection";

const Main: Component = () => {
    return (
        <div class="w-screen h-screen bg-grey-0 text-black flex flex-col">
            <SiteHeader />
            <div class="p-6 flex-1 overflow-auto flex justify-between gap-6 h-full">
                <div class="flex flex-col gap-6 flex-1 flex-grow-[1]">
                    <div class="flex-1 min-h-[12rem]">
                        <SystemSection />
                    </div>
                    <div class="flex-none">
                        <FunctionSection />
                    </div>
                </div>
                <div class="flex-1 flex-grow-[2]">
                    <ChatSection />
                </div>
                <div class="flex-initial w-52">
                    <SettingsSection />
                </div>
            </div>
        </div>
    );
};

export default Main;
