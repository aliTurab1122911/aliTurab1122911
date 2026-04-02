function isDbUnavailable(error) {
  return error && error.message === 'DB_UNAVAILABLE';
}

module.exports = { isDbUnavailable };
