import { Router } from "../src/index"

const router = new Router()

// handles GET requests to /
router.get("/", (req, res) => {
    res.send("Root request")
})

// handles GET requests to /hello
router.get("/hello", (req, res) => {
    res.send("Hello World!")
})

export const server = Bun.serve({
    fetch: router.handle
})

console.info(router.dump(server))