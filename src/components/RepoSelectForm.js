import React from "react";
import { Box, Select, Input, Tooltip, IconButton } from "@chakra-ui/react";
import { CopyIcon, DownloadIcon, InfoIcon } from "@chakra-ui/icons";

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
  "yc-env-editor",
];

const IconWithTooltip = ({
  tooltipLabel,
  ariaLabel,
  disabled,
  onClick,
  icon,
  marginRight,
}) => (
  <Tooltip label={tooltipLabel} aria-label={ariaLabel}>
    <IconButton
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      icon={icon}
      marginRight={marginRight}
    />
  </Tooltip>
);

export const RepoSelectForm = ({
  isRepoSelected,
  environment,
  repoName,
  fileName,
  copyEnvToClipboard,
  downloadEnvFile,
  openLogsDrawer,
  accessLevels,
  updateUrl,
  router,
}) => (
  <>
    <Box display="flex" alignItems="center" mb="4" minWidth="full">
      <Box display="flex" flex="1">
        <Select
          width="40%"
          marginRight="1rem"
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
          width="50%"
          marginRight="1rem"
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
          width="10%"
          marginRight="1rem"
          name="fileName"
          value={fileName}
          onChange={(e) => updateUrl(router, { fileName: e.target.value })}
        />
      </Box>
      {/* Actions */}
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <IconWithTooltip
          marginRight="2"
          tooltipLabel="Copy to clipboard"
          ariaLabel="Copy ENV"
          disabled={!isRepoSelected}
          onClick={copyEnvToClipboard}
          icon={<CopyIcon w={4} h={4} color="blue.500" />}
        />
        <IconWithTooltip
          marginRight="2"
          tooltipLabel="Download file"
          ariaLabel="Download ENV"
          disabled={!isRepoSelected}
          onClick={downloadEnvFile}
          icon={<DownloadIcon w={4} h={4} color="salmon" />}
        />
        <IconWithTooltip
          tooltipLabel="View Logs"
          ariaLabel="View ENV Update Logs"
          disabled={!isRepoSelected}
          onClick={openLogsDrawer}
          icon={<InfoIcon w={4} h={4} color="peru" />}
        />
      </Box>
    </Box>
  </>
);
