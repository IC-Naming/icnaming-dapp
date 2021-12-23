import React from 'react'
import comingsoon from '../assets/images/coming-soon.jpg'
export const ComingSoon = () => {
  return (
    <div style={{
      height:'100vh',
      width: '100vw',
      background: `#050D21 url(${comingsoon}) no-repeat center center`,
      backgroundSize: 'contain',
    }}>
    </div>
  );
}