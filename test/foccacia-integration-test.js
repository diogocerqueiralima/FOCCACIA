import request from 'supertest'
import express from 'express'
import { expect } from "chai";
import { describe } from "mocha";
import groupsData from '../src/data/foccacia-data-mem.js';
import usersData from '../src/data/foccacia-users-data-mem.js';
import fapiData from '../src/data/fapi-teams-data.js';
import { service } from '../src/services/foccacia-services.js';
import { _webApi } from '../src/foccacia-web-api.js';

const focacciaService = service(groupsData, fapiData, usersData)
const webApi = _webApi(focacciaService)

const token = 100

const app = express()
app.use(express.json())

app.get("/api/groups", webApi.getGroups)
app.get("/api/groups/:id", webApi.getGroupById)
app.post("/api/groups", webApi.createGroup)
app.put("/api/groups/:groupId/teams/:teamId/league/:leagueId/season/:season", webApi.addTeam)
app.delete("/api/groups/:groupId/teams/:teamId/league/:leagueId/season/:season", webApi.removeTeamFromGroup)
app.put("/api/groups/:id", webApi.editGroupById)
app.delete("/api/groups/:id", webApi.deleteGroupById)

describe("getGroups Integration Test", () => {

    it('get groups without send a token should fails', () => {

        return request(app)
            .get("/api/groups")
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(401)
            .then(response => expect(response.body).deep.equal({message: "Token undefined"}))        

    })

    it("get groups from user that doesn't exists should fails", () => {

        return request(app)
            .get("/api/groups")
            .set('Accept', 'application/json')
            .set('Authorization', 200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(401)
            .then(response => expect(response.body).deep.equal({message: "Invalid token"}))

    })

    it('get groups from user should succeeds', () => {

        const data = [
            {
                id: 1,
                name: 'TestGroup',
                description: 'Group Created for Tests',
                teams: [
                    {
                        id: 529,
                        season: 2021,
                        leagueId: 140,
                        name: "Barcelona",
                        stadium: "Estadi Olímpic Lluís Companys"
                    }
                ],
                userId: 1
            }
        ]

        return request(app)
            .get("/api/groups")
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(response => expect(response.body).deep.equal({message: "Groups retrieved successfully", data: data}))
    })

})

describe('getGroupById Integration Test', () => {

    it('get group without send a token should fails', () => {

        return request(app)
        .get(`/api/groups/1`)
            .set('Accept', 'application/json')
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(401)
            .then(response => expect(response.body).deep.equal({message: "Token undefined"}))        

    })

    it("get group from user that doesn't exists should fails", () => {

        return request(app)
            .get(`/api/groups/1`)
            .set('Accept', 'application/json')
            .set('Authorization', 200)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(401)
            .then(response => expect(response.body).deep.equal({message: "Invalid token"}))

    })

    it('get group by id should succeeds', () => {

        const data = {
            id: 1,
            name: 'TestGroup',
            description: 'Group Created for Tests',
            teams: [
                {
                    id: 529,
                    season: 2021,
                    leagueId: 140,
                    name: "Barcelona",
                    stadium: "Estadi Olímpic Lluís Companys"
                }
            ],
            userId: 1
        }

        return request(app)
            .get(`/api/groups/1`)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(response => expect(response.body).deep.equal({message: "Group retrieved successfully", data: data}))

    })

    it('get group that the user is not the owner, should fails', () => {

        return request(app)
            .get(`/api/groups/1`)
            .set('Accept', 'application/json')
            .set('Authorization', 101)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(403)
            .then(response => expect(response.body).deep.equal({message: "This group is not yours"}))

    })

    it("get group that doesn't exists should fails", () => {

        return request(app)
            .get(`/api/groups/100`)
            .set('Accept', 'application/json')
            .set('Authorization', token)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404)
            .then(response => expect(response.body).deep.equal({message: "Group not found"}))

    })

})

