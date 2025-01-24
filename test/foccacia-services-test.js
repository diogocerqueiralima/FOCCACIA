import { expect } from "chai";
import { describe } from "mocha";
import { service } from "../src/services/foccacia-services.js";
import data from "../src/data/foccacia-data-mem.js";
import users from "../src/data/foccacia-users-data-mem.js"

function getTeamsByName(name) {

    return {
        id: 2,
        name: "Atlético Clube do Cacém",
        stadium: "Estádio do Cacém"
    }

}

function getLeaguesByTeamId(teamId) {

    return {
        id: 1,
        name: "Primeira Liga"
    }

}

function getTeamByIdAndSeasonAndLeague(teamId, season, leagueId) {

    if (teamId == 1)
        return Promise.reject()

    if (teamId == 212)
        return Promise.resolve({
            id: 212,
            season: 2021,
            leagueId: 94,
            name: 'FC Porto',
            stadium: 'Estádio Do Dragão'
        })

    return Promise.resolve({
        id: 529,
        season: 2021,
        leagueId: 140,
        name: "Barcelona",
        stadium: "Estadi Olímpic Lluís Companys"
    })

}

const fapiData = {
    getTeamsByName,
    getLeaguesByTeamId,
    getTeamByIdAndSeasonAndLeague
}

const foccaciaService = service(data, fapiData, users)

const userTest = {
    id: 1,
    userName: "TestUser",
    password: "$2b$10$2kWKZARpv.qx2aTimCUgA.km0fpoQGA7ad3JDDUFq35XOudzQVkqC",
    token: 100
}

const userTest2 = {
    id: 2,
    username: "TestUser2",
    password: "$2b$12$9nI62/f3WuGOrdT27SeeN.d3yuqWfyoDR0/a4NReBwaAOEwzJC7ji",
    token: 101
}

