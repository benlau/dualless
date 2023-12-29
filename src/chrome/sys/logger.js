const ENABLED = true;
const MAX_LINES = 50;

let logs = [];

export function getLog() {
    return logs.join("\n");
}

export async function clearLog() {
    logs = [];
}

function write(message) {
    const timestamp = new Date().toLocaleString();
    logs.unshift(`${timestamp}: ${message}`);

    if (logs.length > MAX_LINES) {
        logs.splice(MAX_LINES, logs.length - MAX_LINES);
    }
}

export function log(message) {
    if (!ENABLED) {
        return;
    }
    console.log(message);
    write(message);
}

export function error(message) {
    console.error(message)
    write(message);
}