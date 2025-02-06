export function ErrorHandler(err, req, res, next) {
    if(res.headersSent) {
        console.log('error:- ', err.message);
        return next();
    }

    return res
    .status(err.status || 500)
    .json({
        error: err.message || 'Something went wrong',
        code: err.status
    }) 
}