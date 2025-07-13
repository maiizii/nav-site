import { useEffect, useState } from 'react';

export default function AdminPage() {
  const [admin, setAdmin] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/account', { credentials: 'include' }).then(res => res.json()).then(data => {
      if (data.success) setAdmin(data.data);
      else window.location.href = '/login'; // 未登录跳转
    });
  }, []);

  return (
    <main className="p-4 mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold mb-4">后台管理</h1>
      {admin && (
        <div>
          <p>管理员：{admin.username}</p>
          <p>创建时间：{admin.created_at}</p>
        </div>
      )}
    </main>
  );
}
