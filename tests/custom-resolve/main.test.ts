import { x } from "./shimable/other";

test("resolves custom files", () => {
  expect(x).toBe(1);
});
