// 通过传过来的歌单id拿到所有歌曲数据
// 支持传递参数limit来限制获取歌曲的数据数量 例如: /playlist/track/all?id=7044354223&limit=10

module.exports = (query, request) => {
  const playlistUrlPattern = /playlist\?id=(\d+)/;
  let playlistId = query.url;
  const urlMatch = playlistUrlPattern.exec(playlistId);
  if (urlMatch) {
    // 如果找到了匹配项，输出提取的歌单ID
    playlistId = urlMatch[1];
  }

  const data = {
    id: playlistId, // 歌单ID
    n: 100000,
    s: query.s || 8,
  }
  //不放在data里面避免请求带上无用的数据
  let limit = parseInt(query.limit) || Infinity
  let offset = parseInt(query.offset) || 0

  return request('POST', `https://music.163.com/api/v6/playlist/detail`, data, {
    crypto: 'api',
    cookie: query.cookie,
    proxy: query.proxy,
    realIP: query.realIP,
  }).then((res) => {
    let trackIds = res.body.playlist.trackIds
    let idsData = {
      c:
        '[' +
        trackIds
          .slice(offset, offset + limit)
          .map((item) => '{"id":' + item.id + '}')
          .join(',') +
        ']',
    }

    return request(
      'POST',
      `https://music.163.com/api/v3/song/detail`,
      idsData,
      {
        crypto: 'weapi',
        cookie: query.cookie,
        proxy: query.proxy,
        realIP: query.realIP,
      },
    )
  })
}
