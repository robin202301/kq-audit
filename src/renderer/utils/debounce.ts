/**
 * Debounce function to limit how often a function can be called
 * @param func The function to debounce
 * @param wait Milliseconds to wait before calling
 * @param immediate Whether to call immediately on first invocation
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function (this: any, ...args: Parameters<T>): void {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }

    const callNow = immediate && !timeout
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)

    if (callNow) func.apply(this, args)
  }
}

/**
 * Debounce function that returns a promise
 * @param func The async function to debounce
 * @param wait Milliseconds to wait before calling
 */
export function debounceAsync<T extends (...args: any[]) => Promise<any>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeout: ReturnType<typeof setTimeout> | null = null
  let currentResolve: ((value: ReturnType<T>) => void) | null = null

  return function (this: any, ...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout)
        if (currentResolve) {
          currentResolve(null as any) // 取消之前的Promise
        }
      }

      timeout = setTimeout(async () => {
        try {
          const result = await func.apply(this, args)
          resolve(result)
        } catch (error) {
          resolve(Promise.reject(error))
        }
      }, wait)

      currentResolve = resolve
    })
  }
}