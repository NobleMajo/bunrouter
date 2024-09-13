import { Router } from "../src/index"

const router = new Router()

// handles GET requests to /
router.get("/hello", (req, res) => {
    res.send("Hello World!")
})

// provides static files from ./html on /**
// also works without import.meta.dir
// (but i dont know in which directory you execute this)
router.static("/**", import.meta.dir + "/html")

export const server = Bun.serve({
    fetch: router.handle,
})

console.info(router.dump(server))