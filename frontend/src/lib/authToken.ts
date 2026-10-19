const storageKey = "access_token"

export function getAccessToken(): string | null {
    return localStorage.getItem(storageKey)
}

export function setAccessToken(token: string) {
    localStorage.setItem(storageKey, token)
}

export function clearAccessToken() {
    localStorage.removeItem(storageKey)
}
