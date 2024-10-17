import { type Server, type SocketAddress } from "bun"
import { statSync } from "fs"
import { join } from "path"
import type { BodyInit, Request as BunRequest } from "undici-types"

export type Awaitable<T> = T | Promise<T>
export type SplitPath = [string, ...string[]] | undefined

export type HttpMethodString = "GET" | "HEAD" | "POST" | "PUT" | "DELETE" | "CONNECT" | "OPTIONS" | "TRACE" | "PATCH"

enum HttpMethod {
    ALL = 1,
    GET,
    PUT,
    POST,
    PATCH,
    DELETE,
    HEAD,
    OPTIONS,
    TRACE,
    CONNECT,
    UNKNOWN,
}

export function parseHttpMethods(method: string): HttpMethod {
    switch (method) {
        case "*":
            return HttpMethod.ALL
        case "GET":
            return HttpMethod.GET
        case "PUT":
            return HttpMethod.PUT
        case "POST":
            return HttpMethod.POST
        case "PATCH":
            return HttpMethod.PATCH
        case "DELETE":
            return HttpMethod.DELETE
        case "HEAD":
            return HttpMethod.HEAD
        case "OPTIONS":
            return HttpMethod.OPTIONS
        case "TRACE":
            return HttpMethod.TRACE
        case "CONNECT":
            return HttpMethod.CONNECT
        default:
            return HttpMethod.UNKNOWN
    }
}

export function stringifyHttpMethods(method: HttpMethod | undefined): string {
    switch (method) {
        case HttpMethod.ALL:
            return "ALL"
        case HttpMethod.GET:
            return "GET"
        case HttpMethod.PUT:
            return "PUT"
        case HttpMethod.POST:
            return "POST"
        case HttpMethod.PATCH:
            return "PATCH"
        case HttpMethod.DELETE:
            return "DELETE"
        case HttpMethod.HEAD:
            return "HEAD"
        case HttpMethod.OPTIONS:
            return "OPTIONS"
        case HttpMethod.TRACE:
            return "TRACE"
        case HttpMethod.CONNECT:
            return "CONNECT"
        case undefined:
            return "ALL"
        default:
            return "UNKNOWN"
    }
}

export type Request = BunRequest & {

    /**
     * `req.pathParams` is the path parameters of the request.
     * If a wildcard is used in the endpoint route,
     * then it is available in a `Router` handled request.
     */
    pathParams?: string[],
    /**
     * `req.httpMethod` is the HttpMethod enum value of the reuqest method used for routing.
     * It is always available in a `Router` handled request.
     */
    httpMethod: HttpMethod,
    /**
     * `req.path` is the path of the request.
     * It is always available in a `Router` handled request.
     */
    path: string,
    /**
     * `req.splitPath` is the splitted path of the request used for routing.
     * It is always available in a `Router` handled request.
     */
    splitPath: SplitPath,
    /**
     * `req.server` is the server that is handling the request.
     * It is always available in a `Router` handled request.
     */
    server: Server,
    /**
     * `req.sock` is the socket address of the request.
     * It is always available in a `Router` handled request.
     */
    sock: SocketAddress,
    /**
     * `req.originCookies` is not to use in your code.
     * It holds the origin cookies state of the request.
     */
    originCookies: unknown,
    /**
     * `req.cookies` is a key value map of all the cookies in the request if parsed earlier.
     * Gets loaded via the `Router.storeCookies(req, res)` function.
     */
    cookies: {
        [key: string]: string | undefined,
    },
    /**
     * `req.rid` is set to true if the request has been upgraded to a websocket.
     */
    upgraded?: true
}

export type BunRequestHandler = (request: Request, server: Server) => Awaitable<Response>

export type RequestMiddleware = (req: Request, res: ResponseBuilder) => Awaitable<void>

export type MergedRequestMiddleware = RequestMiddleware & {
    base: RequestMiddleware[],
}

export interface EndpointRoute {
    handler: RequestMiddleware,
    method: HttpMethod,
    splitPath: SplitPath,
}

export interface CookieOptions {
    MaxAge?: number
    Path?: string
    HttpOnly?: boolean
    Secure?: boolean
    SameSite?: 'Strict' | 'Lax' | 'None'
}

export const notFoundResponse = new Response(
    "Not Found",
    {
        status: 404,
        statusText: "Not Found",
    }
)

export class ResponseBuilder {
    submit: boolean = false
    statusCode: number = 200
    statusText?: string
    bodyInit?: BodyInit
    headers: [string, string][] = []

    beforeSentHooks: ((res: ResponseBuilder) => Awaitable<void>)[] | undefined

