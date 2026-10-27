/**
 * Gate between the UI and the network layer. The application renders immediately (shell,
 * skeletons, static hero) while the mock service worker is still starting; every Axios request
 * and the Socket.IO connection wait for this promise, so no call escapes before interception
 * is in place. With mocks disabled the promise resolves right away.
 */
let readyPromise: Promise<void> = Promise.resolve()

export function setNetworkReady(promise: Promise<void>): void {
  readyPromise = promise.catch(() => undefined)
}

export function whenNetworkReady(): Promise<void> {
  return readyPromise
}
