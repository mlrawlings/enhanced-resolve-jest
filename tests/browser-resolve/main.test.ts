import { x } from "./shimable/other";
import { y } from "./shimable/omit";

test("resolves browser files", () => {
  expect(x).toBe(1);
  expect(y).toBe(undefined);
});