    /**
     * Adds a hook that will be called before the response is build for sending
     * @param hook The hook to add
     * @returns The ResponseBuilder instance
     */
    beforeSent(
        hook: (res: ResponseBuilder) => Awaitable<void>
    ): ResponseBuilder {
        if (!this.beforeSentHooks) {
            this.beforeSentHooks = []
        }
        this.beforeSentHooks.push(hook)
        return this
    }

    /**
     * Starts the before sent hooks in order and waits for them all to finish
     * @param p The promise to wait for before starting the hooks
     */
    private async startBeforeSentHookAsync(p: Promise<void>) {
        await p

        let hook = this.beforeSentHooks?.shift()
        while (hook != undefined) {
            const p = hook(this)
            if (
                p &&
                p.then != undefined
            ) {
                await p
            }
        }
    }

    /**
     * Starts the before sent hooks in order and waits for them all to finish
     * @returns A promise that resolves when all the hooks have finished
     */
    startBeforeSentHook(): Awaitable<void> {
        if (this.beforeSentHooks) {
            let hook = this.beforeSentHooks.pop()
            while (hook != undefined) {
                const p = hook(this)
                if (
                    p &&
                    p.then != undefined
                ) {
                    return this.startBeforeSentHookAsync(p)
                }

                hook = this.beforeSentHooks.pop()
            }
        }
    }

    /**
     * Builds the bun response object
     * @returns The final response object
     */
    build(): Response {
        return new Response(
            this.bodyInit,
            {
                status: this.statusCode,
                statusText: this.statusText,
                headers: this.headers,
            }
        )
    }

    /**
     * Resets the response builder to its default state, clearing all options and properties.
     * @returns The response builder instance
     */
    reset(): ResponseBuilder {
        this.submit = false
        this.statusCode = 200
        this.statusText = undefined
        this.bodyInit = undefined
        this.headers = []
        return this
    }

    /**
     * Sets the status code and optional status text of the response.
     * @param statusCode The status code
     * @param statusText The status text, if provided
     * @returns The response builder instance
     */
    status(statusCode: number, statusText?: string): ResponseBuilder {
        this.statusCode = statusCode
        if (statusText) {
            this.statusText = statusText
        }
        return this
    }

    /**
     * Removes the given header from the response.
     * @param name The name of the header to remove
     * @returns The response builder instance
     */
    unsetHeader(name: string): ResponseBuilder {
        this.headers = this.headers.filter(
            (header) =>
                header[0].toLowerCase() !==
                name.toLowerCase()
        )
        return this
    }

    /**
     * Sets a header on the response.
     * @param name The name of the header to set
     * @param value The value of the header
     * @param overwrite Whether to overwrite any existing header with the same name. Default is true.
     * @returns The response builder instance
     */
    setHeader(
        name: string,
        value: string,
        overwrite: boolean = true,
    ): ResponseBuilder {
        if (overwrite) {
            this.unsetHeader(name)
        }

        this.headers.push([name, value])

        return this
    }

    /**
     * Sets a cookie on the response.
     * @param name The name of the cookie
     * @param value The value of the cookie
     * @param options The options for the cookie
     * @returns The response builder instance
     */
    setCookie(
        name: string,
        value: string,
        options: CookieOptions = {},
    ): ResponseBuilder {
        const cookieParts = [`${name}=${encodeURIComponent(value)}`]

        if (options.MaxAge) {
            cookieParts.push(`Max-Age=${options.MaxAge}`)
        }
        if (options.Path) {
            cookieParts.push(`Path=${options.Path}`)
        }
        if (options.HttpOnly) {
            cookieParts.push(`HttpOnly`)
        }
        if (options.Secure) {
            cookieParts.push(`Secure`)
        }
        if (options.SameSite) {
            cookieParts.push(`SameSite=${options.SameSite}`)
        }

        this.setHeader('Set-Cookie', cookieParts.join('; '), false)

        return this
    }

    /**
     * Unsets a cookie on the response.
     * @param name The name of the cookie to unset
     * @returns The response builder instance
     */
    unsetCookie(name: string): ResponseBuilder {
        this.setHeader('Set-Cookie', name + "=; Expires=Thu, 01 Jan 1970 00:00:00 GMT", false)
        return this
    }

    /**
     * Sets the body of the response.
     * @param bodyInit The body of the response
     * @returns The response builder instance
     */
    body(bodyInit: BodyInit): ResponseBuilder {
        this.bodyInit = bodyInit
        return this
    }

    /**
     * Submits the response to the client, with an optional body.
     * @param bodyInit The body of the response, if any
     */
    send(bodyInit?: BodyInit): void {
        this.bodyInit = bodyInit
        this.submit = true
    }

    /**
     * Redirects to a given url. If perma is true, this is a 308 redirect, otherwise it is a 307.
     * @param url The url to redirect to
     * @param perma Whether this is a permanent redirect
     * @returns void because it is submitted to the client
     */
    sendRedirect(url: string, perma: boolean = false): void {
        this.reset()
        this.statusCode = perma ? 308 : 307
        this.headers.push(["location", url])
        this.submit = true
    }

