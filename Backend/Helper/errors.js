const createError = (name, message, statusCode) => {
    const err = new Error(message);
    err.name = name;
    err.statusCode = statusCode;
    return err;
};

const notFound = (msg = "Resource not found") =>
    createError("NotFoundError", msg, 404);

const validation = (msg = "Invalid request") =>
    createError("ValidationError", msg, 400);

const provider = (provider, msg = "Provider Error") =>
    createError("ProviderError", `[${provider}] ${msg}`, 502);

const appError = (msg = "Internal Server error") =>
    createError("AppError", msg, 500);

module.exports = {
    notFound,
    validation,
    provider,
    appError,
};
