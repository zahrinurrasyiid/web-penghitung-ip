function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  const message = error.publicMessage || error.message || "Terjadi kesalahan server.";
  if (status >= 500) {
    console.error(error);
  }
  res.status(status).json({ message });
}

module.exports = errorHandler;
