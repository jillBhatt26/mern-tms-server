const errorHandlerMiddleware = async (err, req, res, next) => {
    const { status, message } = err;

    return res.status(status || 500).json({ success: false, error: message });
};

module.exports = errorHandlerMiddleware;
