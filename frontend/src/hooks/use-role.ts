
export const useRole = () => {
  const roleList = localStorage.getItem("Roles");
  if (!roleList) return null;
  const parsedRoleList = JSON.parse(roleList);
  return parsedRoleList;
}

export const useIsAdmin = () => {
  const roles = useRole();
  return roles?.includes("admin");
}