    /**
     * Redirects to a given url with a custom status code.
     * @param url The url to redirect to
     * @param status The status code to use for the redirect
     * @returns void because it is submitted to the client
     */
    sendRedirectCustom(url: string, status: number): void {
        this.reset()
        this.statusCode = status
        this.headers.push(["location", url])
        this.submit = true
    }

    /**
     * Sets the status code to 401 and adds a basic auth `WWW-Authenticate` header.
     * @param realm The realm to use for the header. Default is "User Visible Realm".
     * @param charset The character set to use for the realm. Default is "UTF-8".
     * @returns void because it is submitted to the client
     */
    sendBasicAuth(
        bodyInit?: BodyInit,
        realm: string = "User Visible Realm",
        charset: string = "UTF-8",
    ): void {
        this.reset()
        this.statusCode = 401
        this.setHeader(
            'WWW-Authenticate',
            'Basic realm="' + realm +
            '", charset="' + charset + '"'
        )
        this.bodyInit = bodyInit
        this.submit = true
    }
}

/**
 * ## Simple Router
 * ### About
 * A simple express-like router written for bun serve.
 * 
 * ### Author
 * By [NobleMajo](https://github.com/NobleMajo)
 * @see https://github.com/NobleMajo
 * 
 * ### Usage:
 * You can use the bun.serve function and use router.handle as fetch parameter of the settings:
 * ```ts
 * export const server = Bun.serve({
 *     fetch: router.handle,
 * })
 * ```
 * 
 * But you can also use the convenient router.listen function: 
 * ```ts
 * const server = router.listen()
 * ```
 */
export class Router {
    routes: EndpointRoute[] = []
    mergeHandlers: boolean = true


    /**
     * Parses the cookie header of the request and sets the cookies property of the request.
     * @param req The request to parse the cookies for
     */
    static parseCookies(
        req: Request,
        forceReload: boolean = false,
    ): void {
        if (!req.originCookies) {
            req.cookies = {}
            const cookieHeader = req.headers.get("cookie")
            if (!cookieHeader) {
                return
            }

            const pairs = cookieHeader.split(/; */)
            for (const pair of pairs) {
                const splitted = pair.split('=')
                const name = trimSpaces(splitted[0])
                if (name.length != 0) {
                    req.cookies[name] = decodeURIComponent(
                        splitted
                            .slice(1)
                            .join('=')
                    )
                }
            }

            req.originCookies = {
                ...req.cookies
            }
        } else if (forceReload) {
            req.cookies = {
                ...req.originCookies
            }
        }
    }

    /**
     * Stores the cookies in the request object into the response.
     * 
     * If the value of a cookie is changed, it will be set in the response.
     * If a cookie is deleted, it will be unset in the response.
     * @param req The request that contains the cookies.
     * @param res The response that will be modified.
     */
    static storeCookies(
        req: Request,
        res: ResponseBuilder,
    ): void {
        if (!req.cookies) {
            res.reset()
                .status(500)
                .send("Request cookies store error")
            return
        }

        const newCookies = req.cookies
        const oldCookies: {
            [key: string]: string
        } = req.originCookies as any ?? {}

        const newCookieKeys = Object.keys(newCookies)
        for (const cookieKey of newCookieKeys) {
            if (
                newCookies[cookieKey] && (
                    !oldCookies[cookieKey] ||
                    oldCookies[cookieKey] !== newCookies[cookieKey]
                )
            ) {
                res.setCookie(cookieKey, newCookies[cookieKey])
            }
        }

        for (const cookieKey of Object.keys(oldCookies)) {
            if (!newCookieKeys.includes(cookieKey)) {
                res.unsetCookie(cookieKey)
            }
        }

        req.cookies = newCookies
    }

    /**
     * @hidden
     * 
     * Creates a string tuple that contains the method, path and name of the middleware
     * @param route The route to generate the string for
     * @param handler The handler of the route
     * @param mergedToTop Whether the handler is merged to the top
     * @returns A string with 3 parts: method, path and name
     */
    private static getDefinitionString(
        route: EndpointRoute,
        handler: RequestMiddleware,
        mergedToTop: boolean,
    ): [string, string, string] {
        let parts: [string, string, string] = ["/", "X", "/"]

        if (mergedToTop) {
            parts[0] = "^ (M)"
        } else {
            parts[0] = stringifyHttpMethods(route.method)
        }

        if (route.splitPath) {
            parts[1] = "/" + route.splitPath.join("/")
        } else {
            parts[1] = "/"
        }

        if (
            isMergedRequestMiddleware(handler)
        ) {
            parts[2] = "[merged]"
        } else if (
            handler &&
            typeof handler.name == "string" &&
            handler.name.length != 0
        ) {
            parts[2] = handler.name
        } else if (
            handler &&
            handler.prototype &&
            typeof handler.prototype.name == "string" &&
            handler.prototype.name.length != 0
        ) {
            parts[2] = handler.prototype.name
        } else {
            parts[2] = "[anonym]"
        }

        return parts
    }

