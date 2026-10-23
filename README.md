# Alo Yoga US Outlet (alo-eua)

Loja virtual de alta conversão réplica da Alo Yoga para o mercado dos Estados Unidos, com suporte a checkout via Stripe (Cartão de Crédito, Apple Pay, Google Pay, Klarna e Afterpay), cálculo automático de desconto de 70%, frete USPS Priority e layout 100% responsivo para mobile e desktop.

---

## 🚀 Como Hospedar no Heroku (Passo a Passo)

Este repositório está **100% configurado para rodar no Heroku com 1 único comando**:
- **Procfile:** `web: node server.js`
- **Build automático:** `heroku-postbuild: npm run build`
- **Servidor unificado:** O `server.js` atende a API do Stripe e serve os arquivos estáticos do frontend (`dist/index.html`).

### Opção 1: Pelo Heroku CLI (Terminal)

1. Faça login no Heroku:
   ```bash
   heroku login
   ```

2. Crie a aplicação no Heroku com o nome `alo-eua` (ou o nome que preferir):
   ```bash
   heroku create alo-eua
   ```

3. Defina as variáveis de ambiente com suas chaves da Stripe no Heroku:
   ```bash
   heroku config:set NODE_ENV=production \
     STRIPE_PUBLISHABLE_KEY="SUA_CHAVE_PUBLICA_STRIPE" \
     STRIPE_SECRET_KEY="SUA_CHAVE_SECRETA_STRIPE" \
     STRIPE_RESTRICTED_KEY="SUA_CHAVE_RESTRITA_STRIPE" \
     VITE_STRIPE_PUBLISHABLE_KEY="SUA_CHAVE_PUBLICA_STRIPE"
   ```

4. Envie o código para o Heroku:
   ```bash
   git push heroku main
   ```

5. Abra sua loja no ar:
   ```bash
   heroku open
   ```

---

### Opção 2: Pelo Painel Web do Heroku (Dashboard)

1. Crie um repositório no seu GitHub chamado `alo-eua`:
   ```bash
   git remote add origin https://github.com/sabrina13maciel-a11y/alo-eua.git
   git branch -M main
   git push -u origin main
   ```
2. Acesse [dashboard.heroku.com](https://dashboard.heroku.com) e clique em **New -> Create new app** (Nome: `alo-eua`).
3. Em **Deployment method**, conecte sua conta do GitHub e selecione o repositório `alo-eua`.
4. Vá na aba **Settings -> Config Vars -> Reveal Config Vars** e adicione:
   - `NODE_ENV`: `production`
   - `STRIPE_PUBLISHABLE_KEY`: *(sua chave pública Stripe)*
   - `STRIPE_SECRET_KEY`: *(sua chave secreta Stripe)*
   - `STRIPE_RESTRICTED_KEY`: *(sua chave restrita Stripe)*
   - `VITE_STRIPE_PUBLISHABLE_KEY`: *(sua chave pública Stripe)*
5. Volte para a aba **Deploy**, selecione a branch `main` e clique em **Deploy Branch** (ou ative *Automatic Deploys*).

---

## 🌐 Configurar Domínio Próprio no Heroku

Para usar seu domínio próprio (ex: `alo-eua.shop` ou `outletalo.com`):
1. No painel do Heroku, vá em **Settings -> Domains -> Add domain**.
2. Digite seu domínio (ex: `www.alo-eua.com`).
3. O Heroku fornecerá um DNS Target (ex: `www.alo-eua.com.herokudns.com`).
4. No seu provedor de domínio (GoDaddy, Namecheap, Cloudflare, Registro.br):
   - Adicione um registro **CNAME**:
     - Host: `www`
     - Destino: `www.alo-eua.com.herokudns.com`
5. O Heroku ativa o certificado **SSL HTTPS Gratuito** automaticamente pelo ACM (Automated Certificate Management).

---

## 💻 Como Rodar Localmente

1. Instalar dependências:
   ```bash
   npm install
   ```
2. Rodar o servidor de desenvolvimento do frontend:
   ```bash
   npm run dev
   ```
3. Rodar o backend localmente:
   ```bash
   node server.js
   ```
4. Testar a build de produção localmente:
   ```bash
   npm run build
   node server.js
   # Acesse http://localhost:3001
   ```
