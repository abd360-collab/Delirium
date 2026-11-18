
import { io } from "socket.io-client";
import { getAccessToken } from "../auth/token-store";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

if (!apiBaseUrl) {
    throw new Error("VITE_API_BASE_URL is not configured");
}

const socketUrl = new URL(apiBaseUrl);

socketUrl.pathname = "";
socketUrl.search = "";
socketUrl.hash = "";

export const socket = io(socketUrl.origin, {
    autoConnect: false,
    auth: (callback) => {
        callback({
            token: getAccessToken(),
        });
    },
    withCredentials: true,
});