    /**
     * Prints a table of all endpoints defined in this router.
     * 
     * If a server is given as a parameter, a running message with the url of the server is printed too.
     * @param server The server to print the url of
     * @returns A string representing the table of endpoints
     */
    dump(...servers: Server[]): string {
        if (this.routes.length == 0) {
            throw new Error("No endpoint routes defined")
        }

        let unmergedParts: [string, string, string][] = []
        let mergedParts: [string, string, string][] = []
        for (const route of this.routes) {
            mergedParts.push(
                Router.getDefinitionString(
                    route,
                    route.handler,
                    false
                )
            )

            unmergedParts.push(
                ...unmergeRequestMiddleware(route.handler)
                    .map(
                        (middleware, index) => Router.getDefinitionString(
                            route,
                            middleware,
                            index != 0,
                        )
                    )
            )
        }

        const both = [
            ...unmergedParts,
            ...mergedParts
        ]
        const part1MinLen = both.sort(
            (a, b) => b[0].length - a[0].length
        )[0][0].length
        const part2MinLen = both.sort(
            (a, b) => b[1].length - a[1].length
        )[0][1].length
        const part3MinLen = both.sort(
            (a, b) => b[2].length - a[2].length
        )[0][2].length

        const lines: string[] = []

        if (servers && servers.length != 0) {
            if (servers.length == 1) {
                lines.push("Server is listening on " + servers[0].url)
            } else {
                lines.push("Server is listening on:")
                lines.push(
                    ...servers.map(
                        (server) => "- " + server.url
                    )
                )
            }
        }

        lines.push(
            "",
            "# Defined endpoints:",
            ...unmergedParts.map(
                ([part1, part2, part3]): string =>
                    "| " + part1.padEnd(part1MinLen) +
                    " | " + part2.padEnd(part2MinLen) +
                    " | " + part3.padEnd(part3MinLen) +
                    " |"
            ),
            "",
        )

        if (unmergedParts.length != mergedParts.length) {
            lines.push(
                "# Merged endpoints:",
                ...mergedParts.map(
                    ([part1, part2, part3]): string =>
                        "| " + part1.padEnd(part1MinLen) +
                        " | " + part2.padEnd(part2MinLen) +
                        " | " + part3.padEnd(part3MinLen) +
                        " |"
                ),
                "",
            )
        }

        return lines.join("\n")
    }

    /**
     * This function can be used as fetch handler for bun.serve.
     * It will route a request to the correct handler based on the request's method and path.
     * @param request A bun request object
     * @param server A bun server object
     * @returns Bun response, void or a promise of response or void
     */
    handle: BunRequestHandler = (
        request: Request,
        server: Server
    ) => this.innerHandle(request, server)

    /**
     * @hidden
     * 
     * Handles a request.
     * This function creates the ResponseBuilder and modifies the base bun request.
     * @param req A request to handle
     * @param server A server to handle it on
     * @returns Bun response, void or a promise of response or void
     */
    private innerHandle(request: Request, server: Server): Awaitable<Response> {
        const res = new ResponseBuilder()
        const req = request as Request
        req.httpMethod = parseHttpMethods(req.method)
        req.server = server
        req.cookies = {}
        req.path = new URL(req.url).pathname
        req.splitPath = splitPath(req.path)
        const sock = req.server.requestIP(req)
        if (!sock) {
            return new Response("Request closed to early", { status: 500 })
        }
        req.sock = sock

        const p = this.route(req, res)
        if (
            p &&
            p.then != undefined
        ) {
            return p.then(
                () => {
                    if (req.upgraded) {
                        return undefined as unknown as Response
                    }
                    const p = res.startBeforeSentHook()
                    if (
                        p &&
                        p.then != undefined
                    ) {
                        return p.then(() => {
                            return res.build()
                        })
                    }

                    return res.build()
                }
            )
        }

        if (req.upgraded) {
            return undefined as unknown as Response
        }
        const p2 = res.startBeforeSentHook()
        if (
            p2 &&
            p2.then != undefined
        ) {
            return p2.then(() => {
                return res.build()
            })
        }

        return res.build()
    }

