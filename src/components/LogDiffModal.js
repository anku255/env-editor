import React from "react";
import formatDate from "date-fns/format";
import {
  Box,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import ReactDiffViewer from "react-diff-viewer";

export const LogDiffModal = ({ isOpen, onClose, log }) => {
  const { oldDocument, newDocument, userName, createdAt } = log;
  return (
    <Modal size="6xl" isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Updated By{" "}
          <Text display="inline-block" fontWeight="bold">
            {userName}
          </Text>{" "}
          at {formatDate(new Date(createdAt), "p do MMM Y")}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box overflow="auto">
            <ReactDiffViewer
              oldValue={oldDocument}
              newValue={newDocument}
              splitView={false}
              hideLineNumbers={true}
              showDiffOnly={false}
            />
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
