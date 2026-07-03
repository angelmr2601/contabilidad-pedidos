import assert from 'node:assert/strict';
import test from 'node:test';
const { normalizarEstado17Track, getTrackingEstadoLabel } = await import('../lib/tracking/normalizar.ts');

test('electronic information received plus physical events is in transit, not delivered', () => {
  const snapshot = normalizarEstado17Track({
    status: 'InTransit',
    events: [
      { time: '2026-07-02 23:51', description: '预计航班启运时间 Salida prevista (2026-7-4)' },
      { time: '2026-07-02 23:51', description: 'La carga pasada a la aerolínea' },
      { time: '2026-07-02 23:51', description: '国内清关完成 Se ha completado el despacho aduanero nacional' },
      { time: '2026-07-01 03:44', description: '广州, Las mercancías salen del centro de operaciones', location: '广州' },
      { time: '2026-07-01 02:46', description: '广州, Llega al punto de recogida', location: '广州' },
      { time: '2026-06-30 22:02', description: 'Se ha recibido información electrónica sobre los bienes' },
    ],
  });
  assert.equal(snapshot.estadoInterno, 'de_camino');
  assert.equal(getTrackingEstadoLabel(snapshot.estadoInterno), 'En camino');
  assert.match(snapshot.ultimoEvento ?? '', /Salida prevista|aerolínea/);
});

test('electronic information received alone is preparing shipment', () => {
  const snapshot = normalizarEstado17Track({ status: 'InfoReceived', events: [{ description: 'Shipment information received' }] });
  assert.equal(snapshot.estadoInterno, 'preparando_envio');
});

test('strict final delivery phrases map to delivered package received', () => {
  const snapshot = normalizarEstado17Track({ status: 'Delivered', events: [{ description: 'Delivered to recipient' }] });
  assert.equal(snapshot.estadoInterno, 'entregado');
  assert.equal(getTrackingEstadoLabel(snapshot.estadoInterno), 'Paquete recibido');
});
