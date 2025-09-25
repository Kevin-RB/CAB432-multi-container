
export function storeUserInfo(token: string, roles: string[]) {
    localStorage.setItem("token", token);
    localStorage.setItem("Roles", JSON.stringify(roles));
}