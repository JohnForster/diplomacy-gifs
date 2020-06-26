const to = <T, U = Error>(promise: Promise<T>): Promise<[null, T] | [U]> =>
  promise
    .then<[null, T]>((res) => [null, res])
    .catch<[U]>((e) => [e]);

export default to;
