export async function getDailyBackgroundUrl() {
    const data = await (
        (await fetch('https://cn.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1'))
            .json()
    )
    return 'https://www.bing.com' + data.images[0].url
}