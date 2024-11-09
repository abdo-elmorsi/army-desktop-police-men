import { app, BrowserWindow, shell, ipcMain, Menu, dialog } from "electron";
import { fileURLToPath } from "node:url";
import path from "node:path";
import os from "node:os";
import DatabaseManager from "./db"; // Import the DatabaseManager class

const __dirname = path.dirname(fileURLToPath(import.meta.url));

process.env.APP_ROOT = path.join(__dirname, "../..");
export const MAIN_DIST = path.join(process.env.APP_ROOT, "dist-electron");
export const RENDERER_DIST = path.join(process.env.APP_ROOT, "dist");
export const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL;
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL
    ? path.join(process.env.APP_ROOT, "public")
    : RENDERER_DIST;

if (os.release().startsWith("6.1")) app.disableHardwareAcceleration();
if (process.platform === "win32") app.setAppUserModelId(app.getName());
if (!app.requestSingleInstanceLock()) {
    app.quit();
    process.exit(0);
}

let win: BrowserWindow | null = null;
const preload = path.join(__dirname, "../preload/index.mjs");
const indexHtml = path.join(RENDERER_DIST, "index.html");
const isProduction = false;

async function createWindow() {
    win = new BrowserWindow({
        title: "سيستم الأفراد",
        icon: path.join(process.env.VITE_PUBLIC, "favicon.ico"),
        fullscreen: false,
        frame: true,
        webPreferences: {
            preload,
            contextIsolation: true,
            nodeIntegration: false,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL);
        win.webContents.openDevTools();
    } else {
        win.loadFile(indexHtml);
    }

    win.webContents.on("did-finish-load", () => {
        win?.webContents.send(
            "main-process-message",
            new Date().toLocaleString()
        );
    });

    win.webContents.setWindowOpenHandler(({ url }) => {
        if (url.startsWith("https:")) shell.openExternal(url);
        return { action: "deny" };
    });
}

function createMenu() {
    if (!isProduction) {
        const menu = Menu.buildFromTemplate([
            {
                label: "Edit",
                submenu: [
                    { role: "undo" },
                    { role: "redo" },
                    { type: "separator" },
                    { role: "cut" },
                    { role: "copy" },
                    { role: "paste" },
                    { role: "selectAll" },
                ],
            },
            {
                label: "View",
                submenu: [
                    { role: "reload" },
                    { role: "toggleDevTools" },
                    { type: "separator" },
                    { role: "resetZoom" },
                    { role: "zoomIn" },
                    { role: "zoomOut" },
                ],
            },
        ]);
        Menu.setApplicationMenu(menu);
    } else {
        Menu.setApplicationMenu(null);
    }
}

app.whenReady().then(() => {
    DatabaseManager.initializeDatabase(); // Initialize the database
    createWindow();
    createMenu();

    // ********************Users********************
    ipcMain.handle("get-users", async () => {
        return DatabaseManager.getUsers();
    });

    ipcMain.handle("add-users", async (_, username, password, role) => {
        return DatabaseManager.addUser(username, password, role);
    });

    ipcMain.handle("update-users", async (_, id, username, password, role) => {
        return DatabaseManager.updateUser(id, username, password, role);
    });

    ipcMain.handle("delete-users", async (_, id) => {
        return DatabaseManager.deleteUser(id);
    });

    // ********************Transactions********************
    ipcMain.handle(
        "get-policemen",
        async (_, searchQuery: string, limit?: number, offset?: number) => {
            return DatabaseManager.getPoliceMen(searchQuery, limit, offset);
        }
    );

    ipcMain.handle("get-policemen-by-id", async (_, policeMenId) => {
        return DatabaseManager.getPoliceManById(policeMenId);
    });

    ipcMain.handle(
        "add-policemen",
        async (
            _,
            username,
            degree,
            policeNo,
            birthDate,
            joinDate,
            address,
            job,
            image,
            description
        ) => {
            return DatabaseManager.addPoliceMan(
                username,
                degree,
                policeNo,
                birthDate,
                joinDate,
                address,
                job,
                image,
                description
            );
        }
    );

    ipcMain.handle(
        "update-policemen",
        async (
            _,
            id,
            username,
            degree,
            policeNo,
            birthDate,
            joinDate,
            address,
            job,
            image,
            description
        ) => {
            return DatabaseManager.updatePoliceMan(
                id,
                username,
                degree,
                policeNo,
                birthDate,
                joinDate,
                address,
                job,
                image,
                description
            );
        }
    );
    ipcMain.handle("delete-policemen", async (_, id) => {
        return DatabaseManager.deletePoliceMan(id);
    });

    ipcMain.handle("show-prompt", async (_, message) => {
        const { response, checkboxChecked } = await dialog.showMessageBox({
            type: "question",
            buttons: ["Cancel", "OK"],
            defaultId: 1,
            title: "تحذير",
            message: message,
        });

        return response === 1
            ? checkboxChecked
                ? "Remembered Value"
                : "OK Value"
            : null;
    });
});

app.on("window-all-closed", () => {
    win = null;
    if (process.platform !== "darwin") app.quit();
});

app.on("second-instance", () => {
    if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
    }
});

app.on("activate", () => {
    const allWindows = BrowserWindow.getAllWindows();
    if (allWindows.length) {
        allWindows[0].focus();
    } else {
        createWindow();
    }
});

ipcMain.handle("open-win", (_, arg) => {
    const childWindow = new BrowserWindow({
        webPreferences: {
            preload,
            contextIsolation: true,
        },
    });

    if (VITE_DEV_SERVER_URL) {
        childWindow.loadURL(`${VITE_DEV_SERVER_URL}#${arg}`);
    } else {
        childWindow.loadFile(indexHtml, { hash: arg });
    }
});

app.on("before-quit", () => {
    DatabaseManager.closeDatabase(); // Close the database
});
