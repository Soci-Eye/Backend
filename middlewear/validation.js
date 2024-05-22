const dataMethods = ['body', 'params', 'query', 'headers']
export const validation = (schema) => {
    return (req, res, next) => {
        const validationErr = []
        dataMethods.forEach(key => {
            if (schema[key]) {
                console.log(key);
                const validationResult = schema[key].validate(req[key], { abortEarly: false })
                if (validationResult?.error?.details) {
                    validationErr.push(validationResult.error.details)
                } 
            }
        })
        if (validationErr.length) {
            res.json({ message: "validation error", err: validationErr })
        } else {
            next()
        }
    }
}