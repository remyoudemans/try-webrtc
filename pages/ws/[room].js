import { useRouter } from 'next/router';
import {useEffect } from 'react';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (!router.query.room) {
      return;
    }

    const client = new WebSocket('ws://localhost:8080');
    client.onopen = () => {
      client.send(JSON.stringify({ type: 'login', userName: 'Jeff', room: router.query.room }));
    };
    client.onmessage = ev => {
      console.log(ev)
    }
  }, [router.query]);



  return (
    <main>
      Websockets!
    </main>
  )
}

