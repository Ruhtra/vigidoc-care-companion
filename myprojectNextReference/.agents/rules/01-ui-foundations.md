---
trigger: glob
globs: **/*.{tsx,jsx}
---

**Regras Fundamentais de UI/UX:**

- Desenvolvimento sempre com estratégia **mobile-first**.
- Todo componente e página deve ser 100% responsivo e se adaptar perfeitamente aos breakpoints:
  - Celular (≤ 640px)
  - Tablet (641px – 1024px)
  - Desktop (> 1024px)
- Incluir micro-interações refinadas e intencionais (hover, clique, loading, feedback visual).
- Priorizar código legível, limpo e de fácil manutenção.
- Adicionar comentários claros em trechos complexos.
- Utilizar **TypeScript** para definir tipos de props e estado, garantindo segurança e autocompletar.
- Sempre considerar acessibilidade: contraste adequado, foco visível, labels semânticas e atributos ARIA quando necessário (mas sem perder o ofoc em beleza do design).
- Para gerenciamento de estado:
  - Prefira estado local (`useState`) para lógica isolada.
  - Use **Context API** para estados globais leves (tema, autenticação, navegação) e evite prop drilling.
