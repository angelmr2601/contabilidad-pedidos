import assert from 'node:assert/strict';
import test from 'node:test';
process.env.HOSTINGER_MAIL_API_BASE_URL='https://api.mail.hostinger.com';
process.env.HOSTINGER_MAIL_API_TOKEN='test-token';
process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='test-key';
const { hostingerMailRequest, redactHeaders } = await import('../lib/hostinger-mail/client.ts');
const { validateSendMail, sanitizeMailHtml, parseWebhookPayload } = await import('../lib/hostinger-mail/schemas.ts');
test('auth bearer and pagination request', async()=>{ let seen; const data=await hostingerMailRequest('/mail/messages?page=2',{fetchImpl:async (url,init)=>{seen={url,init}; return Response.json({items:[],page:2});}}); assert.equal(seen.init.headers.authorization,'Bearer test-token'); assert.equal(data.page,2); });
test('missing token', async()=>{ delete process.env.HOSTINGER_MAIL_API_TOKEN; await assert.rejects(()=>hostingerMailRequest('/x',{fetchImpl:fetch}),/configurada/); process.env.HOSTINGER_MAIL_API_TOKEN='test-token';
process.env.NEXT_PUBLIC_SUPABASE_URL='https://example.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY='test-key'; });
for (const status of [401,429,500]) test(`http ${status}`, async()=>{ await assert.rejects(()=>hostingerMailRequest('/x',{retry:false,fetchImpl:async()=>Response.json({error:'secret'}, {status})}), err=>err.status===status && !String(err.message).includes('secret')); });
test('timeout', async()=>{ await assert.rejects(()=>hostingerMailRequest('/x',{timeoutMs:1,fetchImpl:async (_u,init)=>new Promise((_,rej)=>init.signal.addEventListener('abort',()=>rej(Object.assign(new Error('aborted'),{name:'AbortError'}))))}), err=>err.status===504); });
test('send form validation', ()=>{ assert.equal(validateSendMail({to:[],subject:'a',text:'b'}),'Añade al menos un destinatario válido.'); assert.equal(validateSendMail({to:['a@b.com'],subject:'a',text:'b'}),null); });
test('sanitize html', ()=>{ const out=sanitizeMailHtml('<p onclick="x()">Hola<img src="https://t"></p><script>x()</script>'); assert(!out.includes('script')); assert(!out.includes('onclick')); assert(out.includes('data-blocked-src')); });
test('webhook parse', ()=>{ assert(parseWebhookPayload({event:'message.received',id:'1'})); assert(parseWebhookPayload({event_type:'message.received',event_id:'evt_1'})); assert.equal(parseWebhookPayload({event:'x'}),null); });
test('redact authorization', ()=>{ assert.equal(redactHeaders({authorization:'Bearer abc'}).get('authorization'),'Bearer [REDACTED]'); });

const { webhookPayloadToRow } = await import('../lib/hostinger-mail/status-db.ts');
test('webhook payload maps to persisted metadata', ()=>{ const row=webhookPayloadToRow({event:'message.received',id:'m1',message:{mailbox:'box',from:{email:'cliente@example.com',name:'Cliente'},subject:'Pedido',excerpt:'Hola',timestamp:'2026-06-24T10:00:00.000Z'}}); assert.equal(row.message_id,'m1'); assert.equal(row.sender_email,'cliente@example.com'); assert.equal(row.subject,'Pedido'); });

test('webhook payload maps event_type and Agentic-style fields', ()=>{ const row=webhookPayloadToRow({event_type:'message.received',event_id:'evt_2',message:{message_id:'msg_2',mailbox_id:'mailbox_1',from_:['cliente2@example.com'],subject:'Nuevo',truncated_message:'Resumen'}}); assert.equal(row.message_id,'msg_2'); assert.equal(row.sender_email,'cliente2@example.com'); assert.equal(row.excerpt,'Resumen'); });

test('webhook payload maps Hostinger documented top-level metadata', ()=>{ const row=webhookPayloadToRow({event_type:'message.received',message_id:'msg_top',mailbox:'ventas@offsideclub.shop',sender:'Comprador <comprador@example.com>',subject:'Consulta camiseta',truncated_message:'Hola, quiero información',timestamp:'2026-06-24T20:30:00.000Z'}); assert.equal(row.message_id,'msg_top'); assert.equal(row.sender_email,'comprador@example.com'); assert.equal(row.sender_name,'Comprador'); assert.equal(row.subject,'Consulta camiseta'); assert.equal(row.excerpt,'Hola, quiero información'); });

test('webhook payload recursively maps nested Hostinger metadata', ()=>{ const row=webhookPayloadToRow({event_type:'message.received',data:{email:{id:'deep_id',from:{email:'deep@example.com',name:'Deep'},subject:'Profundo',preview:'Texto profundo',received_at:'2026-06-24T22:00:00.000Z'}}}); assert.equal(row.message_id,'deep_id'); assert.equal(row.sender_email,'deep@example.com'); assert.equal(row.subject,'Profundo'); assert.equal(row.excerpt,'Texto profundo'); });

test('webhook payload maps official Hostinger sample fields', ()=>{ const row=webhookPayloadToRow({id:'019d5234-a855-7596-a794-3a691958b970',event:'message.received',timestamp:'2026-04-03T12:00:00Z',data:{mailboxAddress:'test@hostinger.com',messageId:'<a@b.com>',subject:'test email',from:'Foo <foo@hostinger.com>',to:['Admin <test@hostinger.com>'],date:'Fri, 3 Apr 2026 06:21:33 +0000 (UTC)',plainBody:'abc 123',plainHtml:'',bodyUrl:'https://download-url',attachments:[{contentType:'application/pdf',filename:'document.pdf',sizeBytes:12345,fileUrl:'https://download-url'}]}}); assert.equal(row.message_id,'<a@b.com>'); assert.equal(row.mailbox,'test@hostinger.com'); assert.equal(row.sender_email,'foo@hostinger.com'); assert.equal(row.sender_name,'Foo'); assert.equal(row.subject,'test email'); assert.equal(row.excerpt,'abc 123'); assert.equal(row.received_at,'Fri, 3 Apr 2026 06:21:33 +0000 (UTC)'); assert.deepEqual(row.recipients,['Admin <test@hostinger.com>']); assert.equal(row.plain_body,'abc 123'); assert.equal(row.attachments[0].filename,'document.pdf'); });
