function getDetailById(id: string) {
    return new Promise<string>((resolve, reject) => {
        setTimeout(() => {
            resolve('this is ' + id + ' son')
        }, 1000);
    })
}

export { getDetailById }