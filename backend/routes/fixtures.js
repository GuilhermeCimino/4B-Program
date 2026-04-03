const express = require("express")
const router = express.Router()
const { getFixtures } = require("../services/apiFootball")

const TIME_REAL_ID = 121

router.get("/", async (req, res) => {
    try {
        const data = await getFixtures()

        const jogos = data
            .filter(j => 
                j.teams.home.id === TIME_REAL_ID ||
                j.teams.away.id === TIME_REAL_ID
            )
            .map(jogo => {

                //  mudar data (2022 → 2026)
                const novaData = new Date(jogo.fixture.date)
                novaData.setFullYear(2026)
                jogo.fixture.date = novaData

                //  trocar time real pelo nosso
                if (jogo.teams.home.id === TIME_REAL_ID) {
                    jogo.teams.home.name = "H4 FC"
                    jogo.teams.home.logo = "/midia/logo.png"
                }

                if (jogo.teams.away.id === TIME_REAL_ID) {
                    jogo.teams.away.name = "H4 FC"
                    jogo.teams.away.logo = "/midia/logo.png"
                }

                return jogo
            })

        res.json(jogos)

    } catch (err) {
        console.log(err)
        res.status(500).json({ erro: "Erro ao buscar jogos" })
    }
})

module.exports = router