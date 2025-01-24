import httpError from "./errors/http-errors.js"

export function _webUi(service) {

    function home(request, response){
        response.render("home", {authenticated : request.isAuthenticated()})
    }

    async function getGroups(request, response) {

        const token = request.headers.authorization

        try {
            const groups = await service.getGroups(token)

            response.render("groups", {groups, authenticated : request.isAuthenticated()})
        }catch(e) {
            const http = httpError.handle(e)
            response.status(http.statusCode).render("error", {error: http.body.message, authenticated : request.isAuthenticated()})
        }

    }

    /*async function editGroupById(request, response) {

        const token = request.headers.authorization

        try {
            const body = request.body
            const name = body.name
            const description = body.description
            const id = request.params.id
            const group = await service.editGroupById(name, description, id, token)

            //response.status(303).set('location', '/groups')
            //response.end()
            response.end()
        }catch(e) {
            console.log(e)
        }
    }

    async function deleteGroupById(request, response) {
    
        const token = request.headers.authorization

        try {
            const id = request.params.id
            const groupId = await service.deleteGroupById(id, token)
            response.redirect(303, '/groups')
        }catch(e) {
            console.log(e)
        }

        
    }*/

    async function createGroup(request, response) {
    
        const token = request.headers.authorization

        try {
            const body = request.body
            const name = body.name
            const description = body.description
            const group = await service.createGroup(name, description, token)

            //response.status(303).set('location', '/groups')
            //response.end()
            response.redirect(303, '/groups')
        }catch(e) {
            const http = httpError.handle(e)
            response.status(http.statusCode).render("error", {error: http.body.message, authenticated : request.isAuthenticated()})
        }
    }

    async function getTeams(request, response) {
        
        const token = request.headers.authorization

        try {

            const groupId = request.params.id
            const group = await service.getGroupById(groupId, token)
            const teams = group.teams

            response.render("groupTeams", {teams, authenticated : request.isAuthenticated()})
        }catch(e) {
            const http = httpError.handle(e)
            response.status(http.statusCode).render("error", {error: http.body.message, authenticated : request.isAuthenticated()})
        }

    }

    /*async function addTeam(request, response) {

        const token = request.headers.authorization

        try {

            const params = request.params
            const groupId = params.groupId
            const teamId = params.teamId
            const leagueId = params.leagueId
            const season = params.season

            await service.addTeam(groupId, teamId, season, leagueId, token)
            response.end()

        }catch(e) {
            console.log(e)
        }

    }

    async function removeTeam(request, response) {

        const token = request.headers.authorization

        try {

            const params = request.params
            const groupId = params.groupId
            const teamId = params.teamId
            const leagueId = params.leagueId
            const season = params.season

            await service.removeTeamFromGroup(groupId, teamId, season, leagueId, token)
            response.end()

        }catch(e) {
            console.log(e)
        }

    }*/

    function login(request, response) {
        response.render('login', {authenticated : request.isAuthenticated()})
    }

    function postLogin(req, resp){

        const username = req.body.username
        const password = req.body.password

        service
            .validateUser(username, password)
            .then(user => loginPassport(req,user))
            .then(()=>resp.redirect('/'))    
            .catch(()=>resp.status(401).render("home", {authenticated : req.isAuthenticated()}))

    }

    function postLogout(req, resp){
        req.logout(()=>resp.redirect('/'))
    }

    function loginPassport(req, user){

        return new Promise((resolve,reject) => {
            req.login(user, (error, result) =>{
                if(error) reject(error)
                else resolve(result)
            })
        })

    }

    function register(request, response) {
        response.render('register', {authenticated : request.isAuthenticated()})
    }

    async function postRegister(request, response) {

        const body = request.body
        const username = body.username
        const password = body.password

        try {
            await service.createUser(username, password)
            response.redirect(303, "/login")
        }catch(e) {
            const http = httpError.handle(e)
            response.status(http.statusCode).render("error", {error: http.body.message, authenticated : request.isAuthenticated()})
        }

    }

    return {
        home,
        getGroups,
        createGroup, 
        getTeams,
        login,
        postLogin,
        postLogout,
        loginPassport,
        register,
        postRegister
    }

}