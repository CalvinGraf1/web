import { assert, expect } from "chai";
import {handleMove} from "../src/inputListener.js";

describe("Input listener", () => {
  it("Moving mouse to same position should not send message twice", () => {
    // TODO Test that, if moving mouse two times in a row so that the two positions belong te the same column, then only one message is sent to move the shape.
      let count = 0;
      const countCall = (...args) => {
        count++;
      }

      handleMove({offsetX: 0}, countCall);
      handleMove({offsetX: 0.10}, countCall);
      handleMove({offsetX: 100}, countCall);
      handleMove({offsetX: 0}, countCall);
      handleMove({offsetX: 0}, countCall);

      expect(count).to.equal(3);
  });
});
