# 📦 PHASE 3: Advanced Article Editor - Quick Reference

## ✅ Implementación Completada

### **Estado**: 🟢 COMPLETADO - Editor avanzado con bloques y exportación PDF

---

## 🎯 Características Implementadas

### 1. **Modelo de Bloques de Contenido**
- ✅ Sistema de bloques similar a WordPress Gutenberg
- ✅ 10 tipos de bloques: PARAGRAPH, HEADING_1-3, QUOTE, CODE, UNORDERED_LIST, ORDERED_LIST, IMAGE, DIVIDER
- ✅ 6 fuentes disponibles: Arial, Times New Roman, Courier New, Georgia, Verdana, Calibri
- ✅ 4 alineaciones de texto: LEFT, CENTER, RIGHT, JUSTIFY
- ✅ Estilos de texto: bold, italic, underline, strikethrough
- ✅ Colores personalizables (texto y fondo)
- ✅ Tamaño de fuente: 12-72px
- ✅ Soporte para imágenes con dimensiones
- ✅ Listas con niveles de anidación
- ✅ Ordenamiento automático de bloques

### 2. **API Endpoints**

#### **Bloques**
```
POST   /articles/:articleId/blocks              - Crear bloque
POST   /articles/:articleId/blocks/multiple     - Crear múltiples bloques
GET    /articles/:articleId/blocks              - Obtener todos los bloques
GET    /articles/:articleId/blocks/:blockId     - Obtener un bloque
PATCH  /articles/:articleId/blocks/:blockId     - Actualizar bloque
DELETE /articles/:articleId/blocks/:blockId     - Eliminar bloque
POST   /articles/:articleId/blocks/reorder      - Reordenar bloques
GET    /articles/:id/full                       - Artículo con bloques
GET    /articles/:id/pdf                        - Descargar PDF con marca de agua
```

#### **Autenticación**
- 🔒 Editor o Admin del artículo pueden crear/editar/eliminar bloques
- 🔓 Lectura pública de artículos publicados

### 3. **Exportación PDF**
- ✅ Generación de PDF con marca de agua "Propiedad de Conozca"
- ✅ Renderizado de todos los tipos de bloques
- ✅ Preservación de estilos (fuentes, colores, alineación)
- ✅ Headers automáticos (título, autor, fecha)
- ✅ Marca de agua personalizable
- ✅ Stream directo para descarga

---

## 📚 Ejemplos de Uso

### **Crear un Artículo con Bloques**

```bash
# 1. Autenticarse
TOKEN=$(curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"editor@example.com","password":"password"}' \
  | jq -r '.access_token')

# 2. Crear artículo
ARTICLE_ID=$(curl -X POST http://localhost:4000/articles \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mi Artículo Avanzado",
    "slug": "mi-articulo-avanzado",
    "content": "Contenido inicial",
    "authorId": "author-id",
    "categoryId": "category-id"
  }' | jq -r '.id')

# 3. Agregar bloques de contenido
curl -X POST http://localhost:4000/articles/$ARTICLE_ID/blocks/multiple \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "blocks": [
      {
        "type": "HEADING_1",
        "content": "Introducción al Editor Avanzado",
        "fontSize": 32,
        "fontFamily": "ARIAL",
        "textAlign": "CENTER",
        "isBold": true
      },
      {
        "type": "PARAGRAPH",
        "content": "Este editor permite crear contenido con formato avanzado similar a Microsoft Word.",
        "fontSize": 16,
        "fontFamily": "GEORGIA",
        "textAlign": "JUSTIFY"
      },
      {
        "type": "QUOTE",
        "content": "El contenido es rey, pero el formato es la corona.",
        "fontSize": 18,
        "fontFamily": "TIMES_NEW_ROMAN",
        "isItalic": true,
        "textColor": "#666666"
      },
      {
        "type": "UNORDERED_LIST",
        "content": "Múltiples fuentes disponibles",
        "fontSize": 16,
        "listItemLevel": 0
      },
      {
        "type": "UNORDERED_LIST",
        "content": "Estilos de texto personalizables",
        "fontSize": 16,
        "listItemLevel": 0
      },
      {
        "type": "CODE",
        "content": "const article = { title: \"Hello World\" };",
        "fontSize": 14,
        "fontFamily": "COURIER_NEW"
      }
    ]
  }'

# 4. Descargar PDF con marca de agua
curl -X GET "http://localhost:4000/articles/$ARTICLE_ID/pdf?includeWatermark=true&watermarkText=Propiedad%20de%20Conozca" \
  -o articulo.pdf
```

### **Actualizar un Bloque**

