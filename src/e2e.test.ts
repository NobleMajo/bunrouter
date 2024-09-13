import { describe, expect, it } from "bun:test";
import { Router } from ".";

function avarage(array: number[]) {
  return array.reduce((a, b) => a + b, 0)
}

describe("e2e router tests", () => {
  const router = new Router()

  router.get("/", (req, res) => {
    res.send("willkommen auf majos pimmel insel!")
  })

  router.get("/test", (req, res) => {
    res.send("test!")
  })

  router.get("/test/test", async (req, res) => {
    res.send("test!")
  })

  router.get("/test/**", (req, res) => {
    res.send("test 2!")
  })

  router.get("/ramon/*/*/*", (req, res) => {
    res.send("ramon!")
  })

  const server = Bun.serve({
    port: 0,
    fetch: router.handle,
  })

  const requestCount = 1000
  const testUrl = server.url + "/test/hallo"
  const notFoundUrl = server.url + "/this/cant/be/found"


  it("Root - / request test", async () => {
    const executionTimes: number[] = []

    for (let index = 0; index < requestCount; index++) {
      const startTime = performance.now()

      const resp = await fetch(server.url)
      const html = await resp.text()

      const endTime = performance.now()

      expect(html).toBe("willkommen auf majos pimmel insel!")

      const executionTime = endTime - startTime
      expect(executionTime).toBeLessThan(40)

      executionTimes.push(executionTime)
    }

    const avarageExecutionTime = avarage(executionTimes) / executionTimes.length

    console.log("Root - Avarage execution time: " + avarageExecutionTime)

    expect(avarageExecutionTime).toBeLessThan(1)
  })

  it("Test - /test/hallo request test", async () => {
    const executionTimes: number[] = []

    for (let index = 0; index < requestCount; index++) {
      const startTime = performance.now()

      const resp = await fetch(testUrl)
      const html = await resp.text()

      const endTime = performance.now()

      expect(html).toBe("test 2!")

      const executionTime = endTime - startTime
      expect(executionTime).toBeLessThan(40)

      executionTimes.push(executionTime)
    }

    const avarageExecutionTime = avarage(executionTimes) / executionTimes.length

    console.log("Test - Avarage execution time: " + avarageExecutionTime)

    expect(avarageExecutionTime).toBeLessThan(1)
  })

  it("NotFound - /this/cant/be/found request test", async () => {
    const executionTimes: number[] = []

    for (let index = 0; index < requestCount; index++) {
      const startTime = performance.now()

      const resp = await fetch(notFoundUrl)

      const endTime = performance.now()

      expect(resp.status).toBe(404)

      const executionTime = endTime - startTime
      expect(executionTime).toBeLessThan(40)

      executionTimes.push(executionTime)
    }

    const avarageExecutionTime = avarage(executionTimes) / executionTimes.length

    console.log("NotFound - Avarage execution time: " + avarageExecutionTime)

    expect(avarageExecutionTime).toBeLessThan(1)
  })
})
