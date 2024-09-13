import { describe, expect, it } from "bun:test";
import { splitPath } from ".";

describe("splitPath", () => {

  it("empty string should result in undefined", () => {
    expect(splitPath("")).toBeUndefined()
  })

  it("single slash should result in undefined", () => {
    expect(splitPath("/")).toBeUndefined()
  })

  it("multiple slashes and spaces should result in undefined", () => {
    expect(splitPath("/ / / / / ")).toBeUndefined()
  })

  it("part should result in single part", () => {
    expect(splitPath("test")).toEqual(["test"])
  })

  it("slash prefixed part should result in single part", () => {
    expect(splitPath("/test")).toEqual(["test"])
  })

  it("part with slashes and spaces should result in single parts", () => {
    expect(splitPath("/ / /test/ / /")).toEqual(["test"])
  })

  it("multiple parts should result in multiple parts", () => {
    expect(splitPath("test/hello/world/test")).toEqual(["test", "hello", "world", "test"])
  })

  it("slash prefixed multiple parts should result in multiple parts", () => {
    expect(splitPath("/test/hello/world/test")).toEqual(["test", "hello", "world", "test"])
  })

  it("multiple parts with slashes and spaces should result in multiple parts", () => {
    expect(splitPath("/ / /test/ / /hello/ / /world/ / /test/ / /")).toEqual(["test", "hello", "world", "test"])
  })
})
