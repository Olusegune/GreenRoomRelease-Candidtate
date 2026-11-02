import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Book, Cast, Chip, Clock, Cube, Direct, Export, Eye, Gear, Home, Script, Shield, Sparkle, Speaker, Timeline, Voices } from "./icons";

describe("sidebar icons", () => {
  it("gives every sidebar item its own icon", () => {
    const icons = { Home, Script, Cast, Direct, Timeline, Eye, Export, Shield, Clock, Voices, Cube, Chip, Sparkle, Speaker, Gear, Book };
    const markup = Object.values(icons).map((I) => renderToStaticMarkup(<I size={20} />));
    expect(new Set(markup).size).toBe(markup.length);
  });
});