describe("createGroup Integration Test", () => {

    it('create a group without send a token should fails', () => {

        return request(app)
                .post("/api/groups")
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(401)
                .then(response => expect(response.body).deep.equal({message: "Token undefined"}))        

    })

    it('creating a group with a token that is not connected to a user should fail', () => {

        const data = {
            "name": "Grupo 01",
            "description": "As melhores equipas da Europa"
        }

        return request(app)
                .post("/api/groups")
                .set('Accept', 'application/json')
                .set('Authorization', 103)
                .send(data)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(401)
                .then(response => expect(response.body).to.deep.equal({ message: 'Invalid token' }))        
    })

    it('create a incorrect group should fails', () => {

        const data = {
            "name": "Grupo 01"
        }

        return request(app)
                .post("/api/groups")
                .set('Accept', 'application/json')
                .set('Authorization', 100)
                .send(data)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(400)
                .then(response => expect(response.body).to.deep.equal({ message: 'Name or Description undefined' }))        

    })

    it('create a group should succeeds', () => {

        const data = {
            "name": "Grupo 01",
            "description": "As melhores equipas da Europa"
        }

        return request(app)
                .post("/api/groups")
                .set('Accept', 'application/json')
                .set('Authorization', 102)
                .send(data)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(201)
                .then(response => expect(response.body).to.deep.equal(
                    {
                        message: 'Group created successfully',
                        data: {
                          id: 2,
                          name: 'Grupo 01',
                          description: 'As melhores equipas da Europa',
                          teams: [],
                          userId: 3
                        }
                      }
                ))      

    })

})

describe("addTeam Integration Test", () => {

    const team = {
        id: 529,
        season: 2021,
        leagueId: 140,
        name: "Barcelona",
        stadium: "Estadi Olímpic Lluís Companys"
    }

    it('add a team without send a token should fails', () => {

        return request(app)
                .put("/api/groups/2/teams/" + team.id + "/league/" + team.leagueId + "/season/" + team.season)
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(401)
                .then(response => expect(response.body).deep.equal({message: "Token undefined"}))        

    })

    it('adding a team with a token that is not connected to a user should fail', () => {

        return request(app)
                .put("/api/groups/2/teams/" + team.id + "/league/" + team.leagueId + "/season/" + team.season)
                .set('Accept', 'application/json')
                .set('Authorization', 103)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(401)
                .then(response => expect(response.body).to.deep.equal({ message: 'Invalid token' }))        
    })

    it('add a team with wrong information should fails', () => {

        const wrongTeam = {
            id: 529,
            season: 2021,
            leagueId: -140,
            name: "Barcelona",
            stadium: "Estadi Olímpic Lluís Companys"
        }  

        return request(app)
                .put("/api/groups/2/teams/" + wrongTeam.id + "/league/" + wrongTeam.leagueId + "/season/" + wrongTeam.season)
                .set('Accept', 'application/json')
                .set('Authorization', 102)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(400)
                .then(response => expect(response.body).to.deep.equal({ message: "Football API doesn't found a team with this id, season and league" }))        

    })

    it('add a duplicated team to a group should fails', () => {
 

        return request(app)
                .put("/api/groups/1/teams/" + team.id + "/league/" + team.leagueId + "/season/" + team.season)
                .set('Accept', 'application/json')
                .set('Authorization', 100)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(400)
                .then(response => expect(response.body).to.deep.equal({ message: "This group already has this team" }))        

    })

    it('add a team should succeeds', () => {

        return request(app)
                .put("/api/groups/2/teams/" + team.id + "/league/" + team.leagueId + "/season/" + team.season)
                .set('Accept', 'application/json')
                .set('Authorization', 102)
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(200)
                .then(response => expect(response.body).to.deep.equal(
                    {
                        message: 'Team added successfully',
                        data: {
                          id: 2,
                          name: 'Grupo 01',
                          description: 'As melhores equipas da Europa',
                          teams: [{
                            id : "529",
                            image : "https://media.api-sports.io/football/venues/19939.png",
                            leagueId : "140",
                            leagueName : "La Liga",
                            name : "Barcelona",
                            season :  "2021",
                            stadium : "Estadi Olímpic Lluís Companys"
                          } ],
                          userId: 3
                        }
                      }
                ))      

    })

})

