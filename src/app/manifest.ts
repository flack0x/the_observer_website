import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The Observer - Geopolitical Intelligence',
    short_name: 'The Observer',
    description: 'Independent geopolitical intelligence and strategic analysis. Cutting through the noise to reveal the truth behind global conflicts.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f1419',
    theme_color: '#1b3a57',
    icons: [
      {
        src: '/icon-192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon-512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
