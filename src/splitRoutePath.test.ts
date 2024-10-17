import { describe, expect, it } from "bun:test";
import { splitRoutePath } from ".";

describe("splitRoutePath", () => {

  it("empty string should result in undefined", () => {
    expect(splitRoutePath(
      ""
    )).toBeUndefined()
  })

  it("single slash should result in undefined", () => {
    expect(splitRoutePath(
      "/"
    )).toBeUndefined()
  })

  it("multiple slashes and spaces should result in undefined", () => {
    expect(splitRoutePath(
      "/ / / / / "
    )).toBeUndefined()
  })

  it("part should result in single part", () => {
    expect(splitRoutePath(
      "test"
    )).toEqual(["test"])
  })

  it("dont allow double wildcard before single and then double", () => {
    expect(() => splitRoutePath(
      "/**/*/**"
    )).toThrowError()

    expect(() => splitRoutePath(
      "/**/*/*/**"
    )).toThrowError()

    expect(() => splitRoutePath(
      "/**/*/*/*/*/*/*/**"
    )).toThrowError()
  })

  it("dont allow double wildcard before single", () => {
    expect(() => splitRoutePath(
      "/**/*"
    )).toThrowError()

    expect(() => splitRoutePath(
      "/**/*/*"
    )).toThrowError()

    expect(() => splitRoutePath(
      "/**/*/*/*/*/*/*/*/*"
    )).toThrowError()
  })

  it("slash prefixed part should result in single part", () => {
    expect(splitRoutePath(
      "/test"
    )).toEqual(["test"])
  })

  it("part with slashes and spaces should result in single parts", () => {
    expect(splitRoutePath(
      "/ / /test/ / /"
    )).toEqual(["test"])
  })

  it("multiple parts should result in multiple parts", () => {
    expect(splitRoutePath(
      "test/hello/world/test"
    )).toEqual(["test", "hello", "world", "test"])
  })

  it("slash prefixed multiple parts should result in multiple parts", () => {
    expect(splitRoutePath(
      "/test/hello/world/test"
    )).toEqual(["test", "hello", "world", "test"])
  })

  it("multiple parts with slashes and spaces should result in multiple parts", () => {
    expect(splitRoutePath(
      "/ / /test/ / /hello/ / /world/ / /test/ / /"
    )).toEqual(["test", "hello", "world", "test"])
  })
})
