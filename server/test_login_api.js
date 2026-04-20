async function testLogin() {
  try {
    const res = await fetch('http://localhost:5000/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@heavymach.com',
        password: 'password123'
      })
    });
    const data = await res.json();
    if (res.ok) {
      console.log('Login Success:', data);
    } else {
      console.error('Login Failed:', res.status, data);
    }
  } catch (error) {
    console.error('Connection Error:', error.message);
  }
}

testLogin();
