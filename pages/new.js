import Head from 'next/head';
import {useEffect, useRef, useState} from 'react';
import styles from '../styles/Home.module.css';
import Peer from 'simple-peer';

export default function Home() {
  const [signal, setSignal] = useState();
  const [peerSignal, setPeerSignal] = useState('');
  const [sharedMessage, setSharedMessage] = useState('');
  const [friendMessage, setFriendMessage] = useState('');

  const peerRef = useRef();

  const cursorDot = useRef();

  useEffect(() => {
    console.log('running effect')
    peerRef.current = new Peer({ initiator: true, trickle: false })

    peerRef.current.on('signal', data => {
      console.log('signal:', data);
      setSignal(JSON.stringify(data));
    });

    peerRef.current.on('connect', () => {
      console.log('connected!')
    })

    peerRef.current.on('data', data => {
      setFriendMessage(data.toString());
    })
  }, [])

  useEffect(() => {
    const cursorDotEl = document.getElementById('cursorDot');
    document.addEventListener('mousemove', e => {
      cursorDotEl.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
    });
  }, [])

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <span id='cursorDot' ref={cursorDot} style={{
          height: '20px',
          width: '20px',
          backgroundColor: 'blue',
          position: 'absolute',
          top: 0,
          left: 0,
        }}/>
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
              setSharedMessage(e.currentTarget.value)
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
