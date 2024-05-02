let onloadAlready = false
let username = '';

function onloaded() {
    let params = new URL(document.location.toString()).searchParams; 
    console.log(`has('utilisateur')=${params.has("utilisateur")}`);
    username = params.get("utilisateur");
    console.log(`onload: onloadAlready=${onloadAlready} window.location.href=${window.location.href} utilisateur=${username}`);
    document.getElementById('userInfoUsername').textContent = `${username}`;
}