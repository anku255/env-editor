import React, { useState, useEffect } from "react";
import { useToasts } from "react-toast-notifications";
import formatDate from "date-fns/format";
import {
  Box,
  Stack,
  Text,
  Drawer,
  DrawerBody,
  useDisclosure,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";
import { LogDiffModal } from "./LogDiffModal";

const getEnvLogs = async ({ origin, environment, repoName, fileName }) => {
  return fetch(
    `${origin}/api/logs?environment=${environment}&repoName=${repoName}&fileName=${fileName}`
  ).then((res) => res.json());
};

const useFetchEnvLogs = ({
  isOpen,
  origin,
  environment,
  repoName,
  fileName,
}) => {
  const [isFetching, setIsFetching] = useState(false);
  const [envLogs, setEnvLogs] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && origin && environment && repoName && fileName) {
      setIsFetching(true);
      setError(null);
      setEnvLogs(null);
      getEnvLogs({ origin, environment, repoName, fileName })
        .then((res) => {
          if (res.status) {
            setEnvLogs(res.data);
          } else {
            setError(res.message);
          }
        })
        .catch((error) => {
          setError(error.message);
        })
        .finally(() => setIsFetching(false));
    }
  }, [isOpen, origin, environment, repoName, fileName]);

  return { isFetching, envLogs, error };
};

function LogCard({ log }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { userName, createdAt } = log;
  return (
    <>
      <Box p={3} shadow="md" borderWidth="1px" onClick={onOpen}>
        <Text fontSize="md">
          Updated By{" "}
          <Text display="inline-block" fontWeight="bold">
            {userName}
          </Text>{" "}
          at {formatDate(new Date(createdAt), "p do MMM Y")}
        </Text>
      </Box>
      <LogDiffModal {...{ isOpen, onClose, log }} />
    </>
  );
}

export const LogsDrawer = ({
  origin,
  environment,
  repoName,
  fileName,
  isOpen,
  onClose,
}) => {
  const { isFetching, envLogs, error } = useFetchEnvLogs({
    origin,
    environment,
    repoName,
    fileName,
    isOpen,
  });

  const { addToast } = useToasts();

  useEffect(() => {
    if (error) {
      addToast(error, { appearance: "error" });
    }
  }, [error]);

  return (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
      <DrawerOverlay>
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Logs History</DrawerHeader>

          <DrawerBody>
            {!envLogs ? (
              <Box>Loading..</Box>
            ) : (
              <Stack spacing={4}>
                {envLogs?.length === 0 ? (
                  <Text fontWeight="bold">No logs to show</Text>
                ) : (
                  envLogs.map((log) => <LogCard key={log._id} log={log} />)
                )}
              </Stack>
            )}
          </DrawerBody>
        </DrawerContent>
      </DrawerOverlay>
    </Drawer>
  );
};
