function customError(message, code) {

    const error = new Error(message)
    error.code = code
    return error

}

function badRequest(message) {
    return customError(message, 1)
}

function notFound(message) {
    return customError(message, 2)
}

function unauthorized(message){
    return customError(message, 3)
}

function forbidden(message){
    return customError(message, 4)
}

export const error = {
    notFound,
    unauthorized,
    forbidden,
    badRequest
}

export default error