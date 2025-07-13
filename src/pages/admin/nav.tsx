import { useEffect, useState } from 'react';

export default function NavManage() {
  const [links, setLinks] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', url: '', category: '', description: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const fetchLinks = () => {
    fetch('/api/nav/list').then(res => res.json()).then(data => setLinks(data.data || []));
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setMessage('');
    const api = editingId ? '/api/nav/update' : '/api/nav/add';
    const payload = editingId ? { ...form, id: editingId } : form;
    const res = await fetch(api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      credentials: 'include'
    });
    const data = await res.json();
    setMessage(data.message || (editingId ? '修改成功' : '添加成功'));
    setForm({ title: '', url: '', category: '', description: '' });
    setEditingId(null);
    fetchLinks();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除吗？')) return;
    await fetch('/api/nav/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
      credentials: 'include'
    });
    fetchLinks();
  };

  const startEdit = (link: any) => {
    setEditingId(link.id);
    setForm({ title: link.title, url: link.url, category: link.category, description: link.description });
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">导航管理</h2>
      <form className="mb-6" onSubmit={handleSubmit}>
        <div className="mb-2 space-x-2">
          <input className="border px-2 py-1 rounded" placeholder="标题" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input className="border px-2 py-1 rounded" placeholder="链接" value={form.url}
            onChange={e => setForm({ ...form, url: e.target.value })} required />
          <input className="border px-2 py-1 rounded" placeholder="分类" value={form.category}
            onChange={e => setForm({ ...form, category: e.target.value })} />
          <input className="border px-2 py-1 rounded" placeholder="描述" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-1 rounded">
          {editingId ? '保存修改' : '添加导航'}
        </button>
        {editingId && (
          <button type="button" className="ml-2 px-4 py-1 rounded bg-gray-200" onClick={() => {
            setEditingId(null); setForm({ title: '', url: '', category: '', description: '' });
          }}>取消编辑</button>
        )}
        {message && <div className="mt-2 text-green-600">{message}</div>}
      </form>
      <table className="w-full border">
        <thead>
          <tr>
            <th>标题</th><th>类别</th><th>链接</th><th>描述</th><th>操作</th>
          </tr>
        </thead>
        <tbody>
          {links.map(link => (
            <tr key={link.id}>
              <td>{link.title}</td>
              <td>{link.category}</td>
              <td>
                <a href={link.url} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">{link.url}</a>
              </td>
              <td>{link.description}</td>
              <td>
                <button className="mr-1 text-sm px-2 py-1 bg-yellow-300 rounded" onClick={() => startEdit(link)}>编辑</button>
                <button className="text-sm px-2 py-1 bg-red-400 text-white rounded" onClick={() => handleDelete(link.id)}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
