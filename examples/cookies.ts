import { Router } from "../src/index"

const router = new Router()

// parses cookies for all methods and paths.
// also auto updates the set and unset cookies response headers
// if there is a change in req.cookies
router.cookies("*", "/**", true)

// sets/overwrites the test cookie
router.get("/on", (req, res) => {
    req.cookies.on = "on-value"
})

// removes the test cookie
router.get("/off", (req, res) => {
    req.cookies.on = undefined
    console.log("after delete: ", req.cookies)
})

// sets/overwrites the set cookie
router.get("/test1", (req, res) => {
    req.cookies.test1 = "test-1-value"
})

// sets/overwrites the set cookie
router.get("/test2", (req, res) => {
    req.cookies.test2 = "test-2-value"
})

// clears all cookies
router.get("/clear", (req, res) => {
    req.cookies = {}
})

// handles GET requests to /** */
router.get("/**", (req, res) => {
    res.send("Cookies: " + JSON.stringify(req.cookies))
})

export const server = Bun.serve({
    fetch: router.handle,
})

console.info(router.dump(server))
