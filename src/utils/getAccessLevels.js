export const getAccessLevels = ({ email }) => {
  const usersWithDevelopAccess = (process.env.DEVELOP_ACCESS || "").split(" ");
  const usersWithStagingAccess = (process.env.STAGING_ACCESS || "").split(" ");
  const usersWithProductionAccess = (process.env.PRODUCTION_ACCESS || "").split(
    " "
  );

  if (usersWithProductionAccess.includes(email))
    return ["develop", "staging", "production"];
  if (usersWithStagingAccess.includes(email)) return ["develop", "staging"];
  if (usersWithDevelopAccess.includes(email)) return ["develop"];
  return [];
};
