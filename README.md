# Barganha.io

Protótipo de comparação de preços feito com React, Vite, Django e Django REST Framework. A busca agrupa ofertas do mesmo produto e permite comparar os preços de até três lojas nesta demonstração.

> **Dados demonstrativos:** os produtos e preços são fictícios e estão definidos no backend. O projeto ainda não consulta lojas reais, atualiza preços automaticamente, envia alertas nem oferece contas de usuário.

## O que funciona

- Busca por produto, modelo, categoria ou loja.
- Comparação das ofertas de cada produto, ordenadas do menor ao maior preço.
- Cálculo da economia em relação ao preço anterior informado nos dados de exemplo.
- Filtro por categoria e favoritos temporários enquanto a página está aberta.

## Rodar localmente

Requisitos: Python compatível com as dependências em `requirements.txt` e Node.js compatível com Vite 8.

No primeiro terminal (PowerShell), na raiz do projeto:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python backend/manage.py migrate
python backend/manage.py runserver
```

No segundo terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Se usar Git Bash, no primeiro terminal execute:

```bash
python -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt
./.venv/Scripts/python.exe backend/manage.py migrate
./.venv/Scripts/python.exe backend/manage.py runserver
```

No segundo terminal Git Bash, os comandos `cd frontend`, `npm ci` e `npm run dev` são os mesmos.

Abra `http://localhost:5173`. A API local responde em `http://127.0.0.1:8000/api/health/` e a busca em `/api/offers/search/?q=monitor`.

## Configuração

Para desenvolvimento local, os valores padrão já permitem iniciar o projeto. Os exemplos de configuração estão em `backend/.env.example` e `frontend/.env.example`. O Django lê `DJANGO_SECRET_KEY`, `DJANGO_DEBUG`, `DJANGO_ALLOWED_HOSTS` e `DJANGO_CORS_ALLOWED_ORIGINS` do ambiente. O frontend lê `VITE_API_URL` de `frontend/.env.local` quando você precisa apontar para outra API.

Antes de colocar o backend em produção, defina uma nova chave secreta por variável de ambiente, use `DJANGO_DEBUG=false`, configure os domínios permitidos, execute `python backend/manage.py check --deploy` e revise os requisitos de hospedagem do Django. A chave antiga que esteve no histórico do Git nunca deve ser usada em produção.

## Verificação

```powershell
python backend/manage.py test promo_alerts
cd frontend
npm run lint
npm run build
```

## Próximas etapas

Criar modelos de produto, loja e oferta no banco de dados; cadastrar ofertas pelo painel administrativo; depois adicionar histórico de preços e alertas. Uma publicação da interface para acesso pela internet dependerá de hospedar também a API e configurar `VITE_API_URL` e CORS.
