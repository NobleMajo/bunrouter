import { describe, expect, it } from "bun:test";
import { requestPathMatchesRouteDefinition } from ".";

describe("requestPathMatchesRouteDefinition with single wildcards", () => {
  it('2 parts on 1 parts with single wildcard should result in true with ["hello"]', () => {
    expect(requestPathMatchesRouteDefinition(
      ["test", "hello"],
      ["test", "*"]
    )).toEqual(["hello"])
  })

  it('2 parts on 1 parts with double wildcard should result in true with ["hello"]', () => {
    expect(requestPathMatchesRouteDefinition(
      ["test", "hello"],
      ["test", "**"]
    )).toEqual(["hello"])
  })

  it('2 parts on 1 parts with single wildcard should result in true with ["hello"]', () => {
    expect(requestPathMatchesRouteDefinition(
      ["test", "hello"],
      ["test", "*"]
    )).toEqual(["hello"])
  })

  it("1 part on wildcard should result in [part1]", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1"],
      ["*"]
    )).toEqual(["part1"])
  })

  it("2 parts on wildcard should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2"],
      ["*"]
    )).toBe(false)
  })

  it("3 parts on wildcard should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2", "part3"],
      ["*"]
    )).toBe(false)
  })

  it("4 parts on wildcard should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2", "part3", "part4"],
      ["*"]
    )).toBe(false)
  })

  it("1 part on 2 wildcards should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1"],
      ["*", "*"]
    )).toBe(false)
  })

  it("2 parts on 2 wildcards should result in [part1, part2]", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2"],
      ["*", "*"]
    )).toEqual(["part1", "part2"])
  })

  it("3 parts on 2 wildcards should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2", "part3"],
      ["*", "*"]
    )).toBe(false)
  })

  it("4 parts on 2 wildcards should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2", "part3", "part4"],
      ["*", "*"]
    )).toBe(false)
  })

  it("1 part on 1 part and 1 wildcard should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1"],
      ["part1", "*"]
    )).toBe(false)
  })

  it("2 parts on 1 part and 1 wildcard should result in [part2]", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2"],
      ["part1", "*"]
    )).toEqual(["part2"])
  })

  it("3 parts on 1 part and 1 wildcard should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2", "part3"],
      ["part1", "*"]
    )).toBe(false)
  })

  it("4 parts on 1 part and 1 wildcard should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2", "part3", "part4"],
      ["part1", "*"]
    )).toBe(false)
  })

  it("1 part on 1 part and 2 wildcards should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1"],
      ["part1", "*", "*"]
    )).toBe(false)
  })

  it("2 parts on 1 part and 2 wildcards should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2"],
      ["part1", "*", "*"]
    )).toBe(false)
  })

  it("3 parts on 1 part and 2 wildcards should result in [part2, part3]", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2", "part3"],
      ["part1", "*", "*"]
    )).toEqual(["part2", "part3"])
  })

  it("4 parts on 1 part and 2 wildcards should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2", "part3", "part4"],
      ["part1", "*", "*"]
    )).toBe(false)
  })

  it("1 part on 1 part and 3 wildcards should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1"],
      ["part1", "*", "*", "*"]
    )).toBe(false)
  })

  it("2 parts on 1 part and 3 wildcards should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2"],
      ["part1", "*", "*", "*"]
    )).toBe(false)
  })

  it("3 parts on 1 part and 3 wildcards should result in false", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2", "part3"],
      ["part1", "*", "*", "*"]
    )).toBe(false)
  })

  it("4 parts on 1 part and 3 wildcards should result in [part2, part3, part4]", () => {
    expect(requestPathMatchesRouteDefinition(
      ["part1", "part2", "part3", "part4"],
      ["part1", "*", "*", "*"]
    )).toEqual(["part2", "part3", "part4"])
  })
})
