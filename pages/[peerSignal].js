import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import Peer from 'simple-peer';

export default function Home() {
  const router = useRouter();
  const peerSignalFromQuery = router.query.peerSignal;
  const [signal, setSignal] = useState();

  useEffect(() => {
    if (!peerSignalFromQuery) {
      return;
    }

    const peer = new Peer({ trickle: false });

    peer.on('signal', data => {
      const stringSignal = JSON.stringify(data);
      setSignal(stringSignal);
      navigator.permissions.query({name: "clipboard-write"}).then(result => {
        if (result.state == "granted" || result.state == "prompt") {
          navigator.clipboard.writeText(stringSignal).then(() => {
            alert('Copied signal to clipboard.');
          }).catch(() => {});
        }
      })
    })

    peer.signal(JSON.parse(peerSignalFromQuery));

    peer.on('data', data => {
      console.log('received data:', data.toString());
    });
  }, [peerSignalFromQuery, setSignal]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {signal && <p>Your signal is <code>{signal}</code></p>}
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  )
}
