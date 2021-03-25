import { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import absoluteUrl from "next-absolute-url";
import {
  Input,
  Box,
  IconButton,
  Select,
  Button,
  Container,
} from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";

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
];

const environments = ["develop", "staging"];

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
  const { repoName, environment, fileName } = updatedQueryParams;
  const strignifiedQueryParams = `environment=${environment}&repoName=${repoName}&fileName=${fileName}`;
  router.replace(`/?${strignifiedQueryParams}`, `/?${strignifiedQueryParams}`, {
    shallow: true,
  });
};


const getEnvData = async ({ origin, environment, repoName, fileName }) => {
  return fetch(
    `${origin}/api/download?environment=${environment}&repoName=${repoName}&fileName=${fileName}`
  ).then((res) => res.json());
}

export default function Home({ envJSON, origin, isRepoSelected }) {
  const router = useRouter();
  const { repoName, environment, fileName = '.env' } = router.query;

  const [envData, setEnvData] = useState(envJSON);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");

  useEffect(() => {
    if(!isRepoSelected) {
      router.push('/?environment=develop&repoName=yc-frontend&fileName=.env');
    }
  }, []);

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
    const data = await getEnvData({ origin, environment, repoName, fileName });
    setEnvData(data);
  };

  const uploadData = async () => {
    const content = JSON.stringify(envData);
    const keyName = `${environment}/${repoName}/${fileName}`;
    const data = await fetch(`${origin}/api/upload`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        fileName: keyName,
      }),
    }).then((res) => res.json());
    console.log("data", data);
  };

  return (
    <Container minW="max" px="8" py="4">
      <Head>
        <title>Env Editor</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="">
        <Box display="flex" alignItems="center" mb="4">
          <Select
            placeholder="Environment"
            value={environment}
            onChange={(e) => updateUrl(router, { environment: e.target.value })}
          >
            {environments.map((environment) => (
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
          <Box pl="4">
            <Button onClick={fetchData} colorScheme="teal" size="sm">
              Fetch
            </Button>
          </Box>
        </Box>

        {Object.entries(envData).map(([key, value], i) => {
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
      </div>

      <Box display="flex" justifyContent="center">
        <Button onClick={uploadData} colorScheme="blue" size="md">
          Upload
        </Button>
      </Box>
    </Container>
  );
}

export async function getServerSideProps({ req, query }) {
  const { repoName, environment, fileName = '.env' } = query;
  const isRepoSelected = Boolean(repoName && environment);
  let data = {};

  const { host } = absoluteUrl(req);
  const origin = `https://${host}`;

  if(isRepoSelected) {
    data = await getEnvData({ origin, environment, repoName, fileName });
  }

  return {
    props: {
      envJSON: data,
      origin,
      isRepoSelected
    },
  };
}
