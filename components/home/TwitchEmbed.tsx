'use client'

import { useSyncExternalStore } from 'react'

const TWITCH_CHANNEL = 'djmainodaplug'
const subscribe = () => () => undefined

export function TwitchEmbed() {
  const hostname = useSyncExternalStore(
    subscribe,
    () => window.location.hostname,
    () => '',
  )

  if (!hostname) {
    return <div style={{ minHeight: 450 }} aria-label="Loading Twitch player" />
  }

  const playerUrl = new URL('https://player.twitch.tv/')
  playerUrl.searchParams.set('channel', TWITCH_CHANNEL)
  playerUrl.searchParams.set('parent', hostname)
  playerUrl.searchParams.set('autoplay', 'false')

  return (
    <>
      <iframe
        src={playerUrl.toString()}
        title="DJ Maino Twitch broadcast"
        height="450"
        width="100%"
        allowFullScreen
        style={{ border: 'none', display: 'block' }}
      />
      <div style={{ padding: '12px 16px', textAlign: 'center' }}>
        <a
          href={`https://www.twitch.tv/${TWITCH_CHANNEL}`}
          target="_blank"
          rel="noopener noreferrer"
          className="gg-btn gg-btn--ghost gg-btn--sm"
        >
          Open on Twitch ↗
        </a>
      </div>
    </>
  )
}
