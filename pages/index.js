import { useState } from "react";
import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home({envJSON}) {
  const [envData, setEnvData] = useState(envJSON); 
  const [repoName, setRepoName] = useState('');
  const [environment, setEnvironment] = useState('');
  const [fileName, setFileName] = useState('.env');

  const updateEnvKey = ({currentKey, newKey}) => {
    setEnvData(envJSON => {
      const currentValue = envJSON[currentKey];
      const updatedData = {...envJSON};
      delete updatedData[currentKey];
      updatedData[newKey] = currentValue;
      return updatedData;
    })
  }

  const updateEnvValue = ({key, value}) => {
    setEnvData(envJSON => {
      return {...envJSON, [key]: value} 
    })
  };

  const fetchData = async () => {
    const data = await fetch(`http://localhost:3000/api/download?environment=${environment}&repoName=${repoName}&fileName=${fileName}`).then(res => res.json());
    setEnvData(data);
  }

  const uploadData = async () => {
    const content = JSON.stringify(envData);
    const keyName = `${environment}/${repoName}/${fileName}`;
    console.log("keyName", keyName)
    const data = await fetch(`http://localhost:3000/api/upload?content=${content}&fileName=${keyName}`).then(res => res.json());
    console.log("data", data)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Env Editor</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>


      <div className="">

        <div className={styles.form}>
          <input name="environment" value={environment} onChange={(e) => setEnvironment(e.target.value)} />
          <input name="repoName" value={repoName} onChange={(e) => setRepoName(e.target.value)} />
          <input name="fileName" value={fileName} onChange={(e) => setFileName(e.target.value)} />
          <button onClick={fetchData}>Fetch Data</button>
        </div>

        {Object.entries(envData).map(([key, value], i) => {
          return (
            <div key={key}>
              <div>

                <input className={styles.input} name={`${key}-${i}`} value={key} onChange={(e) => {
                 updateEnvKey({currentKey: key, newKey: e.target.value });
                }} />

                <input className={styles.input} name={`${value}-${i}`} value={value} onChange={(e) => {
                  updateEnvValue({ key, value: e.target.value});
                }} />
              </div>
            </div>
          )
        })}
      </div>

      <button onClick={uploadData}>Upload</button>

    </div>
  )
}


export async function getServerSideProps(context) {
  const data = await fetch('http://localhost:3000/api/download?environment=staging&repoName=yc-gateway&fileName=.env').then(res => res.json());
  return {
    props: {
      envJSON: data
    }
  }
}