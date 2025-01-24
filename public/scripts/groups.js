window.addEventListener("load", groupsHandler)

function groupsHandler(){
    const editButtons = document.querySelectorAll(".edit")
    editButtons.forEach(button => {
        button.addEventListener("click", e => editGroupHandler(e, button.getAttribute("groupid")))
    })

    const removeButtons = document.querySelectorAll(".delete")
    removeButtons.forEach(button => {
        button.addEventListener("click", e => removeGroupHandler(e, button.getAttribute("groupid")))
    })
}

function editGroupHandler(event, groupid){

    const groupname = document.getElementById(groupid + "-name").value
    const groupdescription = document.getElementById(groupid + "-description").value
  
    fetch("http://localhost:9000/api/groups/"+ groupid , {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(
            {
                name: groupname,
                description: groupdescription
            }
        )
    }).then(resp => window.location.href = "/groups")

}

function removeGroupHandler(event, groupid){

    fetch("http://localhost:9000/api/groups/"+ groupid , {
        method: "DELETE"
    }).then(resp => window.location.href = "/groups")
}