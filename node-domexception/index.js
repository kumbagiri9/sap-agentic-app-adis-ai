// Expose the native platform DOMException under modern Node.js versions (18+)
// This avoids downloading the deprecated npm package and suppresses deprecation warnings.
module.exports = globalThis.DOMException;
