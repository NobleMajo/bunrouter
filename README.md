
![MIT](https://img.shields.io/badge/license-MIT-blue.svg)
![typescript](https://img.shields.io/badge/dynamic/json?style=plastic&color=blue&label=Typescript&prefix=v&query=peerDependencies.typescript&url=https%3A%2F%2Fraw.githubusercontent.com%2Fnoblemajo%2Fbunrouter%2Fmain%2Fpackage.json)
![](https://img.shields.io/badge/dynamic/json?color=green&label=watchers&query=watchers&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2Fbunrouter)
![](https://img.shields.io/badge/dynamic/json?color=yellow&label=stars&query=stargazers_count&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2Fbunrouter)
![](https://img.shields.io/badge/dynamic/json?color=navy&label=forks&query=forks&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2Fbunrouter)
<!-- ![](https://img.shields.io/badge/dynamic/json?color=darkred&label=open%20issues&query=open_issues&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2Fbunrouter)
![](https://img.shields.io/badge/dynamic/json?color=orange&label=subscribers&query=subscribers_count&suffix=x&url=https%3A%2F%2Fapi.github.com%2Frepos%2Fnoblemajo%2Fbunrouter) -->

# bunrouter

A fast express-like router written for the bun.serve http server.
Uses the bun.js high-performance [bun.serve()](https://bun.sh/docs/api/http) http server for a fast, familiar and solid routing experience.

Bun does not have a built-in router, so I created this one without any runtime dependencie.

# features

- **non-async-first**: Tries to resolve a request in a non-async way until an async handler is hit.
- **wildcards**: Can handle double wildcards (`**`) as any recursive path and 
  single wildcards (`*`) as any path part. *It also provides a path params string array.*
- **cookie-handling**: Cookie parsing can be enabled via a middleware ([example](https://github.com/NobleMajo/bunrouter/blob/main/examples/cookies.ts)).  
  If enabled cookies can also automatically be set/unset to the response headers. 
- **static-serve**: Serves static files via a middleware ([example](https://github.com/NobleMajo/bunrouter/blob/main/examples/static-serve.ts)).
- **redirect-handler**: You can redirect via the `ResponseBuilder` or
<<<<<<< Updated upstream
  via a redirect middleware ([example](https://github.com/NobleMajo/bunrouter/blob/main/examples/redirect.ts)).
- **websocket-support**: Can handle websocket request via a middleware ([example](https://github.com/NobleMajo/bunrouter/blob/main/examples/websocket.ts)).
=======
  via a redirect middleware ([example](https://github.com/NobleMajo/bun-router/blob/main/examples/redirect.ts)).
- **websocket-support**: Can handle websocket request via a middleware ([example](https://github.com/NobleMajo/bun-router/blob/main/examples/websocket.ts)).
- **basic-auth**: Protects the following via http basic auth ([example](https://github.com/NobleMajo/bun-router/blob/main/examples/basic-auth.ts)).
>>>>>>> Stashed changes
- **merged-routes**: If 2 or more routes are defined one after the other with the same method and path,
  they will be merged into a single handler to avoid re-checking.
- **method-enum**: You just write `GET`, but in the background it is converted to an enum.  
  *This is for faster method comparison.*
- **dump-router**: You can create a string router dump that lists the defined routes.
  If you provide a bun server, it also adds a `server-is-running-on` message.

# how it works

# usage

## install

```sh
bun i github:NobleMajo/bunrouter
```

## import 

```ts
import { Router } from "bunrouter/src/index";
```

## example

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

// dumps router routes and server-is-running-on message
console.info(router.dump(server))
```

# examples

<<<<<<< Updated upstream
Checkout the bunrouter [examples](https://github.com/NobleMajo/bunrouter/tree/main/examples):
- [simple example](https://github.com/NobleMajo/bunrouter/blob/main/examples/simple.ts)
- [static-serve example](https://github.com/NobleMajo/bunrouter/blob/main/examples/static-serve.ts)
- [websocket example](https://github.com/NobleMajo/bunrouter/blob/main/examples/websocket.ts)
- [redirect example](https://github.com/NobleMajo/bunrouter/blob/main/examples/redirect.ts)
- [cookies example](https://github.com/NobleMajo/bunrouter/blob/main/examples/cookies.ts)
=======
Checkout the bun-router [examples](https://github.com/NobleMajo/bun-router/tree/main/examples):
- [simple example](https://github.com/NobleMajo/bun-router/blob/main/examples/simple.ts)
- [static-serve example](https://github.com/NobleMajo/bun-router/blob/main/examples/static-serve.ts)
- [websocket example](https://github.com/NobleMajo/bun-router/blob/main/examples/websocket.ts)
- [redirect example](https://github.com/NobleMajo/bun-router/blob/main/examples/redirect.ts)
- [cookies example](https://github.com/NobleMajo/bun-router/blob/main/examples/cookies.ts)
- [basic auth example](https://github.com/NobleMajo/bun-router/blob/main/examples/basic-auth.ts)
>>>>>>> Stashed changes

Run a example:
```sh
git clone https://github.com/NobleMajo/bunrouter.git

bun run examples/simple.ts
```

# tests

The router has build-in tests.

```ts
bun test
```

# future features
Here are some feature ideas for future development:
- **CORS-support**: Configure CORS headers via a buildin middleware.
- **router.serve**: Serve/listen function to start the server via the router (first parameter should be the bun.serve options without fetch).
- **websocket**: Better websocket support with more origin request infos.

# Contributing
Contributions to this project are welcome!  
Interested users can refer to the guidelines provided in the [CONTRIBUTING.md](CONTRIBUTING.md) file to contribute to the project and help improve its functionality and features.

# License
This project is licensed under the [MIT license](LICENSE), providing users with flexibility and freedom to use and modify the software according to their needs.

# Disclaimer
This project is provided without warranties.  
Users are advised to review the accompanying license for more information on the terms of use and limitations of liability.