const groupTest = {
    id: 1,
    name: "TestGroup",
    description: "Group Created for Tests",
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

describe("getUserByToken", () => {

    it("if token is undefined should returns unauthorized", () => {
        return foccaciaService.getUserByToken()
                .catch(error => expect(error.code).to.equal(3))
    });

    it("if token is valid should returns a valid user", () => {
        return foccaciaService.getUserByToken(userTest.token)
                .then(user => expect(user).to.deep.equal(userTest))
    });

    it("if token is not associated to any user should returns unauthorized", () => {
        return foccaciaService.getUserByToken(102)
                .catch(error => expect(error.code).to.equal(3))
    });

});

describe("createUser", () => {

    it("if username is undefined should returns bad request", () => {
        return foccaciaService.createUser()
                .catch(error => expect(error.code).to.equal(1))
    })

    it("if already exists a user with this username should returns bad request", () => {
        return foccaciaService.createUser("TestUser", "teste")
                .catch(error => expect(error.code).to.equal(1))
    })

    it("create a user with only empty chars should returns bad request", () => {
        return foccaciaService.createUser("    ", "teste")
                .catch(error => expect(error.code).to.equal(1))
    })

    it("create a user with valid username should returns a token", () => {
        return foccaciaService.createUser("Carlos123", "teste")
                .then(obj => obj.token.length == 36)
    })

});

describe("getGroups", () => {

    it("if token is undefined should returns unauthorized", () => {
        return foccaciaService.getGroups()
                .catch(error => expect(error.code).to.equal(3))
    });

    it("if the token is valid, it must return the user groups to which this token is associated", () => {
        return foccaciaService.getGroups(userTest.token)
                .then(groups => expect(groups).to.deep.equal([groupTest]))
    });

    it("if token is not associated to any user should returns unauthorized", () => {
        return foccaciaService.getGroups(123)
                .catch(error => expect(error.code).to.equal(3))
    });

    it("if token is valid but the user has not any group should returns an empty array", () => {
        return foccaciaService.getGroups(userTest2.token)
                .then(groups => expect(groups).to.deep.equal([]))
    })

});

describe("getGroupById", () => {

    it("if token is undefined should returns unauthorized", () => {
        return foccaciaService.getGroupById()
                .catch(error => expect(error.code).to.equal(3))
    });

    it("if the token is valid and the group exists and the user is the owner of this group, it must return the group", () => {
        return foccaciaService.getGroupById(groupTest.id, userTest.token)
                .then(group => expect(group).to.deep.equal(groupTest))
    });

    it("if group id is undefined should return bad request", () => {
        return foccaciaService.getGroupById(undefined, userTest.token)
                .catch(error => expect(error.code).to.equal(1))
    });

    it("if token is valid but there is no group with this id should return not found", () => {
        return foccaciaService.getGroupById(-1, userTest.token)
                .catch(error => expect(error.code).to.equal(2))
    });

    it("if token is valid and group id is valid but the user is not the owner of this group should return forbidden", () => {
        return foccaciaService.getGroupById(1, userTest2.token)
                .catch(error => expect(error.code).to.equal(4))
    });

});

describe("createGroup", () => {

    it("if token is invalid should returns unauthorized", () => {
        return foccaciaService.createGroup()
                .catch(error => expect(error.code).to.equal(3))
    });

    it("if all parameters are valid should create a group and returns itself", () => {
        return foccaciaService.createGroup("Group1", "description", userTest.token)
                .then(group => {
                    expect(group).to.have.property("name", "Group1")
                    expect(group).to.have.property("description", "description")
                    expect(group).to.have.property("userId", 1)
                })
    });

    it("if any parameter is undefined should return bad request", () => {
        return foccaciaService.createGroup("Group1", undefined, 123)
                .catch(error => expect(error.code).to.equal(1))
    });

});

describe("addTeam", () => {

    it("if token is invalid should return unauthorized", () => {
        return foccaciaService.addTeam(1, 212, 2021, 94)
                .catch(error => expect(error.code).to.equal(3))
    });

    it("if any parameter is invalid should return bad request", () => {
        return foccaciaService.addTeam(undefined, undefined, undefined, undefined, userTest.token)
                .catch(error => expect(error.code).to.equal(1))
    });

    it("if group id doesn't exists should return not found", () => {
        return foccaciaService.addTeam(-1, groupTest.teams[0].id, groupTest.teams[0].season, groupTest.teams[0].leagueId, userTest.token)
                .catch(error => expect(error.code).to.equal(2))
    });

    it("if user is not the owner of the group should return forbidden", () => {
        return foccaciaService.addTeam(groupTest.id, groupTest.teams[0].id, groupTest.teams[0].season, groupTest.teams[0].leagueId, userTest2.token)
                .catch(error => expect(error.code).to.equal(4))
    });

    it("if the group has already this team should return bad request", () => {
        return foccaciaService.addTeam(groupTest.id, groupTest.teams[0].id, groupTest.teams[0].season, groupTest.teams[0].leagueId, userTest.token)
                .catch(error => expect(error.code).to.equal(1))
    });

    it("if football api doesn't found a valid team should return bad request", () => {
        return foccaciaService.addTeam(groupTest.id, 1, 2021, 94, userTest.token)
                .catch(error => expect(error.code).to.equal(1))
    })

    it("if all parameters are correct should return the group with the new team", () => {
        return foccaciaService.addTeam(groupTest.id, 212, 2021, 94, userTest.token)
                .then(group => 
                    expect(group.teams).to.deep.include(
                        {
                            id: 212,
                            season: 2021,
                            leagueId: 94,
                            name: 'FC Porto',
                            stadium: 'Estádio Do Dragão'
                          }
                    )
                )
    });

});

describe("removeTeamFromGroup", () => {

    it("if token is invalid should return unauthorized", () => {
        return foccaciaService.removeTeamFromGroup(1, 212, 2021, 94)
                .catch(error => expect(error.code).to.equal(3))
    })

    it("if parameters aren't correct should return bad request", () => {
        return foccaciaService.removeTeamFromGroup(undefined, undefined, undefined, undefined, userTest.token)
                .catch(error => expect(error.code).to.equal(1))
    })

    it("if there is no group with this id should return not found", () => {
        return foccaciaService.removeTeamFromGroup(-1, 1, 1, 1, userTest.token)
                .catch(error => expect(error.code).to.equal(2))
    })

    it("if the user is not the owner of this group should return forbidden", () => {
        return foccaciaService.removeTeamFromGroup(1, 529, 2021, 140, userTest2.token)
                .catch(error => expect(error.code).to.equal(4))
    })

    it("if this team does not belong to the group it must return bad request", () => {
        return foccaciaService.removeTeamFromGroup(1, 212, 2021, 94, userTest.token)
                .catch(error => expect(error.code).to.equal(1))
    })

    it("if remove team from group succeeds", () => {
        return foccaciaService.removeTeamFromGroup(1, 529, 2021, 140, userTest.token)
                .then(group => 
                    expect(group).to.deep.equal(
                        {
                            id: 1,
                            name: "TestGroup",
                            description: "Group Created for Tests",
                            teams: [],
                            userId: 1
                        }
                    )
                )
    })

})

describe("editGroupById", () => {

    it("if token is invalid should return unauthorized", () => {
        return foccaciaService.editGroupById("Name", "Description", 2, undefined)
                .catch(error => expect(error.code).to.equal(3))
    });

    it("if parameters aren't correct should return bad request", () => {
        return foccaciaService.editGroupById(undefined, undefined, 2, userTest.token)
                .catch(error => expect(error.code).to.equal(1))
    });

    it("if there is no group with this id should return not found", () => {
        return foccaciaService.editGroupById("Name", "Description", -1, userTest.token)
                .catch(error => expect(error.code).to.equal(2))
    });

    it("if the user is not the owner of this group should return forbidden", () => {
        return foccaciaService.editGroupById("Equipas Decentes", "Description", 1, userTest2.token)
                .catch(error => expect(error.code).to.equal(4))
    });

    it("if the request was successfull should return the group edited", () => {
        return foccaciaService.editGroupById("Equipas Decentes", "testeste", 1, userTest.token)
                .then(group => expect(group).to.deep.equal(
                        {
                            id: 1,
                            name: "Equipas Decentes",
                            description: "testeste",
                            teams: [],
                            userId: 1
                        }
                    )
                )
    });

});

describe("deleteGroupById", () => {

    it("if token is invalid should return unauthorized", () => {
        return foccaciaService.deleteGroupById()
                .catch(error => expect(error.code).to.equal(3))
    });

    it("if parameters aren't correct should return bad request", () => {
        return foccaciaService.deleteGroupById(undefined, userTest.token)
                .catch(error => expect(error.code).to.equal(1))
    });

    it("if there is no group with this id should return not found", () => {
        return foccaciaService.deleteGroupById(3, userTest2.token)
                .catch(error => expect(error.code).to.equal(2))
    });

    it("if the user is not the owner of this group should return forbidden", () => {
        return foccaciaService.deleteGroupById(1, userTest2.token)
                .catch(error => expect(error.code).to.equal(4))
    });

    it("if the request was successfull should return the group id", () => {
        return foccaciaService.deleteGroupById(1, userTest.token)
                .then(group => expect(group).to.deep.equal({ id: 1 }))
    });

});

