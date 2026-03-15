---
trigger: model_decision
description: Regras específicas para formulários e comunicação com API
---

**Regras para Formulários e Data Fetching:**

Aplique estas regras **somente** quando o contexto envolver criação/edição de formulários ou comunicação com API:

- **Formulários** → obrigatoriamente use **React Hook Form** + **Zod** (com `zodResolver`) para validação.
- **Comunicação com API**, fetching ou mutação → use **TanStack Query** (v5).
- Durante desenvolvimento ou testes → sempre crie **mocks** realistas e bem estruturados. Prefira utilizar **Faker.js** para gerar dados falsos consistentes e variados, garantindo que os componentes sejam testados com dados próximos da realidade.
- Para chamadas a serviços externos (ex.: APIs de IA), utilize variáveis de ambiente para chaves e endpoints, nunca expondo segredos no front-end.
- Prefira hooks customizados para encapsular lógica de busca e mutação, mantendo os componentes limpos.
