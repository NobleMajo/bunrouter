import { Router } from "../src/index"

const router = new Router()

// handles GET requests to /
router.get("/", (req, res) => {
    res.send("Root request")
})

// handels websocket requests on /ws
router.ws("/ws")

export const server = Bun.serve({
    fetch: router.handle,
    websocket: {
        open: (ws) => {
            console.log(ws.remoteAddress + " - incomming websocket connection")
        },
        message: (ws, msg) => {
            console.log(ws.remoteAddress + " - message: " + msg)
        },
        close: (ws) => {
            console.log(ws.remoteAddress + " - websocket connection closed")
        }
    }
})

console.info(router.dump(server))