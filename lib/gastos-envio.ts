export function calcularGastoEnvioPedido(cantidadProductos: number) {
  if (cantidadProductos <= 0 || cantidadProductos >= 5) {
    return 0;
  }

  const gastosEnvioPorCantidad: Record<number, number> = {
    1: 3.4,
    2: 2.6,
    3: 1.7,
    4: 0.9,
  };

  return gastosEnvioPorCantidad[cantidadProductos] ?? 0;
}
