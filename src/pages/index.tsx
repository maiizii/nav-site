import { useEffect, useState } from 'react';

type NavLink = {
  id: number;
  title: string;
  url: string;
  category: string;
  description: string;
};

export default function Home() {
  const [links, setLinks] = useState<NavLink[]>([]);
  useEffect(() => {
    fetch('/nav/list').then(res => res.json()).then(data => setLinks(data.data));
  }, []);
  return (
    <main className="p-4 mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">导航站</h1>
      {links.map(link => (
        <div key={link.id} className="mb-4 p-4 border rounded">
          <a className="text-blue-600 font-semibold" href={link.url} target="_blank">{link.title}</a>
          <p className="text-gray-500">{link.category} | {link.description}</p>
        </div>
      ))}
    </main>
  );
}
