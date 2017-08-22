module.exports = class _Error extends Error {
  constructor(message, status) {
    super(message, status)
    this.name = status.toString()[0] === `4` ? `ClientError` : `ServerError`
    this.status = status
  }
} 