import { expect, it } from "vitest";
import { defaultPortraitCrop, normalizePortraitCrop } from "./portraitCrop";

it("normaliza o enquadramento de retrato sem perder alinhamentos nas extremidades", () => {
  expect(normalizePortraitCrop({ zoom: 9, focusX: 0, focusY: 100, outputSize: 768 })).toEqual({ zoom: 2.5, focusX: 0, focusY: 100, outputSize: 768 });
  expect(normalizePortraitCrop({ zoom: 0, focusX: -20, focusY: 120, outputSize: 420 })).toEqual({ ...defaultPortraitCrop, zoom: 1, focusX: 0, focusY: 100 });
});
