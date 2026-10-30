import { work, playground, notes } from '@/content/content';
export const dynamicParams = false;
export function generateStaticParams() {
  return [
    { path: [] },
    ...['work', 'playground', 'notes', 'music', 'about', 'now'].map(section => ({ path: [section] })),
    ...work.map(entry => ({ path: ['work', entry.slug] })),
    ...playground.map(entry => ({ path: ['playground', entry.slug] })),
    ...notes.map(entry => ({ path: ['notes', entry.slug] })),
  ];
}
// Keep the persistent layout and all client-side 3D interaction unchanged.
export default function Page() {
  return null;
}
