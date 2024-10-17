import { Router } from "../src/index"

const router = new Router()

// handles GET requests to /
router.get("/", (req, res) => {
    res.send("Root request")
})

// protects each following request with username and password
router.basicAuth("*", "/**", (user, pass) => {
    return user === "tester" &&
        pass === "changeme"
})

// handles GET requests to /hello
router.get("/hello", (req, res) => {
    res.send("Hello World!")
})

export const server = Bun.serve({
    fetch: router.handle
})

console.info(router.dump(server))