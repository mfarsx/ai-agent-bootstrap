class CancelledError extends Error {
  constructor(message = "Cancelled") {
    super(message);
    this.name = "CancelledError";
    this.code = "CANCELLED";
  }
}

module.exports = {
  CancelledError,
};
