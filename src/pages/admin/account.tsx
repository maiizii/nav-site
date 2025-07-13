import { useEffect, useState } from 'react';

export default function AccountPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/admin/account', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        if (data.success) setAdmin(data.data);
        else window.location.href = '/login';
      });
  }, []);

  const handleChangePassword = async (e: any) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage('两次输入的新密码不一致');
      return;
    }
    const res = await fetch('/admin/account/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: form.oldPassword, newPassword: form.newPassword }),
      credentials: 'include'
    });
    const data = await res.json();
    setMessage(data.message || (data.success ? '修改成功' : '修改失败'));
    setForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-xl font-bold mb-4">账号设置</h2>
      {admin && (
        <div className="mb-4">
          <strong>当前用户：</strong> {admin.username}
        </div>
      )}
      <form onSubmit={handleChangePassword}>
        <div className="mb-2">
          <input type="password" placeholder="当前密码" className="w-full border px-2 py-1 rounded"
            value={form.oldPassword} onChange={e => setForm({ ...form, oldPassword: e.target.value })} required />
        </div>
        <div className="mb-2">
          <input type="password" placeholder="新密码" className="w-full border px-2 py-1 rounded"
            value={form.newPassword} onChange={e => setForm({ ...form, newPassword: e.target.value })} required minLength={6} />
        </div>
        <div className="mb-2">
          <input type="password" placeholder="确认新密码" className="w-full border px-2 py-1 rounded"
            value={form.confirmPassword} onChange={e => setForm({ ...form, confirmPassword: e.target.value })} required minLength={6} />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">修改密码</button>
        {message && <div className="mt-2 text-center text-green-600">{message}</div>}
      </form>
    </div>
  );
}
