export function usersData(url) {

    async function createUser(username, password){

        const token = crypto.randomUUID()
    
        const user = {
            userName: username,
            password: password,
            token: token
        }
    
        const response = await fetch(`${url}/users/_doc`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
    
        if (!response.ok)
            return undefined
    
        return { token }
    }
    
    async function getUserByToken(token){
    
        const response = await fetch(`${url}/users/_search?q=token:"${token}"`)
        const data = await response.json()
    
        if (data.hits.hits.length == 0)
            return undefined
    
        const user = data.hits.hits[0]._source
        user.id = data.hits.hits[0]._id
    
        return user
    }
    
    async function getUserByName(userName){
    
        const response = await fetch(`${url}/users/_search?q=userName:"${userName}"`)
        const data = await response.json()
    
        if (data.hits.hits.length == 0)
            return undefined
    
        const user = data.hits.hits[0]._source
        user.id = data.hits.hits[0]._id
    
        return user
    }
    
    return {
        createUser,
        getUserByToken,
        getUserByName
    }

}