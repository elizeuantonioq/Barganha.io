<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=700&size=38&duration=3000&pause=1200&color=B5E549&center=true&vCenter=true&width=650&lines=Barganha.io" alt="Barganha.io" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django" />
  <img src="https://img.shields.io/badge/Django%20REST-FF1709?style=for-the-badge&logo=django&logoColor=white" alt="Django REST Framework" />
</p>

<p align="center"><strong>Compare o preço de um produto em várias lojas e acompanhe como ele muda.</strong></p>
<p align="center">Projeto pessoal de <a href="https://github.com/elizeuantonioq">Elizeu Antonio</a></p>

<hr />

## Sobre

O Barganha.io é um protótipo full stack de comparação de preços. Você busca um produto e vê, lado a lado, quanto ele custa em cada loja, qual é a oferta mais barata, quanto se economiza em relação ao preço anterior e como o preço variou ao longo do tempo.

> [!NOTE]
> **Os dados são de demonstração.** Os produtos, lojas e preços são fictícios e ficam salvos no banco local. O projeto ainda não consulta lojas reais, não atualiza preços sozinho, não tem contas de usuário e não envia alertas.

## Funcionalidades

- **Busca** por nome do produto, modelo, categoria ou loja.
- **Comparação entre lojas**, com as ofertas ordenadas do menor para o maior preço e a diferença de cada uma para a mais barata.
- **Economia calculada** em relação ao preço anterior (valor e percentual).
- **Destaque** para o produto com o maior desconto.
- **Histórico de preços** com gráfico por loja (Recharts). Toda mudança de preço de uma oferta é registrada automaticamente.
- **Filtro por categoria** e **favoritos**, que ficam salvos no navegador (`localStorage`).
- **Painel administrativo do Django** para cadastrar produtos e ofertas e consultar o histórico.

## Tecnologias

| Camada   | Ferramentas                                              |
| -------- | -------------------------------------------------------- |
| Frontend | React 19, Vite 8, Tailwind CSS 4, Recharts, ESLint       |
| Backend  | Python, Django 6, Django REST Framework, django-cors-headers |
| Banco    | SQLite (desenvolvimento)                                 |

## Estrutura

```
Barganha.io/
├── backend/
│   ├── config/            # settings, urls, wsgi/asgi
│   └── promo_alerts/      # modelos, API, admin, testes e comando de dados demo
├── frontend/
│   └── src/
│       ├── components/    # Header, SearchForm, OfferRow, PriceHistoryChart...
│       └── services/      # chamadas à API (offers.js)
└── requirements.txt
```

## Rodar localmente

**Requisitos:** Python 3 (compatível com Django 6) e Node.js (compatível com Vite 8).

### 1. Backend

No PowerShell, a partir da raiz do projeto:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python backend/manage.py migrate
python backend/manage.py load_demo_products
python backend/manage.py runserver
```

> O comando `load_demo_products` cadastra os produtos de exemplo. Sem ele, a busca não retorna nada. Pode rodar de novo sem problemas: ele atualiza os dados e mantém o histórico.

<details>
<summary>Usando Git Bash</summary>

```bash
python -m venv .venv
./.venv/Scripts/python.exe -m pip install -r requirements.txt
./.venv/Scripts/python.exe backend/manage.py migrate
./.venv/Scripts/python.exe backend/manage.py load_demo_products
./.venv/Scripts/python.exe backend/manage.py runserver
```

</details>

### 2. Frontend

Em outro terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Abra **http://localhost:5173**.

> No VS Code, a tarefa **"Rodar Barganha.io"** (`Terminal → Run Task`) sobe o backend e o frontend juntos, depois que o ambiente virtual estiver criado.

### 3. Painel administrativo (opcional)

```powershell
python backend/manage.py createsuperuser
```

Depois acesse **http://127.0.0.1:8000/admin/**. Ao alterar o preço de uma oferta por lá, um novo ponto aparece no histórico.

## API

URL base: `http://127.0.0.1:8000/api`

| Método | Rota                             | Descrição                                                        |
| ------ | -------------------------------- | ---------------------------------------------------------------- |
| GET    | `/health/`                       | Verifica se a API está no ar                                     |
| GET    | `/offers/search/?q=<termo>`      | Busca produtos por nome, modelo, categoria ou loja (sem `q`, retorna todos) |
| GET    | `/offers/<id>/history/`          | Histórico de preços do produto, agrupado por loja                |

Exemplo: `http://127.0.0.1:8000/api/offers/search/?q=monitor`

## Configuração

Os valores padrão já servem para desenvolvimento local. Os modelos de configuração estão em `backend/.env.example` e `frontend/.env.example`.

| Variável                      | Onde       | Padrão                                         |
| ----------------------------- | ---------- | ---------------------------------------------- |
| `DJANGO_SECRET_KEY`           | backend    | chave fixa de desenvolvimento (só com debug ligado; obrigatória em produção) |
| `DJANGO_DEBUG`                | backend    | `true`                                         |
| `DJANGO_ALLOWED_HOSTS`        | backend    | `127.0.0.1,localhost`                          |
| `DJANGO_CORS_ALLOWED_ORIGINS` | backend    | `http://localhost:5173,http://127.0.0.1:5173`  |
| `VITE_API_URL`                | frontend   | `http://127.0.0.1:8000`                        |

As variáveis do Django são lidas do ambiente. Para o frontend, crie `frontend/.env.local` quando precisar apontar para outra API.

## Testes

```powershell
python backend/manage.py test promo_alerts
cd frontend
npm run lint
npm run build
```

Os testes do backend cobrem a busca, a ordenação das ofertas, o registro automático do histórico, o endpoint de histórico e o comando de dados de demonstração.

## Próximos passos

- [x] Modelos de produto e oferta no banco
- [x] Cadastro pelo painel administrativo
- [x] Histórico de preços com gráfico
- [ ] Integrar fontes reais de preços, mostrando a origem e o horário de cada preço
- [ ] Contas de usuário e favoritos salvos no servidor
- [ ] Alertas de queda de preço
- [ ] Publicar a interface e a API online

## Antes de publicar

Para colocar o backend em produção: defina uma nova `DJANGO_SECRET_KEY`, use `DJANGO_DEBUG=false`, configure `DJANGO_ALLOWED_HOSTS` e `DJANGO_CORS_ALLOWED_ORIGINS` e rode `python backend/manage.py check --deploy`. A chave antiga que ficou no histórico do Git **nunca** deve ser usada em produção.
