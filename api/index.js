const axios = require('axios')
const cheerio = require('cheerio')

export default function handler(req, res) {
	const packageName = req.url.split('package/')[1]

	if (!packageName) {
		return res.status(400).send({ error: 'No package name provided' })
	}

	return axios
		.get(`https://www.npmjs.com/package/${packageName}`)
		.then((response) => {
			const $ = cheerio.load(response.data)
			const name = $('._50685029').text()
			const version = $('._76473bea').text().split(' •')[0]
			const weeklyDownloads = $('._9ba9a726').text()
			const updated = $('time')[0].attribs.datetime
			const updatedRelative = $('time')[0].children[0].data
			const repo = $('[aria-labelledby="repository"]')[0].attribs.href

			res.send({
				name: name,
				version: version,
				weeklyDownloads: parseInt(weeklyDownloads.replace(/,/g, '')),
				weeklyDownloadsStr: weeklyDownloads,
				updated: updated,
				updatedRelative: updatedRelative,
				repo: repo,
			})
		})
		.catch((error) => {
			res.status(500).send({
				error: error.message.includes('404')
					? 'Package not found'
					: error.message,
			})
		})
}
