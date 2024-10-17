import { describe, expect, it, } from "bun:test";
import { requestPathMatchesRouteDefinition } from ".";

describe("requestPathMatchesRouteDefinition with mixed wildcards", () => {
  it('root on min 1 part', () => {
    expect(requestPathMatchesRouteDefinition(
      undefined,
      ["*", "**"]
    )).toEqual(false)
  })

  it('1 parts on min 1 part', () => {
    expect(requestPathMatchesRouteDefinition(
      ["hello"],
      ["*", "**"]
    )).toEqual(["hello"])
  })

  it('2 parts on min 1 part', () => {
    expect(requestPathMatchesRouteDefinition(
      ["hello", "world"],
      ["*", "**"]
    )).toEqual(["hello", "world"])
  })

  it('root on min 2 part and test word', () => {
    expect(requestPathMatchesRouteDefinition(
      undefined,
      ["test", "*", "*", "**"]
    )).toEqual(false)
  })

  it('1 part on min 2 part and test word', () => {
    expect(requestPathMatchesRouteDefinition(
      ["test",],
      ["test", "*", "*", "**"]
    )).toEqual(false)
  })

  it('2 parts on min 2 part and test word', () => {
    expect(requestPathMatchesRouteDefinition(
      ["test", "foo"],
      ["test", "*", "*", "**"]
    )).toEqual(false)
  })

  it('3 parts on min 2 part and test word', () => {
    expect(requestPathMatchesRouteDefinition(
      ["test", "foo", "bar"],
      ["test", "*", "*", "**"]
    )).toEqual(["foo", "bar"])
  })

  it('4 parts on min 2 part and test word', () => {
    expect(requestPathMatchesRouteDefinition(
      ["test", "foo", "bar", "anna"],
      ["test", "*", "*", "**"]
    )).toEqual(["foo", "bar", "anna"])
  })

  it('wildcard string in request path', () => {
    expect(requestPathMatchesRouteDefinition(
      ["*"],
      ["**"]
    )).toEqual(["*"])

    expect(requestPathMatchesRouteDefinition(
      ["*"],
      ["*"]
    )).toEqual(["*"])

    expect(requestPathMatchesRouteDefinition(
      ["**"],
      ["**"]
    )).toEqual(["**"])

    expect(requestPathMatchesRouteDefinition(
      ["**"],
      ["*"]
    )).toEqual(["**"])

    expect(requestPathMatchesRouteDefinition(
      ["hello", "*"],
      ["**"]
    )).toEqual(["hello", "*"])

    expect(requestPathMatchesRouteDefinition(
      ["hello", "*"],
      ["*", "**"]
    )).toEqual(["hello", "*"])

    expect(requestPathMatchesRouteDefinition(
      ["*"],
      ["*", "**"]
    )).toEqual(["*"])

    expect(requestPathMatchesRouteDefinition(
      ["*", "*"],
      ["*", "**"]
    )).toEqual(["*", "*"])

    expect(requestPathMatchesRouteDefinition(
      ["*", "*", "*"],
      ["*", "**"]
    )).toEqual(["*", "*", "*"])

    expect(requestPathMatchesRouteDefinition(
      ["**", "*", "*"],
      ["*", "**"]
    )).toEqual(["**", "*", "*"])

    expect(requestPathMatchesRouteDefinition(
      ["**", "**", "*"],
      ["*", "**"]
    )).toEqual(["**", "**", "*"])

    expect(requestPathMatchesRouteDefinition(
      ["**", "**", "**"],
      ["*", "**"]
    )).toEqual(["**", "**", "**"])
  })
})
