export enum HttpStatusCode {
    BadRequest = 400,
    Unauthorized = 401,
    PaymentRequired = 402,
    Forbidden = 403,
    NotFound = 404,
    MethodNotAllowed = 405,
    NotAcceptable = 406,
    RequestTimeout = 408,
    Conflict = 409,
    Gone = 410,
    PayloadTooLarge = 413,
    UnsupportedMediaType = 415,
    TooManyRequests = 429,
    InternalServerError = 500,
    NotImplemented = 501,
    BadGateway = 502,
    ServiceUnavailable = 503,
    GatewayTimeout = 504,
}

export const responseError = (status: HttpStatusCode, info?: Object | unknown, data?: Object): Record<string, any> => {
    let message;
    switch (status) {
        case HttpStatusCode.BadRequest:
            message = 'Bad Request';
            break;
        case HttpStatusCode.Unauthorized:
            message = 'Unauthorized';
            break;
        case HttpStatusCode.PaymentRequired:
            message = 'Payment Required';
            break;
        case HttpStatusCode.Forbidden:
            message = 'Forbidden';
            break;
        case HttpStatusCode.NotFound:
            message = 'Not Found';
            break;
        case HttpStatusCode.MethodNotAllowed:
            message = 'Method Not Allowed';
            break;
        case HttpStatusCode.NotAcceptable:
            message = 'Not Acceptable';
            break;
        case HttpStatusCode.RequestTimeout:
            message = 'Request Timeout';
            break;
        case HttpStatusCode.Conflict:
            message = 'Conflict';
            break;
        case HttpStatusCode.Gone:
            message = 'Gone';
            break;
        case HttpStatusCode.PayloadTooLarge:
            message = 'Payload Too Large';
            break;
        case HttpStatusCode.UnsupportedMediaType:
            message = 'Unsupported Media Type';
            break;
        case HttpStatusCode.TooManyRequests:
            message = 'Too Many Requests';
            break;
        case HttpStatusCode.InternalServerError:
            message = 'Internal Server Error';
            break;
        case HttpStatusCode.NotImplemented:
            message = 'Not Implemented';
            break;
        case HttpStatusCode.BadGateway:
            message = 'Bad Gateway';
            break;
        case HttpStatusCode.ServiceUnavailable:
            message = 'Service Unavailable';
            break;
        case HttpStatusCode.GatewayTimeout:
            message = 'Gateway Timeout';
            break;
        default:
            message = 'Unknown Error';
    }
    const response = {
        result: 'error',
        status,
        message,
        info,
        data,
    };
    return response;
};

export const BadRequestResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.BadRequest, info, data);
};
export const UnauthorizedResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.Unauthorized, info, data);
};

export const PaymentRequiredResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.PaymentRequired, info, data);
};

export const ForbiddenResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.Forbidden, info, data);
};

export const NotFoundResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.NotFound, info, data);
};

export const MethodNotAllowedResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.MethodNotAllowed, info, data);
};

export const NotAcceptableResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.NotAcceptable, info, data);
};

export const RequestTimeoutResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.RequestTimeout, info, data);
};

export const ConflictResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.Conflict, info, data);
};

export const GoneResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.Gone, info, data);
};

export const PayloadTooLargeResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.PayloadTooLarge, info, data);
};

export const UnsupportedMediaTypeResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.UnsupportedMediaType, info, data);
};

export const TooManyRequestsResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.TooManyRequests, info, data);
};

export const InternalServerErrorResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.InternalServerError, info, data);
};

export const NotImplementedResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.NotImplemented, info, data);
};

export const BadGatewayResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.BadGateway, info, data);
};

export const ServiceUnavailableResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.ServiceUnavailable, info, data);
};

export const GatewayTimeoutResponseError = (info?: Object | unknown, data?: Object): Record<string, any> => {
    return responseError(HttpStatusCode.GatewayTimeout, info, data);
};
