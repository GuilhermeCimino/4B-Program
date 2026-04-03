const axios = require("axios")

async function getFixtures() {
    const response = await axios.get(
        `https://v3.football.api-sports.io/fixtures?league=71&season=2022`,
        {
            headers: {
                "x-apisports-key": process.env.API_KEY
            }
        }
    )

    return response.data.response
}

module.exports = { getFixtures }


async function getFixtures(teamId) {
    console.log("🔥 CHAMANDO API FOOTBALL")

    const response = await axios.get(
        `https://v3.football.api-sports.io/fixtures?league=71&season=2022`,
        {
            headers: {
                "x-apisports-key": process.env.API_KEY
            }
        }
    )

    return response.data.response
}

module.exports = { getFixtures }