    /**
     * This function will route a request to the correct handler based on the request's method and path.
     * Recursively calls middlewares until a handler sets `res.submit` to true or `req.upgraded` to true.
     * 
     * First handles the request synchronously until a async middleware is hit.
     * Then its uses the private routeAsync function to handle it in a promise.
     * 
     * If no async middleware is hit the request is handled fully synchronously.
     * @param req A modified bun request to handle
     * @param res A response builder
     * @returns Bun response, void or a promise of response or void
     */
    route(req: Request, res: ResponseBuilder): Awaitable<void> {
        for (let i = 0; i < this.routes.length; i++) {
            if (
                this.routes[i].method != HttpMethod.ALL &&
                this.routes[i].method != req.httpMethod
            ) {
                continue
            }

            const pathParams = requestPathMatchesRouteDefinition(
                req.splitPath,
                this.routes[i].splitPath,
            )

            if (pathParams === false) {
                continue
            } else if (pathParams !== true) {
                req.pathParams = pathParams
            }

            const p = this.routes[i].handler(req, res)
            if (
                p != undefined &&
                p.then != undefined
            ) {
                return this.routeAsync(i, p, req, res)
            }

            if (
                res.submit === true ||
                req.upgraded === true
            ) {
                return
            }
        }

        if (req.upgraded) {
            return
        }

        res.reset()
            .status(404)
            .body("Not found")
    }

    /**
     * @hidden
     *
     * Is a followup of the route function. Is used if the route function hits a async middleware.
     * The route function will provide the initialDefIndex when routeAsync is called.
     * The initialDefIndex is the index of the first found async middleware in the route function.
     *
     * If route dont hits a async middleware, routeAsync dont get called
     * @param initialDefIndex The index of the first found async middleware in the route function
     * @param promise The promise returned by the first async middleware found by the route function
     * @param req A modified bun request to handle
     * @param res A response builder
     * @returns Bun response, void or a promise of response or void
     */
    private async routeAsync(
        initialDefIndex: number,
        promise: Promise<void>,
        req: Request,
        res: ResponseBuilder
    ): Promise<void> {
        await promise

        if (
            res.submit === true ||
            req.upgraded === true
        ) {
            return
        }

        for (let i = initialDefIndex + 1; i < this.routes.length; i++) {
            if (
                this.routes[i].method != undefined &&
                this.routes[i].method != req.httpMethod
            ) {
                continue
            }

            const pathParams = requestPathMatchesRouteDefinition(
                req.splitPath,
                this.routes[i].splitPath,
            )

            if (pathParams === false) {
                continue
            } else if (pathParams !== true) {
                req.pathParams = pathParams
            }

            const p = this.routes[i].handler(req, res)
            if (
                p &&
                p.then != undefined
            ) {
                await p
            }

            if (
                (res.submit as boolean) === true ||
                req.upgraded === true
            ) {
                return
            }
        }

        if (req.upgraded) {
            return
        }

        res.reset()
            .status(404)
            .body("Not found")
    }

    /**
     * Register a handler to run for all incoming requests.
     * @param method The HTTP method to run the handler on (undefined = all)
     * @param path The path to run the handler on (undefined = all)
     * @param handlers The handler(s) to run
     * @returns The router
     */
    use(
        method: "*" | HttpMethodString,
        path: string,
        handler: RequestMiddleware,
        ...handlers: RequestMiddleware[]
    ): Router {
        if (typeof handler != "function") {
            throw new Error("no handler provided, type: " + typeof handler)
        }

        handlers = [
            handler,
            ...handlers
        ]

        const route: EndpointRoute = {
            splitPath: splitRoutePath(path),
            method: parseHttpMethods(method),
            handler: handler
        }

        if (this.mergeHandlers) {
            const lastDef = this.routes.pop()
            if (lastDef) {
                if (
                    isMergeableEndpointRoute(
                        lastDef,
                        route,
                    )
                ) {
                    handlers.unshift(lastDef.handler)
                } else {
                    this.routes.push(lastDef)
                }
            }
        }

        route.handler = mergeRequestMiddlewares(
            ...unmergeRequestMiddleware(
                ...handlers
            )
        )

        this.routes.push(route)
        return this
    }

    /**
     * Registers a route for the `GET` HTTP method.
     * @param path The route path.
     * @param handler The handler function for the route.
     * @param handlers Additional middleware functions to apply to the route.
     * @returns The router instance.
     */
    get(
        path: string,
        handler: RequestMiddleware,
        ...handlers: RequestMiddleware[]
    ): Router {
        return this.use(
            "GET",
            path,
            handler,
            ...handlers
        )
    }

    /**
     * Register a handler to run on incoming POST requests.
     * @param path The path to run the handler on
     * @param handler The handler(s) to run
     * @returns The router
     */
    post(
        path: string,
        handler: RequestMiddleware,
        ...handlers: RequestMiddleware[]
    ): Router {
        return this.use(
            "POST",
            path,
            handler,
            ...handlers
        )
    }

