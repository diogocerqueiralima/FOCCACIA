import error from "../errors/foccacia-errors.js";
import bcrypt from 'bcrypt';

export function service(data, fapiData, users) {

    function getUserByToken(token) {

        return users.getUserByToken(token)
            .then(user => {
    
                if (user === undefined)
                    return Promise.reject(error.unauthorized("Invalid token"))
    
                return user
            })
    
    }
    
    function createUser(username, password){

        if(username == undefined || /^\s*$/.test(username) || password == undefined || /^\s*$/.test(password))
            return Promise.reject(error.badRequest("Invalid username or password"))

        return users.getUserByName(username)
            .then(user => {

                if (user != undefined)
                    return Promise.reject(error.badRequest("User already exists"))

                return bcrypt.hash(password, 12)
                        .then(hash => users.createUser(username, hash))
            })
        
    }

    function validateUser(username, password) {

        return users.getUserByName(username)
            .then((user) => {

                return bcrypt.compare(password, user.password)
                    .then((result) => {
                        if(!result)
                            return Promise.reject(error.unauthorized("Incorrect password"))
                        return {username:user.userName, token: user.token}
                    })

            })

    }
    
    function getLeagues(season) {

        if (season == undefined) 
            return Promise.reject(error.badRequest("Season undefined"))

        return fapiData.getLeagues(season) 
    }

    function getTeamsByLeagueIdAndSeason(season, leagueId) {

        if (season == undefined || leagueId == undefined) 
            return Promise.reject(error.badRequest("Season undefined"))

        return fapiData.getTeamsByLeagueIdAndSeason(season, leagueId)
    }

    function getTeamsByName(name) {
    
        if (name === undefined)
            return Promise.reject(error.badRequest("Name undefined"))
    
        return fapiData.getTeamsByName(name)
    }
    
    function getLeaguesByTeamId(teamId) {
    
        if (teamId === undefined)
            return Promise.reject(error.badRequest("Team ID undefined"))
    
        return fapiData.getLeaguesByTeamId(teamId)
    }
    
    function createGroup(name, description, token) {
    
        if (token === undefined)
            return Promise.reject(error.unauthorized("Token undefined"))
    
        if (name === undefined || /^\s*$/.test(name) || description === undefined || /^\s*$/.test(description))
            return Promise.reject(error.badRequest("Name or Description undefined"))
    
        return getUserByToken(token)
                .then(user => data.createGroup(name, description, user))
    }
    
    function getGroups(token) {
    
        if (token === undefined)
            return Promise.reject(error.unauthorized("Token undefined"))

        return getUserByToken(token)
                .then(user => data.getGroups().then(groups => groups.filter(group => group.userId == user.id)))
    
    }
    
    function getGroupById(id, token) {
    
        if (token === undefined)
            return Promise.reject(error.unauthorized("Token undefined"))
    
        if (id === undefined)
            return Promise.reject(error.badRequest("Group ID undefined"))
    
        return getUserByToken(token)
                .then(user => {
    
                    return data.getGroupById(id)
                        .then(group => {
    
                            if (group === undefined)
                                return Promise.reject(error.notFound("Group not found"))
    
                            if (group.userId != user.id)
                                return Promise.reject(error.forbidden("This group is not yours"))
                        
                            return group
                        })
    
                })
    
    }
    
    function deleteGroupById(id, token) {    

        return getGroupById(id, token)
                .then(group => data.deleteGroupById(group.id))

    }

    function editGroupById(name, description, id, token){

        if (name == undefined || description == undefined)
            return Promise.reject(error.badRequest("Name or description undefined"))
    
        return getGroupById(id, token)
            .then(group => data.editGroupById(name, description, group))
    
    }
    
    function addTeam(groupId, teamId, season, leagueId, token) {
    
        if (teamId === undefined || season === undefined || leagueId === undefined)
            return Promise.reject(error.badRequest("Team ID, season or League ID undefined"))

        return getGroupById(groupId, token)
            .then(group => {

                if (group.teams.find(team => team.id == teamId && team.season == season && team.leagueId == leagueId) != undefined)
                    return Promise.reject(error.badRequest("This group already has this team"))

                return fapiData.getTeamByIdAndSeasonAndLeague(teamId, season, leagueId)
                            .then(team => data.addTeam(group, team))
                            .catch(e => Promise.reject(error.badRequest("Football API doesn't found a team with this id, season and league")))
            })
    
    }
    
    function removeTeamFromGroup(groupId, teamId, season, leagueId, token) {
    
        if (teamId === undefined || season === undefined || leagueId === undefined)
            return Promise.reject(error.badRequest("Team ID, season or League ID undefined"))

        return getGroupById(groupId, token)
            .then(group => {

                if (group.teams.find(team => team.id == teamId && team.season == season && team.leagueId == leagueId) == undefined)
                    return Promise.reject(error.notFound("Team not found"))

                return data.removeTeamFromGroup(group, teamId, season, leagueId)
            })
    
    }

    return {
        getUserByToken,
        getTeamsByName,
        getLeaguesByTeamId,
        createGroup,
        getGroups,
        getGroupById,
        deleteGroupById,
        createUser,
        validateUser,
        addTeam,
        removeTeamFromGroup,
        editGroupById,
        getLeagues,
        getTeamsByLeagueIdAndSeason
    }

}