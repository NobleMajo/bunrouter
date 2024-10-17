import { Router } from "../src/index"

const router = new Router()

// handles GET requests to /
router.get("/", (req, res) => {
    res.send("Root request")
})

// redirects / to /hello
router.redirect("*", "/hello", "/")

// redirects /google to https://google.com
router.redirect("*", "/google", "https://google.com")

export const server = Bun.serve({
    fetch: router.handle,
})

console.info(router.dump(server))
