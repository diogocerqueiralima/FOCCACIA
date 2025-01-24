window.addEventListener("load", teamsHandler)

function teamsHandler() {
    
    const seasonInput = document.querySelector("#season")
    seasonInput.addEventListener("input", seasonInputHandler)

    const button = document.querySelector("#addTeam")
    button.addEventListener("click",  buttonHandler)

    const removeButtons = document.querySelectorAll(".remove")
    removeButtons.forEach(b => {
        b.addEventListener("click", (e) => removeTeamHandler(e, b.getAttribute("teamid"), b.getAttribute("leagueid"), b.getAttribute("season")))
    })

}

function removeTeamHandler(event, teamId, leagueId, season) {

    const groupId = getGroupId()

    fetch(`http://localhost:9000/api/groups/${groupId}/teams/${teamId}/league/${leagueId}/season/${season}`, {
        method: 'DELETE'
    })
    .then(response => window.location.href = `/groups/${groupId}/teams`)
}

function buttonHandler(event) {

    const groupId = getGroupId()
    const seasonInput = document.querySelector("#season")
    const leagueSelector = document.querySelector("#leagues")
    const teamsSelector = document.querySelector("#teams")
    const leagueId = leagueSelector.value
    const season = seasonInput.value
    const teamId = teamsSelector.value

    fetch(`http://localhost:9000/api/groups/${groupId}/teams/${teamId}/league/${leagueId}/season/${season}`, {
        method: 'PUT'
    })
    .then(response => window.location.href = `/groups/${groupId}/teams`)

}

function seasonInputHandler(event) {
    
    const season = event.target.value
    const div = document.querySelector("#theLeague")

    if (season.length != 4){
        document.querySelector("#addTeam").disabled = true
        return
    }

    fetch("http://localhost:9000/api/leagues?season=" + season)
        .then(response => response.json())
        .then(resp => {

            const leagues = resp.data

            if (leagues.length == 0){
                
                div.innerHTML = `
                    <select size="1">
                        <option value="" disabled selected>Select a League</option>
                    </select>    
                `

                const teamsSelector = document.querySelector("#theTeam")
                teamsSelector.innerHTML = `
                    <select size="1">
                        <option value="" disabled selected>Select a Team</option>
                    </select>
                `

                return
            }

            let html = `
                <select id="leagues" name="leagues" size=1>
            `

            leagues.forEach(element => {
                html = html + `<option value="${element.leagueId}">${element.leagueName}</option>`
            });

            html += `</select>`

            div.innerHTML = html

            const selector = document.querySelector("#leagues")
            selector.addEventListener('change', (e) => leagueChangeHandle(e, season))
            const leagueId = selector.value
            getTeams(season, leagueId)

        })
}

function leagueChangeHandle(event, season) {

    const leagueId = event.target.value
    getTeams(season, leagueId)

}

function getTeams(season, leagueId) {

    fetch(`http://localhost:9000/api/teams?season=${season}&leagueId=${leagueId}`)
        .then(response => response.json())
        .then(resp => {

            const teams = resp.data
            const div = document.querySelector("#theTeam")

            if (teams.length == 0)
                return

            let html = `
                <select id="teams" name="teams" size=1>
            `

            teams.forEach(element => {
                html = html + `<option value="${element.id}">${element.name}</option>`
            });

            html += `</select>`

            div.innerHTML = html

        })
        .then(resp => document.querySelector("#addTeam").disabled = false)

}

function getGroupId() {

    const pathname = window.location.pathname;
    const parts = pathname.split('/');
    const groupIndex = parts.indexOf('groups') + 1;
    
    return parts[groupIndex];
}