# Security Checklist

## Isolamento de dados por tenant
- [ ] Todas as rotas autenticadas filtram por tenantId vindo do banco (não do request)
- [ ] Testado com dois usuários distintos — usuário A não vê dados do usuário B

## Página pública /confirmar/[token]
- [ ] Expõe apenas dados mínimos necessários
- [ ] Rate limiting ativo contra brute force
- [ ] Erro genérico para token inválido (não revela informações)

## Controle de acesso
- [ ] Whitelist de emails ativa (pré-Stripe)
- [ ] Como adicionar email: editar ALLOWED_EMAILS no Vercel → Redeploy

## Secrets e ambiente
- [ ] Nenhuma variável de ambiente logada no console
- [ ] npm audit executado — zero vulnerabilidades críticas
- [ ] .env não commitado (.gitignore ok)

## Deploy
- [ ] Worker Trigger.dev: npx prisma generate && ./node_modules/.bin/trigger deploy
- [ ] Migrations em produção: npx prisma migrate deploy
