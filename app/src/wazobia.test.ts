import { describe, expect, it } from "vitest";
import { installHint, nextStep, wazobiaVoiceEntry, WAZOBIA_VOICES } from "./wazobia";

const base = { hasToken: false, termsOpened: false, engineReady: false, modelReady: false };

describe("Wazobia golden path", () => {
  it("walks token, terms, engine, model, ready in order", () => {
    expect(nextStep(base)).toBe("token");
    expect(nextStep({ ...base, hasToken: true })).toBe("terms");
    expect(nextStep({ ...base, hasToken: true, termsOpened: true })).toBe("engine");
    expect(nextStep({ ...base, hasToken: true, termsOpened: true, engineReady: true })).toBe("model");
    expect(nextStep({ hasToken: true, termsOpened: true, engineReady: true, modelReady: true })).toBe("ready");
  });
  it("does not ask for a token again once files and engine are in place", () => {
    expect(nextStep({ ...base, engineReady: true, modelReady: true })).toBe("ready");
  });
  it("builds library voices whose id carries the language", () => {
    const v = wazobiaVoiceEntry("elder_deji", "yo");
    expect(v).toMatchObject({ id: "elder_deji@yo", name: "Elder Deji (Yoruba)", provider: "wazobia", language: "Yoruba" });
    expect(WAZOBIA_VOICES).toHaveLength(13);
  });
  it("explains fixable failures in plain words", () => {
    expect(installHint("Hugging Face refused the request. Open the model page, accept its terms")).toMatch(/model page/);
    expect(installHint("Add your Hugging Face key in Settings first.")).toMatch(/token/);
    expect(installHint("Could not reach Hugging Face.")).toMatch(/internet/);
    expect(installHint("weird")).toMatch(/Try again/);
  });
});
