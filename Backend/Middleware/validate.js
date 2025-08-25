const { z } = require("zod");

const validate = (schema) => (req, res, next) => {
    try {
        if (schema.body) req.body = schema.body.parse(req.body);

        if (schema.query) req.body = schema.query.parse(req.query);

        if (schema.params) req.params = schema.params.parse(req.params);

        return next();
    } catch (error) {
        return res.status(400).json({
            error: "Validation error",
            details:
                error.errors?.map((e) => ({
                    path: e.path,
                    message: e.message,
                })) || [],
        });
    }
};

module.exports = validate;
