import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import absoluteUrl from "next-absolute-url";
import { stringify } from 'query-string';
import { useToasts } from 'react-toast-notifications';
import { signIn, signOut, getSession } from "next-auth/client";
import {
  Input,
  Box,
  IconButton,
  Button,
  Container,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { getAccessLevels } from "../src/utils/getAccessLevels";
import { OuterContainer } from "../src/components/OuterContainer";
import { RepoSelectForm } from "../src/components/RepoSelectForm";
import { AddNewKeyForm } from "../src/components/AddNewKeyForm";

/**
 *
 * @param router Router
 * @param queryParams
 * @returns void
 * Updates the URL with the given query params
 */
const updateUrl = (router, queryParams) => {
  const parsedQueryParams = router.query;
  const updatedQueryParams = { ...parsedQueryParams, ...queryParams };
  const { repoName, environment, fileName = '.env' } = updatedQueryParams;
  const strignifiedQueryParams =  stringify({ repoName, environment, fileName });
  router.replace(`/?${strignifiedQueryParams}`, `/?${strignifiedQueryParams}`, {
    shallow: true,
  });
};

const getEnvData = async ({ origin, environment, repoName, fileName }) => {
  return fetch(
    `${origin}/api/download?environment=${environment}&repoName=${repoName}&fileName=${fileName}`
  ).then((res) => res.json());
};

const useFetchENVData = ({ origin, environment, repoName, fileName }) => {
  const [isFetching, setIsFetching] = useState(false);
  const [envData, setEnvData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if(origin && environment && repoName && fileName ) {
      setIsFetching(true);
      setError(null);
      setEnvData(null);
      getEnvData({ origin, environment, repoName, fileName }).then(res => {
        if(res.status) {
          setEnvData(res.data);
        } else {
          setError(res.message);
        }
      }).catch(error => {
        setError(error.message);
      }).finally(() => setIsFetching(false));
    }
  }, [origin, environment, repoName, fileName]);

  return { isFetching, envData, error };
}


export default function Home({ origin, accessLevels, isLoggedIn, user }) {
  const router = useRouter();
  const { addToast } = useToasts();
  const { repoName, environment, fileName = ".env" } = router.query;

  const { isFetching, envData: fetchedEnvData, error } = useFetchENVData({ origin, environment, repoName, fileName });
  const [envData, setEnvData] = useState({});
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  const email = user?.email;
  const isRepoSelected = Boolean(repoName && environment);
  const hasDataLoaded = !!envData;

  useEffect(() => {
    setEnvData(fetchedEnvData);
  }, [fetchedEnvData]);

  useEffect(() => {
    if(error) {
      addToast(error, { appearance: 'error' });
    }
  }, [error]);

  const updateEnvKey = ({ currentKey, newKey }) => {
    setEnvData((envJSON) => {
      const currentValue = envJSON[currentKey];
      const updatedData = { ...envJSON };
      delete updatedData[currentKey];
      updatedData[newKey] = currentValue;
      return updatedData;
    });
  };

  const updateEnvValue = ({ key, value }) => {
    setEnvData((envJSON) => {
      return { ...envJSON, [key]: value };
    });
  };

  const addNewKey = () => {
    setEnvData((envJSON) => {
      return { ...envJSON, [newKey]: newValue };
    });
    setNewKey("");
    setNewValue("");
  };

  const deleteKey = ({ key }) => {
    setEnvData((envJSON) => {
      const updatedData = { ...envJSON };
      delete updatedData[key];
      return updatedData;
    });
  };

  const fetchData = async () => {
    const res = await getEnvData({ origin, environment, repoName, fileName });
    console.log("res", res)
    if(res.status) {
      setEnvData(res.data);
    } else {
      addToast(res.message, { appearance: 'error' });
    }
  };

  const uploadData = async () => {
    const content = JSON.stringify(envData);
    const keyName = `${environment}/${repoName}/${fileName}`;
    const res = await fetch(`${origin}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        fileName,
        repoName,
        environment
      }),
    }).then((res) => res.json());
    if(res.status) {
      addToast(`Successfully uploaded ${keyName}`, { appearance: 'success' });
    } else {
      addToast(res.message, { appearance: 'error' });
    }
  };

  if (!isLoggedIn)
    return (
      <OuterContainer {...{ email, signIn, signOut }}>
        <Box
          fontSize="2xl"
          fontWeight="bold"
          textAlign="center"
          textDecoration="underline"
          cursor="pointer"
          onClick={signIn}
        >
          Please login with your IvyPods Google Account to Continue
        </Box>
      </OuterContainer>
    );

  return (
    <OuterContainer {...{ email, signIn, signOut }}>
      <Container minW="max" px="8" py="4">
        <RepoSelectForm
          {...{
            environment,
            fileName,
            repoName,
            fetchData,
            accessLevels,
            updateUrl,
            router,
            isRepoSelected
          }}
        />
        {Object.entries(envData || {}).map(([key, value], i) => {
          return (
            <div key={key}>
              <Box display="flex" mb="2">
                <Input
                  placeholder="Key"
                  mr="4"
                  width="md"
                  name={`${key}-${i}`}
                  value={key}
                  disabled
                  onChange={(e) =>
                    updateEnvKey({ currentKey: key, newKey: e.target.value })
                  }
                />
                <Input
                  width="xl"
                  placeholder="Value"
                  name={`${value}-${i}`}
                  value={value}
                  onChange={(e) =>
                    updateEnvValue({ key, value: e.target.value })
                  }
                />
                <IconButton
                  marginLeft="2"
                  aria-label="Delete Key"
                  onClick={() => deleteKey({ key })}
                  icon={<DeleteIcon w={4} h={4} color="red.500" />}
                />
              </Box>
            </div>
          );
        })}
        {hasDataLoaded && (
          <Box>
            <AddNewKeyForm
              {...{ newKey, setNewKey, newValue, setNewValue, addNewKey }}
            />

            <Box display="flex" justifyContent="center">
              <Button onClick={uploadData} colorScheme="blue" size="md">
                Upload
              </Button>
            </Box>
          </Box>
        )}
      </Container>
    </OuterContainer>
  );
}

export async function getServerSideProps(context) {
  const session = await getSession(context);
  const isLoggedIn = !!session?.user?.email;
  const accessLevels = getAccessLevels({ email: session?.user?.email });

  const { host } = absoluteUrl(context.req);
  const origin = `https://${host}`;

  return {
    props: {
      origin,
      isLoggedIn,
      accessLevels,
      user: isLoggedIn ? session?.user : null
    },
  };
}
