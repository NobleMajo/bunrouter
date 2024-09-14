
![MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![typescript](https://img.shields.io/badge/dynamic/json?style=plastic&color=blue&label=Typescript&prefix=v&query=devDependencies.typescript&url=https%3A%2F%2Fraw.githubusercontent.com%2Fnoblemajo%2FBunRouter%2Fmain%2Fpackage.json)
![](https://img.shields.io/badge/dynamic/json?color=green&label=watchers&query=watchers&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2FBunRouter)
![](https://img.shields.io/badge/dynamic/json?color=yellow&label=stars&query=stargazers_count&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2FBunRouter)
![](https://img.shields.io/badge/dynamic/json?color=navy&label=forks&query=forks&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2FBunRouter)
<!-- ![](https://img.shields.io/badge/dynamic/json?color=darkred&label=open%20issues&query=open_issues&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2FBunRouter)
![](https://img.shields.io/badge/dynamic/json?color=orange&label=subscribers&query=subscribers_count&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2FBunRouter) -->

# bunrouter

A simple [express](https://expressjs.com/de/starter/hello-world.html)-like router written for [bun.serve()](https://bun.sh/docs/api/http).  
Bun dont has a buildin router, so use this.

Uses the speed of the bun for simple, known and solid routing experience.

# Features

- **non-async-first**: Tries to resolve a request in a non-async way until an async handler is hit.
- **merged-routes**: If 2 or more routes are defined one after the other with the same method and path,
  they will be merged into a single handler to avoid re-checking.
- **method-enum**: You just write `GET`, but in the background it is converted to an enum.  
  *This is for faster method comparison.*
- **cookie-handling**: Cookie parsing can be enabled via a middleware.  
  If enabled cookies can also automatically be set/unset to the response headers. 
- **static-serve**: Serves static files via a middleware.
- **redirect-handler**: You can redirect via the `ResponseBuilder` or
  via a redirect middleware.
- **websocket-support**: Can handle websocket request via a middleware.
- **wildcards**: Can handle double wildcards (`**`) as any recursive path and 
  single wildcards (`*`) as any path part. *It also provides a path params string array.*

# Install

```sh
bun i github:NobleMajo/BunRouter
```

# Import 

```ts
import { Router } from "bunrouter/src/index";
```

# Usage

```ts
import { Router } from "bunrouter/src/index";

const router = new Router()

// handles GET requests to /
router.get("/", (req, res) => {
    res.send("Root request")
})

export const server = Bun.serve({
    fetch: router.handle,
})

console.info(router.dump(server))
```

# Examples

Checkout the bunrouter [examples](https://github.com/NobleMajo/BunRouter/tree/main/examples).

# Future
Here are some feature ideas for future development:
- ****

# Contributing
Contributions to bunrouter are welcome!  
Interested users can refer to the guidelines provided in the [CONTRIBUTING.md](CONTRIBUTING.md) file to contribute to the project and help improve its functionality and features.

# License
bunrouter is licensed under the [MIT license](LICENSE), providing users with flexibility and freedom to use and modify the software according to their needs.

# Disclaimer
bunrouter is provided without warranties.  
Users are advised to review the accompanying license for more information on the terms of use and limitations of liability.
