export const getQueryParam = (key) => {
    const resultPair : Array = window.location.search
        .slice(1)
        .split("&").map((pair) => pair.split("="))
        .filter((pair) => pair[0] === key)[0]
    if (resultPair) {
        return resultPair[1] || null
    }
    return null
}

export const setQueryParam = (key, value) => {
    window.location.search = window.location.search.split("&").concat(key + "=" + value).join("&")
}