    /**
     * Register a PUT route.
     * @param path The path to match.
     * @param handler The handler for the route.
     * @param handlers Additional handlers to run before the main handler.
     * @returns The Router instance.
     */
    put(
        path: string,
        handler: RequestMiddleware,
        ...handlers: RequestMiddleware[]
    ): Router {
        return this.use(
            "PUT",
            path,
            handler,
            ...handlers
        )
    }

    /**
     * Register a middleware function to handle DELETE requests to `path`.
     * @param path The path to register the handler for.
     * @param handler The middleware function to call.
     * @param handlers Additional middleware functions to call.
     * @returns this
     */
    delete(
        path: string,
        handler: RequestMiddleware,
        ...handlers: RequestMiddleware[]
    ): Router {
        return this.use(
            "DELETE",
            path,
            handler,
            ...handlers
        )
    }

    /**
     * Register a middleware function to handle PATCH requests to `path`.
     * @param path The path to register the handler for.
     * @param handler The middleware function to call.
     * @param handlers Additional middleware functions to call.
     * @returns this
     */
    patch(
        path: string,
        handler: RequestMiddleware,
        ...handlers: RequestMiddleware[]
    ): Router {
        return this.use(
            "PATCH",
            path,
            handler,
            ...handlers
        )
    }

    /**
     * Add a route for the HTTP TRACE method.
     * The TRACE method is used to invoke a remote, application-layer loop-back
     * of the request message.
     * @param path The path this route will match.
     * @param handler The handler to invoke when this route is matched.
     * @param handlers Additional handlers to run when this route is matched.
     * @returns This router, for chaining.
     */
    trace(
        path: string,
        handler: RequestMiddleware,
        ...handlers: RequestMiddleware[]
    ): Router {
        return this.use(
            "TRACE",
            path,
            handler,
            ...handlers
        )
    }

    /**
     * Registers a route for the `HEAD` HTTP method.
     * @param path The route path.
     * @param handler The handler function for the route.
     * @param handlers Additional middleware functions to apply to the route.
     * @returns The router instance.
     */
    head(
        path: string,
        handler: RequestMiddleware,
        ...handlers: RequestMiddleware[]
    ): Router {
        return this.use(
            "HEAD",
            path,
            handler,
            ...handlers
        )
    }

    /**
     * Register a handler to run for CONNECT requests on the given path.
     * @param path The path to run the handler on
     * @param handler The handler to run
     */
    connect(
        path: string,
        handler: RequestMiddleware,
        ...handlers: RequestMiddleware[]
    ): Router {
        return this.use(
            "CONNECT",
            path,
            handler,
            ...handlers
        )
    }

    /**
     * Register a handler to run on OPTIONS requests.
     * @param path The path to run the handler on (undefined = all)
     * @param handler The handler(s) to run
     * @returns The router
     */
    options(
        path: string,
        handler: RequestMiddleware,
        ...handlers: RequestMiddleware[]
    ): Router {
        return this.use(
            "OPTIONS",
            path,
            handler,
            ...handlers
        )
    }

    /**
     * Upgrade a request to a websocket connection.
     * @param path The path to use for the websocket connection.
     * @returns The router, for chaining.
     */
    ws(path: string): Router {
        const wsMiddleware: RequestMiddleware = (req, res) => {
            if (req.server.upgrade(req)) {
                req.upgraded = true
            }
        }

        this.use(
            "GET",
            path,
            wsMiddleware
        )
        return this
    }

    redirect(
        method: "*" | HttpMethodString,
        path: string,
        redirectTarget: string,
        perma: boolean = false,
    ): Router {
        const redirectMiddleware: RequestMiddleware =
            (_, res) => res.sendRedirect(redirectTarget, perma)

        this.use(
            method,
            path,
            redirectMiddleware,
        )

        return this
    }

    static(
        path: string,
        targetDir: string,
        indexFile: string = "index.html",
        deepestLevel: number = 10,
    ): Router {
        if (!statSync(targetDir).isDirectory()) {
            throw new Error("static target is not a directory: " + targetDir)
        }

        const staticMiddleware: RequestMiddleware =
            (req, res) => {
                if (req.path.endsWith("/" + indexFile)) {
                    res.sendRedirect(
                        req.path.slice(0, -indexFile.length),
                        true,
                    )
                    return
                }

                let targetPath = join(
                    targetDir,
                    req.splitPath == undefined ?
                        "/" :
                        req.path
                )

                if (targetPath.endsWith("/")) {
                    targetPath += indexFile
                }

                if (
                    req.splitPath != undefined &&
                    req.splitPath?.length > deepestLevel
                ) {

                    return
                }

                try {
                    const file = Bun.file(targetPath)
                    return file.exists().then((exist) => {
                        if (exist) {
                            res.send(file)
                        }
                    })
                } catch (_) { }
            }

        this.use(
            "GET",
            path,
            staticMiddleware
        )

        return this
    }

