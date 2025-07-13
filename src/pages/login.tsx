import { useState } from 'react';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    const form = e.target;
    const username = form.username.value;
    const password = form.password.value;

    try {
      const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setMessage('登录成功，正在跳转...');
        setTimeout(() => {
          window.location.href = '/admin';
        }, 1200);
      } else {
        setMessage(data.message || '登录失败');
      }
    } catch {
      setMessage('登录请求异常');
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <form className="w-full max-w-sm bg-white p-6 rounded shadow" onSubmit={handleLogin}>
        <h2 className="text-xl font-bold mb-4 text-center">管理员登录</h2>
        <input name="username" placeholder="用户名" className="w-full mb-2 px-3 py-2 border rounded" />
        <input name="password" type="password" placeholder="密码" className="w-full mb-4 px-3 py-2 border rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded" disabled={loading}>
          {loading ? '登录中...' : '登录'}
        </button>
        {message && <div className={`mt-4 text-center ${success ? 'text-green-600' : 'text-red-600'}`}>{message}</div>}
      </form>
    </div>
  );
}
