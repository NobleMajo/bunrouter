import { Router } from "../src/index"

const router = new Router()

// handles GET requests to /
router.get("/", (req, res) => {
    res.send("Root request")
})

// needs one path param
// try: /one/hello
// try: /one (404)
router.get("/one/*", (req, res) => {
    res.send("one params: " + JSON.stringify(req.pathParams))
})

// needs two path param
// try: /two/hello/world
// try: /two/hello (404)
router.get("/two/*/*", (req, res) => {
    res.send("two params: " + JSON.stringify(req.pathParams))
})

// allows zero to unlimited path params
// try: /multi/hello/world/my/good/friend
// try: /multi (200)
router.get("/multi/**", (req, res) => {
    res.send("multi params: " + JSON.stringify(req.pathParams))
})

// allows minimum 2 to unlimited path params
// try: /mintwo/hello/world/my/good/friend
// try: /mintwo/hello/world/my/good
// try: /mintwo/hello/world/my
// try: /mintwo/hello/world
// try: /mintwo/hello (404)
router.get("/mintwo/*/*/**", (req, res) => {
    res.send("multi params: " + JSON.stringify(req.pathParams))
})

export const server = Bun.serve({
    fetch: router.handle
})

console.info(router.dump(server))