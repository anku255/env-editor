import React, { useState, useEffect } from 'react';
import absoluteUrl from "next-absolute-url";
import { useLocalStorage } from 'react-use';
import { Box, Button, Checkbox, CheckboxGroup, Flex, Heading, Input, SimpleGrid, Textarea, useCheckboxGroup } from '@chakra-ui/react';
import { useToasts } from 'react-toast-notifications';

const allRepos = [
  "yc-frontend",
  "yc-gateway",
  "yc-biz-logic",
  "yc-database",
  "yc-user",
  "yc-referral",
  "yc-pigeon",
  "yc-chat",
  "yc-class",
  "yc-post",
  "yc-media",
  "yc-admin-frontend",
  "yc-admin-backend",
];

const getChecklistCSV = async ({ origin, githubToken, repos, head, base, title }) => {
  return fetch(
    `${origin}/api/release-checklist`,
    {
      method: 'POST',
      headers: { 'Content-Type': "application/json" },
      body: JSON.stringify({
        githubToken, repos, head, base, title
      })
    }
  ).then((res) => res.json());
};

const Header = () => {
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      padding="1.2rem"
      bg="green.400"
      color="black"
    >
      <Flex align="center" mr={5}>
        <Heading as="h1" size="lg" letterSpacing={"-.1rem"}>
          Release Checklist
        </Heading>
      </Flex>
    </Flex>
  );
}

const ReleaseChecklist = ({ origin }) => {
  const { addToast } = useToasts();
  const [head, setHead] = useState('@staging');
  const [base, setBase] = useState('master');
  const [title, setTitle] = useState(`${head} to ${base}`);
  const [githubToken, setGithubToken] = useLocalStorage('ghToken', '');
  const { value: repos, setValue: setRepos } = useCheckboxGroup({ defaultValue: allRepos });
  const [checklistCSV, setChecklistCSV] = useState('');

  const getChecklist = async () => {
    setChecklistCSV('');
    const res = await getChecklistCSV({ origin, githubToken, repos, head, base, title });
    if (!res.status) {
      return addToast(res.message || 'Somethign went wrong', { appearance: 'error' });
    }
    setChecklistCSV(res.data);
  }

  useEffect(() => {
    setTitle(`${head} to ${base}`);
  }, [head, base])

  const isDisabled = !(githubToken && head && base && title && repos.length > 0);

  return (
    <Box>
      <Header />
      <Box paddingX="10" paddingY="8">
        <Box as="form">
          <Box display="flex" mb="2">
            <Input
              placeholder="Github Personal Access Token"
              mr="4"
              width="md"
              name="githubToken"
              value={githubToken}
              onChange={e => setGithubToken(e.target.value)}
            />
            <Input
              placeholder="base branch"
              mr="4"
              width="md"
              name="base"
              value={base}
              onChange={e => setBase(e.target.value)}
            />
            <Input
              placeholder="head branch"
              mr="4"
              width="md"
              name="head"
              value={head}
              onChange={e => setHead(e.target.value)}
            />
            <Input
              placeholder="Title"
              width="md"
              name="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </Box>
          <Box fontWeight="bold" mb="2">Repos</Box>
          <CheckboxGroup value={repos} colorScheme="green" onChange={setRepos}>
            <SimpleGrid columns={7} spacingX={10} spacingY={5}>
              {allRepos.map(repo => (<Checkbox key={repo} value={repo}>{repo}</Checkbox>))}
            </SimpleGrid>
          </CheckboxGroup>

          <Box marginTop="8" display="flex" justifyContent="center">
            <Button disabled={isDisabled} onClick={getChecklist} colorScheme="green" size="md">
              Generate Checklist
            </Button>
          </Box>
          <Box marginTop="12" display="flex" justifyContent="center">
            <Textarea name="checklist" value={checklistCSV} onChange={e => setChecklistCSV(e.target.value)} rows={12} width="lg" />
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export async function getServerSideProps(context) {
  const { host } = absoluteUrl(context.req);
  const origin = `https://${host}`;

  return {
    props: { origin },
  };
}



export default ReleaseChecklist;