function newsUrl(id) {
  return `news.html?id=${id}`
}

function isValidNews(news) {
  if (!news) return false
  return (
    typeof news.title === 'string' && news.title.trim().length > 0 &&
    typeof news.resume === 'string' && news.resume.trim().length > 0
  )
}

function getImgNameFromBg(bg) {
  if (!bg) return null
  return bg
    .replace(/^url\(["']?/, '')
    .replace(/["']?\)$/, '')
    .split('/')
    .pop()
    .split('?')[0]
}

function sortNewsByDate(newsList) {
  return [...newsList].sort((a, b) => {
    const dateA = a.createdAt?.toMillis?.() ?? new Date(a.createdAt).getTime()
    const dateB = b.createdAt?.toMillis?.() ?? new Date(b.createdAt).getTime()
    return dateB - dateA
  })
}

function latestThree(newsList) {
  return sortNewsByDate(newsList).slice(0, 3)
}

module.exports = { newsUrl, isValidNews, getImgNameFromBg, sortNewsByDate, latestThree }
