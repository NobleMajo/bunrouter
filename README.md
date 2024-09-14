
![MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![typescript](https://img.shields.io/badge/dynamic/json?style=plastic&color=blue&label=Typescript&prefix=v&query=peerDependencies.typescript&url=https%3A%2F%2Fraw.githubusercontent.com%2Fnoblemajo%2Fbun-router%2Fmain%2Fpackage.json)
![](https://img.shields.io/badge/dynamic/json?color=green&label=watchers&query=watchers&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2Fbun-router)
![](https://img.shields.io/badge/dynamic/json?color=yellow&label=stars&query=stargazers_count&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2Fbun-router)
![](https://img.shields.io/badge/dynamic/json?color=navy&label=forks&query=forks&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2Fbun-router)
<!-- ![](https://img.shields.io/badge/dynamic/json?color=darkred&label=open%20issues&query=open_issues&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2Fbun-router)
![](https://img.shields.io/badge/dynamic/json?color=orange&label=subscribers&query=subscribers_count&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2Fbun-router) -->

# bun-router

A simple [express](https://expressjs.com/de/starter/hello-world.html)-like router written for [bun.serve()](https://bun.sh/docs/api/http).  
Bun dont has a buildin router, so i created this one and it dont need any dependencies.

Uses the speed of the bun for a simple, known and solid routing experience.

# features

- **non-async-first**: Tries to resolve a request in a non-async way until an async handler is hit.
- **wildcards**: Can handle double wildcards (`**`) as any recursive path and 
  single wildcards (`*`) as any path part. *It also provides a path params string array.*
- **cookie-handling**: Cookie parsing can be enabled via a middleware ([example](https://github.com/NobleMajo/bun-router/blob/main/examples/cookies.ts)).  
  If enabled cookies can also automatically be set/unset to the response headers. 
- **static-serve**: Serves static files via a middleware ([example](https://github.com/NobleMajo/bun-router/blob/main/examples/static-serve.ts)).
- **redirect-handler**: You can redirect via the `ResponseBuilder` or
  via a redirect middleware ([example](https://github.com/NobleMajo/bun-router/blob/main/examples/redirect.ts)).
- **websocket-support**: Can handle websocket request via a middleware ([example](https://github.com/NobleMajo/bun-router/blob/main/examples/websocket.ts)).
- **merged-routes**: If 2 or more routes are defined one after the other with the same method and path,
  they will be merged into a single handler to avoid re-checking.
- **method-enum**: You just write `GET`, but in the background it is converted to an enum.  
  *This is for faster method comparison.*

# how it works

# usage

## install

```sh
bun i github:NobleMajo/bun-router
```

## import 

```ts
import { Router } from "bun-router/src/index";
```

## example

```ts
import { Router } from "bun-router/src/index";

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

# examples

Checkout the bun-router [examples](https://github.com/NobleMajo/bun-router/tree/main/examples):
- [simple example](https://github.com/NobleMajo/bun-router/blob/main/examples/simple.ts)
- [static-serve example](https://github.com/NobleMajo/bun-router/blob/main/examples/static-serve.ts)
- [websocket example](https://github.com/NobleMajo/bun-router/blob/main/examples/websocket.ts)
- [redirect example](https://github.com/NobleMajo/bun-router/blob/main/examples/redirect.ts)
- [cookies example](https://github.com/NobleMajo/bun-router/blob/main/examples/cookies.ts)

# future features
Here are some feature ideas for future development:
- **CORS-support**: Configure CORS headers via a buildin middleware.
- **listen**: Listen function to start the server via the router.
- ****:

# Contributing
Contributions to bun-router are welcome!  
Interested users can refer to the guidelines provided in the [CONTRIBUTING.md](CONTRIBUTING.md) file to contribute to the project and help improve its functionality and features.

# License
bun-router is licensed under the [MIT license](LICENSE), providing users with flexibility and freedom to use and modify the software according to their needs.

# Disclaimer
bun-router is provided without warranties.  
Users are advised to review the accompanying license for more information on the terms of use and limitations of liability.
