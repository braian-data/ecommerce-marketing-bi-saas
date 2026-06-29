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

# Telas do Sistema

<img width="921" height="516" alt="image" src="https://github.com/user-attachments/assets/68f9320d-f85b-42f8-a013-8f46bd928b83" />

*Interface de Autenticação. Fonte: Elaborada pelos autores.*

---

<img width="917" height="506" alt="image" src="https://github.com/user-attachments/assets/5d3fff95-4304-4f8a-8122-4b8240069218" />

*Interface de Registro. Fonte: Elaborada pelos autores.*

---

<img width="859" height="447" alt="image" src="https://github.com/user-attachments/assets/eadc9349-db06-47ad-9b63-cc500060e514" />

*Dashboard Administrativo B2B. Fonte: Elaborada pelos autores.*

---

<img width="866" height="419" alt="image" src="https://github.com/user-attachments/assets/4447bb4a-1b18-42db-a805-3076f7df7eda" />

*Módulo de Configurações do Lojista. Fonte: Elaborada pelos autores.*

---

<img width="878" height="486" alt="image" src="https://github.com/user-attachments/assets/94129d43-465f-4aa4-9b6f-31d2edfffc77" />

*Gestão de Catálogo e Motor de Deleção. Fonte: Elaborada pelos autores.*

---

<img width="875" height="414" alt="image" src="https://github.com/user-attachments/assets/38bec482-a70d-4023-b1f4-4db14b6ef4a4" />

*Vitrine Pública do Cliente Final B2C. Fonte: Elaborada pelos autores.*

---

<img width="864" height="448" alt="image" src="https://github.com/user-attachments/assets/0c2237da-de6f-4e7c-9a11-6eec9f8a77da" />

*Fluxo de Checkout e Carrinho de Compras. Fonte: Elaborada pelos autores.*

---

<img width="858" height="436" alt="image" src="https://github.com/user-attachments/assets/4dedb66e-ca46-4669-9fe7-bc6611cff31b" />

*Painel Analítico Pós-Transação (BI). Fonte: Elaborada pelos autores.*

#  Documentação

A documentação completa da arquitetura, regras de negócio e fluxo da aplicação encontra-se nos arquivos abaixo:

- **Relatório Final:** [`docs/relatorio_final.pdf`](docs/relatorio_final.pdf)
- **Mini Mundo:** [`docs/MiniMundo.docx`](docs/MiniMundo.docx)
- **Modelo Conceitual:** [`docs/Conceitual.brM3`](docs/Conceitual.brM3)
````
