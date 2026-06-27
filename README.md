````markdown
# E-commerce Marketing BI SaaS

Arquitetura **Multi-Tenant** para gestão de lojas virtuais com motor de faturamento, catálogo dinâmico e painel analítico.

---

# Stack Tecnológica

## Frontend

- Next.js (App Router)
- React
- Tailwind CSS
- Axios

## Backend

- Python 3.11
- Django 5.x
- Django REST Framework
- SimpleJWT

## Banco de Dados

- PostgreSQL

## Infraestrutura

- Docker
- Docker Compose

---

# Estrutura do Projeto

```text
ecommerce-marketing-bi-saas/
├── .gitignore
├── docker-compose.yml
├── README.md
├── backend/
│   ├── api/
│   ├── manage.py
│   └── requirements.txt
├── docs/
│   ├── Conceitual.brM3
│   ├── MiniMundo.docx
│   ├── relatorio_final.pdf
│   └── telas/
├── frontend/
│   ├── app/
│   └── package.json
└── src/
```

---

# Instalação e Execução Local

Siga os passos abaixo para executar o projeto localmente.

## 1. Clone o repositório

```bash
git clone https://github.com/braian-data/ecommerce-marketing-bi-saas.git
cd ecommerce-marketing-bi-saas
```

## 2. Configure as variáveis de ambiente

Crie um arquivo chamado **.env** na raiz do projeto contendo:

```env
DEBUG=True
DATABASE_URL=postgres://postgres:postgres@db:5432/ecommerce_db
NEXT_PUBLIC_API_URL=http://localhost:8001
```

### Linux / macOS / WSL

```bash
cat <<EOF > .env
DEBUG=True
DATABASE_URL=postgres://postgres:postgres@db:5432/ecommerce_db
NEXT_PUBLIC_API_URL=http://localhost:8001
EOF
```

### Windows PowerShell

```powershell
@"
DEBUG=True
DATABASE_URL=postgres://postgres:postgres@db:5432/ecommerce_db
NEXT_PUBLIC_API_URL=http://localhost:8001
"@ | Out-File -FilePath .env -Encoding utf8
```

## 3. Construir e iniciar os containers

```bash
docker compose up -d --build
```

## 4. Executar as migrações

```bash
docker compose exec backend python manage.py migrate
```

## 5. Criar o Plano Base

```bash
docker compose exec backend python manage.py shell -c "from api.models import Plano; Plano.objects.get_or_create(id=1, defaults={'nome':'Premium','limite_lojas':10,'limite_imagens':100,'limite_api':1000,'espaco_armazenamento':5000})"
```

## 6. Popular o banco de dados (Opcional)

```bash
docker compose exec backend python manage.py seed_dados
```

---

# Endpoints

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:3000/login |
| Backend (API) | http://localhost:8001/api/ |

---

# 🛠️ Comandos de Manutenção

## Resetar completamente o ambiente

```bash
docker compose down -v
docker system prune -f
```

---

# Equipe

## Product Owner + Developer

- Braian Soares Mesquita

## Scrum Master + Developer

- Caio Lopes Ramos

## Desenvolvedores

- Thalles Henriques
- Patrick Modesto Linhares da Silva
- Jonas Portilho Ribeiro
- Fabio Esmilde Machado de Souza
- Daniel Ramos da Silva
- João Pedro Sant'Ana de Souza
- Luiz Eduardo dos Santos Silva
- Emerson Nascimento de Lima
- Vinícius Silva Tavares
- Kristian Barboza Lopes
- Gabriel Ferrari Freitas de Castro
- Victor Menezes Florentino
- Lucas Machado

---

# 📸 Telas do Sistema

## Dashboard do Vendedor

![Dashboard](docs/telas/dashboard.png)

## Gestão de Loja 

![Gestão de Loja](docs/telas/lojas.png)

## Vitrine B2C

![Vitrine](docs/telas/vitrine.png)

## Checkout

![Checkout](docs/telas/checkout.png)

---

# 📄 Documentação

A documentação completa da arquitetura, regras de negócio e fluxo da aplicação encontra-se nos arquivos abaixo:

- **Relatório Final:** [`docs/relatorio_final.pdf`](docs/relatorio_final.pdf)
- **Mini Mundo:** [`docs/MiniMundo.docx`](docs/MiniMundo.docx)
- **Modelo Conceitual:** [`docs/Conceitual.brM3`](docs/Conceitual.brM3)
````
