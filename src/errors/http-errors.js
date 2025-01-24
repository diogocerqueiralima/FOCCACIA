function handle(error) {

    let code;

    switch (error.code) {
        case 1:
            code = 400
            break;
        case 2:
            code = 404
            break;
        case 3:
            code = 401
            break;
        case 4:
            code = 403
            break;
        default:
            code = 500
            break;
    }

    return {
        statusCode: code,
        body: { message: error.message }
    }
    
}

export const httpError = {
    handle
}

export default httpError