describe("removeTeamFromGroup Integration Test", () => {

    const team = {
        id: 529,
        season: 2021,
        leagueId: 140,
        name: "Barcelona",
        stadium: "Estadi Olímpic Lluís Companys"
    }

    const team2 = {
        id: 212,
        season: 2021,
        leagueId: 94,
        name: 'FC Porto',
        stadium: 'Estádio Do Dragão'
    }

    it("remove a team without send a token should fail", () => {
        return request(app)
                .delete("/api/groups/2/teams/" + team.id + "/league/" + team.leagueId + "/season/" + team.season)
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(401)
                .then(response => expect(response.body).deep.equal({message: "Token undefined"}))
    })

    it("removing a team with a token that is not connected to a user should fail", () => {
        return request(app)
            .delete("/api/groups/2/teams/" + team.id + "/league/" + team.leagueId + "/season/" + team.season)
            .set('Accept', 'application/json')
            .set('Authorization', 103)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(401)
            .then(response => expect(response.body).deep.equal({message: "Invalid token"}))
    })

    it("removing a team that is not in the group should fail", () => {
        return request(app)
            .delete("/api/groups/2/teams/" + team2.id + "/league/" + team2.leagueId + "/season/" + team2.season)
            .set('Accept', 'application/json')
            .set('Authorization', 102)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404)
            .then(response => expect(response.body).deep.equal({message: "Team not found"}))
    })

    it("remove a team should succed", () => {
        return request(app)
            .delete("/api/groups/2/teams/" + team.id + "/league/" + team.leagueId + "/season/" + team.season)
            .set('Accept', 'application/json')
            .set('Authorization', 102)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(response => expect(response.body).to.deep.equal(
                {
                    message: 'Team removed successfully',
                    data: {
                      id: 2,
                      name: 'Grupo 01',
                      description: 'As melhores equipas da Europa',
                      teams: [],
                      userId: 3
                    }
                  }
            ))      

    })

})

describe('editGroupById  Integration Test', () => {
        
    it('edit group without send token should fail', () => {
        return request(app)
            .put("/api/groups/2")
            .set('Accept', 'application/json')
            .send(
                {
                    name: "New Name",
                    description: "New Description"
                }
            )
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(401)
            .then(response => expect(response.body).deep.equal({message: "Token undefined"}))
    })

    it('edit group whithout permission should fail', () => {
        return request(app)
            .put("/api/groups/2")
            .set('Accept', 'application/json')
            .set('Authorization', 101)
            .send(
                {
                    name: "New Name",
                    description: "New Description"
                }
            )
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(403)
            .then(response => expect(response.body).deep.equal({message: "This group is not yours"}))
    })

    it("edit group that doesn't exists should fail", () => {
        return request(app)
            .put("/api/groups/10")
            .set('Accept', 'application/json')
            .set('Authorization', 102)
            .send(
                {
                    name: "New Name",
                    description: "New Description"
                }
            )
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404)
            .then(response => expect(response.body).deep.equal({message: "Group not found"}))
    })

    it("edit group with wrong parameters should fail", () => {
        return request(app)
            .put("/api/groups/2")
            .set('Accept', 'application/json')
            .set('Authorization', 102)
            .send(
                {
                    name: "New Name"
                }
            )
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(400)
            .then(response => expect(response.body).deep.equal({ message: "Name or description undefined" }))
    })

    it("edit group should succeeds", () => {
        return request(app)
            .put("/api/groups/2")
            .set('Accept', 'application/json')
            .set('Authorization', 102)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .send(
                {
                    name: "New Name",
                    description: "New Description"
                }
            )
            .then(response => expect(response.body).deep.equal(
                {
                    data: {
                        id: 2,
                        teams: [],
                        name: "New Name",
                        description: "New Description",
                        userId: 3
                    },
                    message: "Group edited successfully"
                }
            ))
    })

})

describe("deleteGroupById Integration Test", () => {

    it("delete a group without send a token should fail", () => {
        return request(app)
                .delete("/api/groups/2")
                .set('Accept', 'application/json')
                .expect('Content-Type', 'application/json; charset=utf-8')
                .expect(401)
                .then(response => expect(response.body).deep.equal({message: "Token undefined"}))
    })

    it('delete group whithout permission should fail', () => {
        return request(app)
            .delete("/api/groups/2")
            .set('Accept', 'application/json')
            .set('Authorization', 101)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(403)
            .then(response => expect(response.body).deep.equal({message: "This group is not yours"}))
    })

    it("delete group that doesn't exist should fail", () => {
        return request(app)
            .delete("/api/groups/10")
            .set('Accept', 'application/json')
            .set('Authorization', 102)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(404)
            .then(response => expect(response.body).deep.equal({message: "Group not found"}))
    })

    it("delete group should succeed", () => {
        return request(app)
            .delete("/api/groups/2")
            .set('Accept', 'application/json')
            .set('Authorization', 102)
            .expect('Content-Type', 'application/json; charset=utf-8')
            .expect(200)
            .then(response => expect(response.body).deep.equal(
                {
                    data: {
                        id: 2
                    },
                    message: "Group deleted successfully"
                }
            ))
    })

})