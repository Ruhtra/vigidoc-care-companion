---
trigger: glob
description: Diretrizes de Animações com Framer Motion
globs: **/*.{tsx,jsx}
---

**Regras de Animações (Framer Motion):**

- Use **Framer Motion** para todas as animações e micro-interações.
- Crie uma **animation language** coesa e refinada (orgânica, suave, delightfull) alinhada à identidade do projeto.
- Sempre crie variantes reutilizáveis em um arquivo dedicado (ex: `animations/variants.ts`).
- Crie componentes e hooks reutilizáveis para animações comuns (`SoftReveal`, `FloatingElement`, `FadeIn`, etc.).
- Animações devem ser suaves, orgânicas e nunca distrativas; prefira `easeInOut` ou curvas cúbicas personalizadas com durações generosas.
- Inclua scroll reveals gentis, hover refinados, page transitions e elementos flutuantes quando fizer sentido para a experiência.
- Lembre-se de respeitar a preferência do usuário por movimento reduzido (`prefers-reduced-motion`).
