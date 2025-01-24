import httpError from "./errors/http-errors.js";

export function _webApi(service) {

    function createUser(request, response){

        const body = request.body
        const username = body.username
        const password = body.password
    
        handleResponse(response, 201, "User created successfully", service.createUser(username, password))
    }
    
    function getTeams(request, response) {

        const name = request.query.name

        if (name) {
            handleResponse(response, 200, "Teams retrieved successfully", service.getTeamsByName(name))
            return
        }

        const leagueId = request.query.leagueId
        const season = request.query.season

        handleResponse(response, 200, "Teams retrieved successfully", service.getTeamsByLeagueIdAndSeason(season, leagueId))
    }

    function getTeamDetails(request, response) {
        
        const id = request.params.id

        handleResponse(response, 200, "Teams retrieved successfully", service.getTeamDetails(id))

    }
    
    function getLeaguesByTeamId(request, response) {
    
        const teamId = request.params.teamId

        handleResponse(response, 200, "Teams retrieved successfully", service.getLeaguesByTeamId(teamId))
    }
    
    function createGroup(request, response) {
    
        const body = request.body
        const name = body.name
        const description = body.description
        const token = request.header("Authorization")
    
        handleResponse(response, 201, "Group created successfully", service.createGroup(name, description, token))
    }
    
    function getGroups(request, response) {
    
        const token = request.header("Authorization")
    
        handleResponse(response, 200, "Groups retrieved successfully", service.getGroups(token))
    }
    
    function getGroupById(request, response) {
    
        const id = request.params.id
        const token = request.header("Authorization")
    
        handleResponse(response, 200, "Group retrieved successfully", service.getGroupById(id, token))
    }
    
    function deleteGroupById(request, response) {
    
        const id = request.params.id
        const token = request.header("Authorization")
    
        handleResponse(response, 200, "Group deleted successfully", service.deleteGroupById(id, token))
    }
    
    function addTeam(request, response) {
    
        const token = request.header("Authorization")
        const params = request.params
        const groupId = params.groupId
        const teamId = params.teamId
        const leagueId = params.leagueId
        const season = params.season
    
        handleResponse(response, 200, "Team added successfully", service.addTeam(groupId, teamId, season, leagueId, token))
    }
    
    function removeTeamFromGroup(request, response) {
    
        const token = request.header("Authorization")
        const params = request.params
        const groupId = params.groupId
        const teamId = params.teamId
        const leagueId = params.leagueId
        const season = params.season
    
        handleResponse(response, 200, "Team removed successfully", service.removeTeamFromGroup(groupId, teamId, season, leagueId, token))
    }

    function getLeagues(request, response) {
        
        const season = request.query.season

        handleResponse(response, 200, "Leagues retrieved successfully", service.getLeagues(season))

    }
    
    function editGroupById(request, response) {
    
        const body = request.body
        const name = body.name
        const description = body.description
        const id = request.params.id
        const token = request.header("Authorization")
    
        handleResponse(response, 200, "Group edited successfully", service.editGroupById(name, description, id, token))
    }

    return {
        getTeams,
        getLeaguesByTeamId,
        createGroup,
        getGroups,
        getGroupById,
        deleteGroupById,
        createUser,
        addTeam,
        removeTeamFromGroup,
        editGroupById,
        getLeagues,
        getTeamDetails
    }

}

function handleResponse(response, status, message, promise) {
    
    promise
        .then(data => {
            response.status(status).json({
                message,
                data
            })
        })
        .catch(error => {
            const http = httpError.handle(error)
            response.status(http.statusCode).json(http.body)
        })
}