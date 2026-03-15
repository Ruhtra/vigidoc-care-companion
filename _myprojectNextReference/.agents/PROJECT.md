---
mode: Always On
description: Briefing e contexto específico do projeto VigiDoc
---

**Nome do Projeto:** VigiDoc

**Tipo de Negócio:**  
Sistema de monitoramento de saúde com dashboards para profissionais (administradores) e pacientes.

**Objetivo Principal do Site:**  
Oferecer uma interface intuitiva e eficiente para visualização de dados de pacientes, filas de prioridade, histórico médico e lembretes. Deve transmitir confiança, clareza e profissionalismo, facilitando a tomada de decisões rápidas na área da saúde.

**Público-alvo Principal:**

- Profissionais de saúde (médicos, enfermeiros, administradores hospitalares)
- Pacientes que desejam acompanhar seu histórico e lembretes
- Equipes de gestão hospitalar

**Branding & Visual Identity:**

- **Vibe Geral:** Profissional, limpa, acolhedora e acessível. Foco em legibilidade e hierarquia da informação.
- **Tom de Voz:** Profissional, claro, acolhedor e direto – como um sistema de saúde que transmite segurança e confiança.

**Arquitetura do Projeto (resumo):**

- Aplicação Next.js (React com Next.js App Router).
- Separação clara entre componentes administrativos e de pacientes.
- Dados mockados para desenvolvimento; futura integração com APIs reais via TanStack Query.
- Autenticação simulada com dois perfis: Admin e User.
- Geração de dados mockados utilizando **Faker.js** para criar exemplos realistas de pacientes, históricos, lembretes e métricas.

**Funcionalidades Principais:**

- Dashboard geral com métricas (para admin)
- Lista de pacientes e fila de prioridade (triage)
- Histórico médico e lembretes (para pacientes)
- Alternância de tema (claro/escuro)
- Placeholders para leitor de QR Code e relatórios

**Restrições Conhecidas:**

- Dados mockados; sem API real no início do projeto ou funcionalidade de back-end.
