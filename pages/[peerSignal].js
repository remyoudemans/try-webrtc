import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import styles from '../styles/Home.module.css';
import Peer from 'simple-peer';

export default function Home() {
  const router = useRouter();
  const peerSignalFromQuery = router.query.peerSignal;
  const [signal, setSignal] = useState();
  const [friendMessage, setFriendMessage] = useState('');
  const [yourMessage, setYourMessage] = useState('');

  const peerRef = useRef();

  const friendsCursor = useRef();

  useEffect(() => {
    if (!peerSignalFromQuery) {
      return;
    }

    peerRef.current = new Peer({ trickle: false });

    peerRef.current.on('signal', data => {
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

    peerRef.current.signal(JSON.parse(peerSignalFromQuery));

    peerRef.current.on('data', data => {
      const parsedData = JSON.parse(data.toString());

      if (parsedData.messageType === 'mousemove') {
        friendsCursor.current.style.transform = `translate(${parsedData.x}px, ${parsedData.y}px)`;
      }

      if (parsedData.messageType === 'inputText') {
        setFriendMessage(parsedData.value);
      }
      
    });
  }, [peerSignalFromQuery, setSignal]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <span id='friendsCursor' ref={friendsCursor} style={{
          height: '20px',
          width: '20px',
          backgroundColor: 'blue',
          position: 'absolute',
          top: 0,
          left: 0
        }}/>
        {signal && <p>Your signal is <code>{signal}</code></p>}
        {friendMessage && <p>Your friend is saying: <blockquote>{friendMessage}</blockquote></p>}
        <p>Once connected, try typing in here:</p>
          <input type='text' value={yourMessage} onChange={e => {
            setYourMessage(e.currentTarget.value)
            peerRef.current.send(e.currentTarget.value)
          }}/>
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
