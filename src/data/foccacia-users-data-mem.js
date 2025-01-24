const cache = [
    {
        id: 1,
        userName: "TestUser",
        password: "$2b$10$2kWKZARpv.qx2aTimCUgA.km0fpoQGA7ad3JDDUFq35XOudzQVkqC",
        token: 100
    },
    {
        id: 2,
        userName: "TestUser2",
        password: "$2b$12$9nI62/f3WuGOrdT27SeeN.d3yuqWfyoDR0/a4NReBwaAOEwzJC7ji",
        token: 101
    },
    {
        id: 3,
        userName: "TestUser3",
        password: "$2b$12$9nI62/f3WuGOrdT27SeeN.d3yuqWfyoDR0/a4NReBwaAOEwzJC7ji",
        token: 102
    }
]

function createUser(username, password){

    const id = Date.now()

    const token = crypto.randomUUID()

    const user = {
        id: id,
        userName: username,
        password: password,
        token: token
    }

    cache.push(user)

    return Promise.resolve({token: token})

}

function getUserByToken(token){

    return Promise.resolve(cache.find(user => user.token == token))

}

function getUserByName(userName){

    return Promise.resolve(cache.find(user => user.userName == userName))

}

export const users = {
    createUser,
    getUserByToken,
    getUserByName
}

export default users