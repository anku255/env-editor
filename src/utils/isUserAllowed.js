import { getAccessLevels } from "../../src/utils/getAccessLevels";

export const isUserAllowed = ({ environment, email }) => {
  const accessLevels = getAccessLevels({ email });
  return accessLevels.includes(environment);
};
