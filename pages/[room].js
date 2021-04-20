import { useRouter } from 'next/router';
import { useRef, useState, useEffect } from 'react';
import Peer from 'simple-peer';

export default function Home() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const peerRef = useRef();
  const friendsCursor = useRef();

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
  }, [isConnected]);

  const setUpPeer = (client, initiator = false) => {
    peerRef.current = new Peer({ initiator, trickle: false })

    peerRef.current.on('signal', data => {
      client.send(JSON.stringify({ type: 'signal', data }));
    });

    peerRef.current.on('connect', () => {
      setIsConnected(true);
    });

    peerRef.current.on('data', data => {
      const parsedData = JSON.parse(data.toString());

      if (parsedData.messageType === 'mousemove') {
        friendsCursor.current.style.transform = `translate(${parsedData.x}px, ${parsedData.y}px)`;
      }
    });
  }

  const login = () => {
    const client = new WebSocket('ws://localhost:8080');
    client.onopen = () => {
      client.send(JSON.stringify({ type: 'login', userName, room: router.query.room }));
    };

    client.onmessage = ev => {
      console.log(ev);
      let data;
      try {
        data = JSON.parse(ev.data);
      } catch(e) {
      }

      if (data) {
        if (data.type === 'roomCreated') {
          setIsHost(true);
        } else if (data.type === 'roomJoined') {
          setUpPeer(client);
        } else if (data.type === 'newUser' && data.name !== userName) {
          setUpPeer(client, true);
        } else if (data.type === 'signal') {
          peerRef.current.signal(data.data);

        }
      }
    }

    client.onerror = ev => {
      console.error(ev);
    }

    client.onclose = ev => {
      console.log('Closing:', ev);
    }
  }

  return (
    <main>
      Connect with websockets and communicate via WebRTC!
      {!showLoginForm && (
        <p>Your username is: {userName}</p>
      )}
      {isHost && (
        <p>You are the host</p>
      )}
      {isConnected && (
        <p>You've connected with a peer!</p>
      )}
      {showLoginForm && (
        <form onSubmit={e => {
          e.preventDefault();
          login();
          setShowLoginForm(false);
        }}>
          <label>
            Username:
          <input onChange={e => setUserName(e.currentTarget.value)} type='text' value={userName} />
            </label>
            <button type='submit'>Login</button>
        </form>
      )}
      {isConnected && (
        <span id='friendsCursor' ref={friendsCursor} style={{
          height: '20px',
          width: '20px',
          backgroundColor: 'blue',
          position: 'absolute',
          top: 0,
          left: 0
        }}/>
      )}
    </main>
  )
}