```bash
curl -X PATCH http://localhost:4000/articles/$ARTICLE_ID/blocks/$BLOCK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Contenido actualizado",
    "isBold": true,
    "fontSize": 20,
    "textColor": "#FF5733"
  }'
```

### **Reordenar Bloques**

```bash
curl -X POST http://localhost:4000/articles/$ARTICLE_ID/blocks/reorder \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "blockIds": ["block-3", "block-1", "block-2"]
  }'
```

---

## 🧪 Tests

### **Coverage**
```bash
cd apps/api
npm test
```

**Resultados**: ✅ 126 tests passing
- ArticleService: 28 tests
- ArticleController: 36 tests
- ArticleBlockService: 18 tests
- AuthService: 22 tests
- AuthController: 20 tests
- AppController: 2 tests

---

## 📋 Tipos de Bloques Disponibles

| Tipo             | Descripción                      | Propiedades Especiales       |
|------------------|----------------------------------|------------------------------|
| `PARAGRAPH`      | Párrafo de texto                 | Todos los estilos            |
| `HEADING_1`      | Encabezado nivel 1 (32px)        | Bold por defecto             |
| `HEADING_2`      | Encabezado nivel 2 (24px)        | Bold por defecto             |
| `HEADING_3`      | Encabezado nivel 3 (18px)        | Bold por defecto             |
| `QUOTE`          | Cita destacada                   | Borde izquierdo, italic      |
| `CODE`           | Bloque de código                 | Fondo gris, Courier          |
| `UNORDERED_LIST` | Lista con viñetas                | `listItemLevel` para nesting |
| `ORDERED_LIST`   | Lista numerada                   | `listItemLevel` para nesting |
| `IMAGE`          | Imagen                           | `imageUrl`, `imageAlt`       |
| `DIVIDER`        | Línea divisoria horizontal       | Sin contenido                |

---

## 🎨 Fuentes Disponibles

- `ARIAL` (Helvetica en PDF)
- `TIMES_NEW_ROMAN` (Times-Roman en PDF)
- `COURIER_NEW` (Courier en PDF)
- `GEORGIA` (Times-Roman fallback)
- `VERDANA` (Helvetica fallback)
- `CALIBRI` (Helvetica fallback)

---

## 📄 Generación de PDF

### **Características**
- ✅ Marca de agua diagonal semi-transparente
- ✅ Header con título, autor y fecha
- ✅ Renderizado de todos los tipos de bloques
- ✅ Preservación de estilos visuales
- ✅ Paginación automática
- ✅ Descarga directa con Content-Disposition

### **Parámetros de Query**
- `includeWatermark`: `true` (default) | `false`
- `watermarkText`: texto personalizado (default: "Propiedad de Conozca")

---

## 🚀 Próximos Pasos

### **Frontend (Fase 4)**
- [ ] Implementar editor WYSIWYG (React/Next.js)
- [ ] Drag & drop para reordenar bloques
- [ ] Preview en tiempo real
- [ ] Selector de fuentes y colores
- [ ] Upload de imágenes

### **Backend - Mejoras Opcionales**
- [ ] Soporte para imágenes embebidas en PDF (descarga automática)
- [ ] Templates de artículos
- [ ] Historial de versiones (versionado de bloques)
- [ ] Colaboración en tiempo real
- [ ] Auto-guardado

---

## 📦 Dependencias Agregadas

```json
{
  "pdfkit": "^0.17.2",
  "html2pdf.js": "^0.13.0",
  "@types/pdfkit": "^0.17.4"
}
```

---

## 📂 Archivos Creados

### **Backend**
- `packages/database/prisma/schema.prisma` - Modelo ArticleBlock + Enums
- `apps/api/src/articles/article-block.dto.ts` - DTOs para bloques
- `apps/api/src/articles/pdf.service.ts` - Servicio de generación PDF
- `apps/api/src/articles/article-block.service.spec.ts` - Tests unitarios
- `test/article-blocks.e2e-spec.ts` - Tests E2E

### **Documentación**
- `PHASE3_QUICK_REFERENCE.md` - Este archivo

---

## 🎉 ¡Fase 3 Completada!

El sistema ahora permite crear artículos con formato avanzado similar a Microsoft Word, con múltiples fuentes, estilos de texto y exportación a PDF con marca de agua personalizada.

**Total de tests**: 126 ✅
**Endpoints totales**: 18 (9 artículos + 9 bloques)
**Cobertura**: 100% de funcionalidades críticas

---

## 📞 Soporte

Para dudas o issues:
1. Revisar este documento
2. Consultar los tests como ejemplos
3. Verificar logs del servidor
4. Revisar schema de Prisma para estructura de datos
