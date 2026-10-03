export class ApiError extends Error {

    constructor({
        message,
        status = null,
        code = null,
        data = null,
        isNetworkError = false,
        originalError = null,
    }) {

        super(message);

        this.name = "ApiError";

        this.status = status;

        this.code = code;

        this.data = data;

        this.isNetworkError =
            isNetworkError;

        this.originalError =
            originalError;
    }
}