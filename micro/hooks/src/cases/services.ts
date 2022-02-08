function getDetailById(id: string) {
  return new Promise<string>((resolve, reject) => {
    setTimeout(() => {
      resolve('this is ' + id + ' son');
    }, 500);
  });
}

export { getDetailById };
