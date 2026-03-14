---
trigger: glob
globs: **/*.{tsx,jsx}
---

**Regras de Componentes e Estilização:**

- Dê **forte preferência** ao uso dos componentes oficiais do **shadcn/ui**.
- Customize os componentes shadcn para combinar com a visual identity do projeto (`rounded-xl`, `backdrop-blur`, `soft shadows`, etc.).
- Utilize **Tailwind CSS** para toda estilização adicional; evite CSS vanilla ou outras soluções.
- Para construção dinâmica de classes, utilize a função utilitária `cn` (combinação de `clsx` e `tailwind-merge`). Exemplo:

```
tsx
  import { cn } from "@/lib/utils";
  <div className={cn("base-class", condicional && "extra-class")} />
```
