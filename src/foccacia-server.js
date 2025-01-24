import express from "express"
//import groupsData from './data/foccacia-data-mem.js'
import { groupsData } from './data/foccacia-data-elastic.js'
import fapiData from './data/fapi-teams-data.js'
//import usersData from './data/foccacia-users-data-mem.js'
import { usersData } from './data/foccacia-users-data-elastic.js'
import { _webApi } from "./foccacia-web-api.js"
import { _webUi } from "./foccacia-web-ui.js"
import { service } from "./services/foccacia-services.js"
import expressSession from 'express-session'
import passport from 'passport'

const elastic = 'http://localhost:9200'
const focacciaService = service(groupsData(elastic), fapiData, usersData(elastic))
const webApi = _webApi(focacciaService);
const webUi = _webUi(focacciaService)

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended : false}))
app.use(express.static("./public"))
app.set('view engine', 'hbs');

 // PASSPORT

app.use(expressSession({secret : 'IPW 2023', resave : true, saveUninitialized : true}))
app.use(passport.initialize())
app.use(passport.session())

passport.serializeUser((user, done) => done(null, user))
passport.deserializeUser((user, done) => done(null, user))

app.use("/", (req, resp, next) => {

    const user = req.user
    if(user != undefined)
        req.headers.authorization = user.token
    next()
    
})

// API

app.get("/api/teams", webApi.getTeams)
app.get("/api/leagues", webApi.getLeagues)
app.get("/api/leagues/:teamId", webApi.getLeaguesByTeamId)
app.get("/api/teams/:id", webApi.getTeamDetails)
app.post("/api/groups", webApi.createGroup)
app.get("/api/groups", webApi.getGroups)
app.get("/api/groups/:id", webApi.getGroupById)
app.delete("/api/groups/:id", webApi.deleteGroupById)
app.post("/api/users", webApi.createUser)
app.put("/api/groups/:groupId/teams/:teamId/league/:leagueId/season/:season", webApi.addTeam)
app.delete("/api/groups/:groupId/teams/:teamId/league/:leagueId/season/:season", webApi.removeTeamFromGroup)
app.put("/api/groups/:id", webApi.editGroupById)

// UI

app.get("/", webUi.home)
app.get("/login", webUi.login)
app.post("/login", webUi.postLogin)
app.post("/logout", webUi.postLogout)
app.get("/register", webUi.register)
app.post("/register", webUi.postRegister)
app.get("/groups", webUi.getGroups)
app.get("/groups/:id/teams", webUi.getTeams)
//app.put("/groups/:id", webUi.editGroupById)
//app.delete("/groups/:id", webUi.deleteGroupById)
app.post("/groups", webUi.createGroup)
//app.put("/groups/:groupId/teams/:teamId/league/:leagueId/season/:season", webUi.addTeam)
//app.delete("/groups/:groupId/teams/:teamId/league/:leagueId/season/:season", webUi.removeTeam)

app.listen(9000, () => console.log("Listening..."))