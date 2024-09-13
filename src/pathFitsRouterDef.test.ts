import { describe, expect, it } from "bun:test";
import { pathFitsRouterDef } from ".";

describe("pathFitsRouterDef without wildcards", () => {
  it("undefined + undefined should result in []", () => {
    expect(pathFitsRouterDef(undefined, undefined)).toEqual([])
  })

  it("empty array on undefined should result in false", () => {
    expect(pathFitsRouterDef([], undefined)).toBe(false)
  })

  it('1 part on undefined should result in false', () => {
    expect(pathFitsRouterDef(["test"], undefined)).toBe(false)
  })

  it("undefined on 1 part should result in false", () => {
    expect(pathFitsRouterDef(undefined, ["test"])).toBe(false)
  })

  it("undefined on empty array should result in false", () => {
    expect(pathFitsRouterDef(undefined, [])).toBe(false)
  })

  it('part on part should result in true', () => {
    expect(pathFitsRouterDef(["test"], ["test"])).toBe(true)
  })

  it('part on 2 parts should result in false', () => {
    expect(pathFitsRouterDef(["test"], ["test", "hello"])).toBe(false)
  })

  it('part on 3 parts should result in false', () => {
    expect(pathFitsRouterDef(["test"], ["test", "hello", "world"])).toBe(false)
  })

  it('2 parts on 2 parts should result in true', () => {
    expect(pathFitsRouterDef(["test", "hello"], ["test", "hello"])).toBe(true)
  })

  it('2 parts on 3 parts should result in false', () => {
    expect(pathFitsRouterDef(["test", "hello"], ["test", "hello", "world"])).toBe(false)
  })

  it('3 parts on 2 parts should result in false', () => {
    expect(pathFitsRouterDef(["test", "hello", "world"], ["test", "hello"])).toBe(false)
  })

  it('2 parts on 1 part should result in false', () => {
    expect(pathFitsRouterDef(["test", "hello"], ["test"])).toBe(false)
  })
})
