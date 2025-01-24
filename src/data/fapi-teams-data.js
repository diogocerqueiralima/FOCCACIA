import { response } from "express"

const apiKey = "80879448a7db0e314e2270df46e575e5"

function getTeamsByName(name) {

    return fetch("https://v3.football.api-sports.io/teams?name=" + name, {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": apiKey
        }
    })
    .then(response => response.json())
    .then(data => {

        console.log(data)

        return {
            id: data.response[0].team.id,
            name: data.response[0].team.name,
            stadium: data.response[0].venue.name
        }

    })

}

function getLeaguesByTeamId(teamId) {

    return fetch("https://v3.football.api-sports.io/leagues?team=" + teamId, {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": apiKey
        }
    })
    .then(response => response.json())
    .then(data => {

        return {
            id: data.response[0].league.id,
            name: data.response[0].league.name
        }
    })

}

function getLeagueNameById(leagueId) {
    
    return fetch("https://v3.football.api-sports.io/leagues?id=" + leagueId, {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": apiKey
        }
    })
        .then(response => response.json())
        .then(data => data.response[0].league.name)

}

function getLeagues(season) {

    return fetch("https://v3.football.api-sports.io/leagues?season=" + season, {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": apiKey
        }
    })
        .then(response => response.json())
        .then(data => data.response.map(resp => {

            return {
                leagueId: resp.league.id,
                leagueName: resp.league.name
            }
        }))
    
}

function getTeamsByLeagueIdAndSeason(season, leagueId) {

    return fetch("https://v3.football.api-sports.io/teams?season=" + season + "&league=" + leagueId, {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": apiKey
        }
    })
    .then(response => response.json())
    .then(data => {

        return getLeagueNameById(leagueId)
                .then(leagueName => {

                    return data.response.map(entry => {

                        const teamName = entry.team.name
                        const stadiumName = entry.venue.name
                        const image = entry.venue.image
            
                            return {
                                id: entry.team.id,
                                season: season,
                                leagueName: leagueName,
                                leagueId: leagueId,
                                name: teamName,
                                stadium: stadiumName,
                                image: image
                            }

                        })

                })

        })

}

function getTeamByIdAndSeasonAndLeague(teamId, season, leagueId) {

    return fetch("https://v3.football.api-sports.io/teams?id=" + teamId + "&season=" + season + "&league=" + leagueId, {
        "method": "GET",
        "headers": {
            "x-rapidapi-key": apiKey
        }
    })
    .then(response => response.json())
    .then(data => {

        const teamName = data.response[0].team.name
        const stadiumName = data.response[0].venue.name
        const image = data.response[0].venue.image

        return getLeagueNameById(leagueId)
            .then(leagueName => {
                return {
                    id: teamId,
                    season: season,
                    leagueName: leagueName,
                    leagueId: leagueId,
                    name: teamName,
                    stadium: stadiumName,
                    image: image
                }
            })
            
    })

}

export const fapiData = {
    getTeamsByName,
    getLeaguesByTeamId,
    getTeamByIdAndSeasonAndLeague,
    getLeagues,
    getTeamsByLeagueIdAndSeason
}

export default fapiData