    basicAuth(
        method: "*" | HttpMethodString,
        path: string,
        validator: ((username: string, password: string) => boolean),
        realm: string = "User Visible Realm",
        charset: string = "UTF-8",
    ): Router {
        const basicAuthMiddleware: RequestMiddleware = (req, res) => {
            const auth = req.headers.get("authorization")
            if (!auth) {
                res.sendBasicAuth(
                    "Missing authorization header",
                    realm,
                    charset
                )
                return
            }
            let splitIndex = auth.indexOf(" ")
            if (splitIndex === -1) {
                res.sendBasicAuth(
                    "Unprocessable authorization header",
                    realm,
                    charset
                )
                return
            }

            const schema = auth.slice(0, splitIndex)
            if (schema !== "Basic") {
                res.sendBasicAuth(
                    "Unprocessable basic auth schema",
                    realm,
                    charset
                )
                return
            }

            const credentials = atob(auth.slice(splitIndex + 1))

            splitIndex = credentials.indexOf(":")
            if (splitIndex === -1) {
                res.sendBasicAuth(
                    "Unprocessable basic auth credentials",
                    realm,
                    charset
                )
                return
            }

            if (!validator(
                credentials.slice(0, splitIndex),
                credentials.slice(splitIndex + 1)
            )) {
                res.sendBasicAuth(
                    "Invalid credentials",
                    realm,
                    charset
                )
                return
            }
        }

        this.use(
            method,
            path,
            basicAuthMiddleware
        )

        return this
    }

    cookies(
        method: "*" | HttpMethodString,
        path: string,
        autoResponseHeaders: boolean = false,
    ): Router {
        const cookiesMiddleware: RequestMiddleware =
            autoResponseHeaders ?
                (req, res) => {
                    res.beforeSent(
                        (res) => Router.storeCookies(req, res)
                    )
                    Router.parseCookies(req)
                } :
                (req) => Router.parseCookies(req)

        this.use(
            method,
            path,
            cookiesMiddleware
        )

        return this
    }
}


/**
 * Unmerge multiple request middlewares into individual ones.
 * @param middlewares The middlewares to unmerge.
 * @returns An array of individual request middlewares.
 */
export function unmergeRequestMiddleware(
    ...middlewares: RequestMiddleware[]
): RequestMiddleware[] {
    const foundMiddlewares: RequestMiddleware[] = []

    for (const middleware of middlewares) {
        if (isMergedRequestMiddleware(middleware)) {
            foundMiddlewares.push(
                ...unmergeRequestMiddleware(
                    ...middleware.base
                )
            )
        } else {
            foundMiddlewares.push(middleware)
        }

    }

    return foundMiddlewares
}


/**
 * Merge multiple request middlewares into a single one.
 * @param middlewares The middlewares to merge.
 * @returns A single middleware that calls all the given middlewares in order.
 *          If any of the middlewares returns a promise, its handles the rest middlewars async.
 */
export function mergeRequestMiddlewares(
    ...middlewares: RequestMiddleware[]
): MergedRequestMiddleware | RequestMiddleware {
    if (middlewares.length == 0) {
        throw new Error("no middlewares specified")
    } else if (middlewares.length == 1) {
        return middlewares[0]
    }

    middlewares = unmergeRequestMiddleware(...middlewares)

    const mergedAsync = async (
        initialDefIndex: number,
        promise: Promise<void>,
        req: Request,
        res: ResponseBuilder,
    ) => {
        await promise

        if (
            res.submit === true ||
            req.upgraded === true
        ) {
            return
        }

        for (let i = initialDefIndex + 1; i < middlewares.length; i++) {
            const middleware = middlewares[i]
            const p = middleware(req, res)
            if (
                p &&
                p.then != undefined
            ) {
                await p
            }

            if (
                (res.submit as boolean) === true ||
                req.upgraded === true
            ) {
                return
            }
        }
    }

    const baseMerged: RequestMiddleware = (req, res) => {
        for (let i = 0; i < middlewares.length; i++) {
            const middleware = middlewares[i]
            const p = middleware(req, res)
            if (
                p &&
                p.then != undefined
            ) {
                return mergedAsync(i, p, req, res)
            }

            if (
                res.submit === true ||
                req.upgraded === true
            ) {
                return
            }
        }
    }

    const merged = baseMerged as unknown as MergedRequestMiddleware
    merged.base = middlewares
    return merged
}

/**
 * Checks if the given middleware is a merged middleware.
 * Merged middlewares are created by {@link mergeRequestMiddlewares}.
 * They contain an array of middlewares in the `base` property.
 * This function checks if the `base` property is an array and
 * returns true if it is, false otherwise.
 * @param middleware The middleware to check.
 * @returns True if the middleware is a merged middleware, false otherwise.
 */
export function isMergedRequestMiddleware(
    middleware: RequestMiddleware
): middleware is MergedRequestMiddleware {
    return Array.isArray(
        (
            middleware as unknown as MergedRequestMiddleware
        ).base
    )
}

