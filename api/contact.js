export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  console.log('contact body received:', JSON.stringify(req.body), 'typeof:', typeof req.body);

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Faltan campos requeridos: name, email, message.' });
    return;
  }

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio <contacto@sebastianmunoz.dev>',
        to: 'semucas27@gmail.com',
        reply_to: email,
        subject: `Nuevo mensaje de ${name} — Portfolio`,
        text: `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`,
      }),
    });

    if (!resendRes.ok) {
      const details = await resendRes.text();
      res.status(resendRes.status).json({ error: 'Resend no pudo enviar el correo.', details });
      return;
    }

    const data = await resendRes.json();
    res.status(200).json({ ok: true, id: data.id });
  } catch (err) {
    res.status(500).json({ error: 'Error interno al enviar el correo.' });
  }
}
