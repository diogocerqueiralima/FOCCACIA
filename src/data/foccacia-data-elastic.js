export function groupsData(url) {

    async function createGroup(name, description, user) {

        const teams = []
    
        const group = {
            name: name,
            description: description,
            teams: teams,
            userId: user.id
        }
    
        const response = await fetch(`${url}/groups/_doc?refresh=wait_for`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(group)
        })
        
        const data = await response.json()
    
        group.id = data._id
        return group
    }
    
    async function getGroupById(id) {
        const response = await fetch(`${url}/groups/_doc/${id}`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    
        if(!response.ok)
            return undefined
    
        const data = await response.json()
    
        const group = data._source
        group.id = data._id
    
        return group
    }
    
    async function getGroups(){
        const response = await fetch(`${url}/groups/_search`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
    
        if(!response.ok)
            return []
    
        const data = await response.json()
    
        const groups = data.hits.hits.map(g => {
            const group = g._source
            group.id = g._id
            return group
        })
    
        return groups
    }
    
    async function deleteGroupById(id) {
        const response = await fetch(`${url}/groups/_doc/${id}?refresh=wait_for`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
    
        return {id}
    }

    async function editGroupById(name, description, group) {
        const newGroup = {
            name: name,
            description: description,
            teams: group.teams,
            userId: group.userId
        }

        const response = await fetch(`${url}/groups/_doc/${group.id}?refresh=wait_for`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newGroup)
        })
    
        newGroup.id = group.id
        return newGroup
    }
    
    async function addTeam(group, team) {
        group.teams.push(team)
        const newGroup = {
            name: group.name,
            description: group.description,
            teams: group.teams,
            userId: group.userId
        }

        const response = await fetch(`${url}/groups/_doc/${group.id}?refresh=wait_for`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newGroup)
        })
    
        newGroup.id = group.id
        return newGroup
    }

    async function removeTeamFromGroup(group, teamId, season, leagueId) {
        group.teams = group.teams.filter(team => team.id != teamId || team.season != season || team.leagueId != leagueId)
        const newGroup = {
            name: group.name,
            description: group.description,
            teams: group.teams,
            userId: group.userId
        }

        const response = await fetch(`${url}/groups/_doc/${group.id}?refresh=wait_for`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newGroup)
        })
    
        newGroup.id = group.id
        return newGroup
        
    }

    return {
        createGroup,
        getGroupById,
        getGroups,
        deleteGroupById,
        editGroupById,
        addTeam,
        removeTeamFromGroup
    }

}