/**
 * Checks if two endpoint routes are mergeable.
 * The routes are mergeable if they have the same method and path.
 * The path is considered the same if the splitPath property is undefined for both routes or
 * if the splitPath property is defined for both routes and the joined string is the same.
 * @param route - The first route to check.
 * @param route2 - The second route to check.
 * @returns true if the routes are mergeable, false otherwise.
 */
export function isMergeableEndpointRoute(
    route: EndpointRoute,
    route2: EndpointRoute,
): boolean {
    if (route.method !== route2.method) {
        return false
    }

    if (
        route.splitPath == undefined &&
        route2.splitPath == undefined
    ) {
        return true
    } else if (
        route.splitPath != undefined &&
        route2.splitPath != undefined &&
        route.splitPath.join("/") ==
        route2.splitPath.join("/")
    ) {
        return true
    }
    return false
}

/**
 * Trims leading and trailing whitespace characters from a string.
 * @param {string} value - The input string to be trimmed.
 * @return {string} The trimmed string.
 */
export function trimSpaces(value: string): string {
    while (
        value.startsWith(" ") ||
        value.startsWith("\t") ||
        value.startsWith("\n")
    ) {
        value = value.slice(1)
    }

    if (value.length == 0) {
        return ""
    }

    while (
        value.endsWith(" ") ||
        value.endsWith("\t") ||
        value.endsWith("\n")
    ) {
        value = value.slice(0, -1)
    }

    return value
}

/**
 * Splits a path into its components.
 * @param path The path to split.
 * @returns An array of strings representing the path components.
 *          undefined if the path is empty.
 */
export function splitPath(path: string | undefined): SplitPath {
    if (path == undefined) {
        return undefined
    }

    while (
        path.startsWith("/") ||
        path.startsWith(" ")
    ) {
        path = path.slice(1)
    }

    if (path.length == 0) {
        return undefined
    }

    while (
        path.endsWith("/") ||
        path.endsWith(" ")
    ) {
        path = path.slice(0, -1)
    }

    const splitPath = path
        .split("/")
        .map((part) => {
            while (
                part.startsWith("/") ||
                part.startsWith(" ")
            ) {
                part = part.slice(1)
            }

            if (part.length == 0) {
                return ""
            }

            while (
                part.endsWith("/") ||
                part.endsWith(" ")
            ) {
                part = part.slice(0, -1)
            }

            return part
        })
        .filter((v) => v.length != 0)
    if (splitPath.length == 0) {
        return undefined
    }

    return splitPath as SplitPath
}

export function splitRoutePath(path: string | undefined): SplitPath {
    const splittedPath = splitPath(path)

    if (
        splittedPath &&
        splittedPath.length > 1 &&
        splittedPath.slice(0, -1).includes("**")
    ) {
        throw new Error(
            "Invalid router path, ** must be the last part"
        )
    }

    return splittedPath as SplitPath
}

/**
 * Checks if a requested splitpath matches the routes splitpath.
 * Also resolves single (*) and double (**) wildcards.
 * `true` or wildcarded path parts are returned if found and match.
 * `false` is returned if not.
 * @param requestPath the path to check
 * @param routeSelector the route selector to check against
 */
export function requestPathMatchesRouteDefinition(
    requestPath: SplitPath,
    routeSelector: SplitPath,
): string[] | boolean {
    if (
        requestPath == undefined &&
        routeSelector == undefined
    ) {
        return []
    } else if (
        routeSelector == undefined
    ) {
        return false
    } else if (
        requestPath == undefined
    ) {
        if (routeSelector[0] == "**") {
            return true
        }
        return false
    } else if (
        requestPath.length == 0
    ) {
        throw new Error("Invalid requestPath SplitPath length, got 0, expected at least 1")
    } else if (
        routeSelector.length == 0
    ) {
        throw new Error("Invalid routeSelector SplitPath length, got 0, expected at least 1")
    } else if (routeSelector[0] == "**") {
        return requestPath
    } else if (routeSelector.length < requestPath.length) {
        if (routeSelector[routeSelector.length - 1] != "**") {
            return false
        }
    }

    let pathParams: string[] | true = true

    for (let i = 0; i < routeSelector.length; i++) {
        switch (routeSelector[i]) {
            case "*":
                if (requestPath.length <= i) {
                    return false
                }
                if (pathParams === true) {
                    pathParams = []
                }
                pathParams.push(requestPath[i])
                break
            case "**":
                if (requestPath.length - i > 0) {
                    if (pathParams === true) {
                        pathParams = []
                    }
                    pathParams.push(...requestPath.slice(i))
                }
                return pathParams
            case requestPath[i]:
                break
            default:
                return false

        }
    }

    return pathParams
}
