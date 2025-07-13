import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/account', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setAdmin(data.data);
        else window.location.href = '/login';
      });
  }, []);

  return (
    <main className="p-4 mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">后台管理</h1>
      {admin && (
        <div className="mb-6">
          <p>欢迎，<span className="font-bold">{admin.username}</span></p>
          <p>创建时间：{admin.created_at}</p>
        </div>
      )}
      <div>
        <a href="/admin/nav" className="mr-4 text-blue-600 underline">导航管理</a>
        <a href="/admin/account" className="text-blue-600 underline">账号设置</a>
      </div>
    </main>
  );
}
