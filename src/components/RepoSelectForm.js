import React from "react";
import { Box, Select, Input, Button } from "@chakra-ui/react";

const repos = [
  "yc-frontend",
  "yc-gateway",
  "yc-biz-logic",
  "yc-database",
  "yc-user",
  "yc-referral",
  "yc-pigeon",
  "yc-program",
  "yc-class",
  "yc-post",
  "yc-media",
  "yc-admin-frontend",
  "yc-admin-backend",
  "yc-env-editor"
];


export const RepoSelectForm = ({isRepoSelected, environment, repoName, fileName, fetchData, openLogsDrawer, accessLevels, updateUrl, router }) => (
  <>
    <Box display="flex" alignItems="center" mb="4">
      <Select
        placeholder="Environment"
        value={environment}
        onChange={(e) => updateUrl(router, { environment: e.target.value })}
      >
        {accessLevels.map((environment) => (
          <option key={environment} value={environment}>
            {environment}
          </option>
        ))}
      </Select>
      <Select
        placeholder="Repository"
        value={repoName}
        onChange={(e) => updateUrl(router, { repoName: e.target.value })}
      >
        {repos.map((repoName) => (
          <option key={repoName} value={repoName}>
            {repoName}
          </option>
        ))}
      </Select>
      <Input
        width="xs"
        name="fileName"
        value={fileName}
        onChange={(e) => updateUrl(router, { fileName: e.target.value })}
      />
      <Box display="flex" pl="16">
        <Button mr="2" disabled={!isRepoSelected} onClick={fetchData} colorScheme="teal" size="sm">
          Fetch
        </Button>
        <Button disabled={!isRepoSelected} onClick={openLogsDrawer} colorScheme="purple" size="sm">
          View Logs
        </Button>
      </Box>
    </Box>
  </>
);
