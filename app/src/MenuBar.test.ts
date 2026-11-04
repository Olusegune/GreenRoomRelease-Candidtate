import { describe, expect, it } from "vitest";
import { nextMenu } from "./MenuBar";

describe("menu bar", () => {
  const ids = ["file", "edit", "view", "help"];
  it("moves right and left between menus, wrapping around", () => {
    expect(nextMenu(ids, "file", 1)).toBe("edit");
    expect(nextMenu(ids, "help", 1)).toBe("file");
    expect(nextMenu(ids, "file", -1)).toBe("help");
    expect(nextMenu(ids, "view", -1)).toBe("edit");
  });
});
