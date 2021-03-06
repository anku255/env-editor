import React from "react";
import { Box, Heading, Flex, Text, Button } from "@chakra-ui/react";

export const Header = ({ email, signIn, signOut }) => {
  const [show, setShow] = React.useState(false);
  const handleToggle = () => setShow(!show);

  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.5rem"
      bg="rgb(254, 220, 77)"
      color="black"
    >
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={"-.1rem"}>
          Env Editor
        </Heading>
      </Flex>

      <Box display={{ base: "block", md: "none" }} onClick={handleToggle}>
        <svg
          fill="white"
          width="12px"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>Menu</title>
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </Box>

      <Box
        display={{ sm: show ? "flex" : "none", md: "flex" }}
        align="center"
        flex={1}
        justifyContent="flex-end"
        mt={{ base: 4, md: 0 }}
      >
        {email ? <Box pt="0.5rem" pr="1rem">Logged in as {' '}
        <Box as="span" fontWeight="bold">{email}</Box></Box> : ''}
        <Button bg="transparent" border="1px" onClick={email ? signOut : signIn }>
          {email ? 'Sign Out' : 'Sign In'}
        </Button>
      </Box>
    </Flex>
  );
};
