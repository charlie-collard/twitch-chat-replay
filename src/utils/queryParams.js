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
    const formattedParam = key + "=" + value;
    if (window.location.search) {
        window.location.search = window.location.search.split("&").concat(formattedParam).join("&")
    } else {
        window.location.search = formattedParam
    }
}
