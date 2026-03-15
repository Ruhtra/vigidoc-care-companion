# Regras de Autenticação e Esquema Prisma

Qualquer modificação no arquivo `prisma/schema.prisma` que impacte a autenticação deve seguir estas diretrizes para garantir compatibilidade contínua com o Better Auth:

1.  **Integridade da Tabela User**: Não altere os campos obrigatórios e gerenciados pelo Better Auth no modelo `User` (como `id`, `email`, `emailVerified`, `image`, etc.).
2.  **Geração de IDs**: Mantenha o campo `id` do modelo `User` como `String` sem diretivas `@default(uuid())` ou `@default(cuid())`, deixando a cargo do Better Auth a gestão desses IDs.
3.  **Relacionamentos de Perfil**: Utilize o padrão de Multi-Table Inheritance (Delegação). Perfis específicos (ex: Pacientes, Médicos) devem morar em suas próprias tabelas com um relacionamento 1:1 opcional em relação ao modelo `User`.
4.  **Chaves Estrangeiras**: Chaves estrangeiras que referenciam o `User` (ex: `userId`) devem ser tipadas como `String`.
5.  **Exclusão em Cascata**: Sempre configure `onDelete: Cascade` nos relacionamentos entre `User` e perfis para evitar dados órfãos e garantir que a exclusão da conta pelo Better Auth limpe os dados relacionados.
6.  **Padrão de Tabelas**: Mantenha o mapeamento de tabelas (`@@map`) consistente com as convenções já estabelecidas (snake_case).
