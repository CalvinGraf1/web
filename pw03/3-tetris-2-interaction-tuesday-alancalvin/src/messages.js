/**
 * Parent class for all messages used to communicate between server and client.
 */
export class Message {
  constructor(data) {
    this.data = data;
  }
}

/**
 * Message describing a request by the client to rotate their shape
 */
export class RotateMessage extends Message {


  /**
   * @param {String} direction The direction of rotation : either "left" or "right".
   */
  constructor(direction) {
    // TODO
    super(direction);
  }

  getDirection() {
    // TODO
    return this.data;
  }
}

/**
 * Message describing a request by the client to move their shape.
 */
export class MoveMessage extends Message {
  /**
   * @param {Number} col The column the shape should be moved to.
   */
  constructor(col) {
    // TODO
    super(col);
  }

  getCol() {
    // TODO
    return this.data;
  }
}

/**
 * Message describing a request by the client to drop their shape.
 */
export class DropMessage extends Message {
  constructor() {
    // TODO
    super();
  }
}
