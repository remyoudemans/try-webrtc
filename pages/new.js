import Head from 'next/head';
import {useEffect, useRef, useState} from 'react';
import styles from '../styles/Home.module.css';
import Peer from 'simple-peer';

// TODO: refactor the heck out of this so you can easily pass various messages around

export default function Home() {
  const [signal, setSignal] = useState();
  const [peerSignal, setPeerSignal] = useState('');
  const [sharedMessage, setSharedMessage] = useState('');
  const [friendMessage, setFriendMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const peerRef = useRef();

  useEffect(() => {
    const client = new WebSocket('ws://localhost:8080');
    client.onopen = () => {
      client.send(JSON.stringify({ type: 'login', userName: 'Jeff'}));
    };
    client.onmessage = ev => {
      console.log(ev)
    }
  }, []);

  useEffect(() => {
    console.log('running effect')
    peerRef.current = new Peer({ initiator: true, trickle: false })

    peerRef.current.on('signal', data => {
      console.log('signal:', data);
      setSignal(JSON.stringify(data));
    });

    peerRef.current.on('connect', () => {
      console.log('connected!')
      setIsConnected(true);
    })

    peerRef.current.on('data', data => {
      setFriendMessage(data.toString());
    })
  }, [])

  useEffect(() => {
    const eventHandler = e => {
      if (isConnected) {
        peerRef.current.send(JSON.stringify({
          messageType: 'mousemove',
          x: e.clientX,
          y: e.clientY
        }));
      }
    };

    document.addEventListener('mousemove', eventHandler);
    
    return () => document.removeEventListener('mousemove', eventHandler);
  }, [isConnected])

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {signal && <p>Go to <a href={`http://localhost:3000/${encodeURIComponent(signal)}`}>peer</a></p>}
          <form onSubmit={e => {
            e.preventDefault();
            peerRef.current.signal(JSON.parse(peerSignal));
          }}>
            <label>
              Peer signal&nbsp;
              <input
                type='text'
                value={peerSignal}
                onChange={e => setPeerSignal(e.currentTarget.value)}
              />
            </label>
            <button type="submit">Connect</button>
          </form>
        {friendMessage && <p>Your friend is saying: <blockquote>{friendMessage}</blockquote></p>}

          <p>Once connected, try typing in here:</p>
            <input type='text' value={sharedMessage} onChange={e => {
              setSharedMessage(e.currentTarget.value);
              peerRef.current.send(JSON.stringify({ messageType: 'inputText', value: e.currentTarget.value }));
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
