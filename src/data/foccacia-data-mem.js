let cache = [

    {
        id: 1,
        name: "TestGroup",
        description: "Group Created for Tests",
        teams: [{
            id: 529,
            season: 2021,
            leagueId: 140,
            name: "Barcelona",
            stadium: "Estadi Olímpic Lluís Companys"
        }],
        userId: 1
    }

]

let currentId = 1

function createGroup(name, description, user) {

    const id = currentId + 1
    const teams = []

    const group = {
        id: id,
        name: name,
        description: description,
        teams: teams,
        userId: user.id
    }

    cache.push(group)
    return Promise.resolve(group)
}

function getGroups() {
    return Promise.resolve(cache)
}

function getGroupById(id) {
    return Promise.resolve(cache.find(group => group.id == id))
}

function deleteGroupById(id) {
    cache = cache.filter(group => group.id != id)
    return Promise.resolve({id})
}

function addTeam(group, team) {
    group.teams.push(team)
    return Promise.resolve(group)
}

function removeTeamFromGroup(group, teamId, season, leagueId) {

    group.teams = group.teams.filter(team => team.id != teamId || team.season != season || team.leagueId != leagueId)

    return Promise.resolve(group)
}

function editGroupById(name, description, group) {

    group.name = name
    group.description = description

    return Promise.resolve(group)
}

export const data = {
    createGroup,
    getGroups,
    getGroupById,
    deleteGroupById,
    addTeam,
    removeTeamFromGroup,
    editGroupById
}

export default data