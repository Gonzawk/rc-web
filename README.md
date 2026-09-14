# RC Repuestos y Accesorios — Demo candidata a producción

Frontend React + Vite de RC Repuestos y Accesorios para presentar el flujo comercial, catálogo público y operación diaria de una casa de repuestos de motos.

## Ejecutar

```bash
npm install
npm run dev
```

Panel demo: `/admin`  
PIN: `2468`

> Si ya abriste una versión anterior de la demo, entrá al panel y usá **Restablecer demo** en Configuración para cargar los nuevos banners, marcas y datos históricos.

## Alcance implementado

- Home responsive desktop/mobile con identidad RC Repuestos y Accesorios.
- Carrusel principal automático, flechas, puntos y swipe táctil.
- Imagen desktop y mobile independientes por banner.
- Pasarela automática de marcas con pausa al hover y vínculo al catálogo filtrado.
- Mega menú de Productos con categorías, subcategorías, modelos/búsquedas rápidas y productos destacados.
- Catálogo, búsqueda, filtros y pedido por WhatsApp.
- Llamado mayorista directo por WhatsApp solicitando producto y cantidad.
- Pedido WhatsApp pendiente: no descuenta stock hasta confirmación administrativa.
- Venta presencial / POS con descuento por porcentaje o monto.
- Confirmación de pedido WhatsApp con descuento por porcentaje o monto.
- Compras con descuento por porcentaje o monto. El descuento se prorratea para guardar costo unitario neto real.
- Stock y trazabilidad de movimientos.
- Caja, ventas, compras y estadísticas sobre importes netos reales.
- Datos históricos demo para analizar varios períodos.
- Administrador de banners y logos desde **Sistema > Banners y marcas**.

## Imágenes: arquitectura recomendada para producción

La base de datos **no debería guardar los archivos binarios**. Debe guardar metadatos y URLs:

- `HomeBanner`: título, subtítulo, CTA, orden, activo, `DesktopImageUrl`, `MobileImageUrl`.
- `BrandShowcase`: nombre, `LogoUrl`, orden, activo, texto de búsqueda.

Los archivos deberían alojarse en un storage/CDN (Cloudflare R2, Amazon S3, Azure Blob, etc.). El backend valida dimensiones/peso, genera WebP/AVIF y devuelve la URL pública.

Para banners recomendamos:

- Desktop: 1920×720 px aprox. (8:3 / 2.66:1), WebP/AVIF, ideal < 350 KB.
- Mobile: 1080×1350 px (4:5), WebP/AVIF, ideal < 250 KB.
- Mantener texto/logos importantes dentro del 70% central de seguridad.

Para logos:

- SVG preferido o PNG/WebP transparente.
- Lienzo recomendado 600×240 px (2.5:1).
- Sin fondo y con margen interno.

La demo permite pegar URL o cargar una imagen local (DataURL) para presentar la administración. En producción, la carga local debe reemplazarse por `POST /api/media` hacia el storage.

## Modelo de descuento

En compras y ventas se guarda:

- subtotal bruto/lista;
- tipo (`percent`, `amount`, `none`);
- valor ingresado;
- monto de descuento;
- total neto;
- prorrateo por renglón;
- costo/precio unitario neto efectivo.

Así los reportes de margen y rentabilidad no usan el precio de lista sino el valor económico real de cada operación.

## Identidad del proyecto

El nombre visible, técnico y las claves de almacenamiento de esta entrega están normalizados como **RC Repuestos y Accesorios**. La base quedó depurada de módulos y recursos ajenos al negocio de repuestos.
