const BASE_URL = `https://graph.facebook.com/${process.env.META_API_VERSION}`;

export async function sendTextMessage(phoneNumberId, to, text, accessToken) {
  const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to,
      type: 'text',
      text: { preview_url: false, body: text },
    }),
  });
  return res.json();
}

export async function sendTemplateMessage(
  phoneNumberId,
  to,
  templateName,
  languageCode = 'en',
  components = [],
  accessToken
) {
  const res = await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template: { name: templateName, language: { code: languageCode }, components },
    }),
  });
  return res.json();
}

export async function markMessageRead(phoneNumberId, messageId, accessToken) {
  await fetch(`${BASE_URL}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      status: 'read',
      message_id: messageId,
    }),
  });
}

export async function getTemplates(wabaId, accessToken) {
  const res = await fetch(`${BASE_URL}/${wabaId}/message_templates`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return res.json();
}
