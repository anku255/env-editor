import React from "react";
import { Box, Select, Input, Button } from "@chakra-ui/react";

export const AddNewKeyForm = ({ newKey, setNewKey, newValue, setNewValue, addNewKey }) => (
  <Box display="flex" mb="2">
    <Input
      placeholder="KEY"
      mr="4"
      width="md"
      name="newKey"
      value={newKey}
      onChange={(e) => setNewKey(e.target.value)}
    />
    <Input
      width="xl"
      placeholder="VALUE"
      name="newValue"
      value={newValue}
      onChange={(e) => setNewValue(e.target.value)}
    />
    <Button marginLeft="2" aria-label="Add Key" onClick={addNewKey}>
      Add
    </Button>
  </Box>
);
