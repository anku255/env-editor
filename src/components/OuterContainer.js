import React from "react";
import Head from "next/head";
import { Box } from "@chakra-ui/react";
import { Header } from './Header';

export const OuterContainer = ({ children, email, signIn, signOut }) => (
  <Box>
    <Head>
      <title>Env Editor</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <Header {...{ email, signIn, signOut }} />
    {children}
  </Box>
);
