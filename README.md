# E-commerce Marketing BI SaaS

Arquitetura Multi-Tenant para gestão de lojas virtuais com motor de faturamento, catálogo dinâmico e painel analítico.

## Stack Tecnológica
* **Frontend:** Next.js (App Router), React, Tailwind CSS, Axios.
* **Backend:** Python 3.11, Django 5.x, Django Rest Framework, SimpleJWT.
* **Banco de Dados:** PostgreSQL (Relacional).
* **Infraestrutura:** Docker & Docker Compose.

---

## Protocolo de Instalação e Execução Local (Clean Room)

Para garantir a replicação exata do ambiente de produção localmente, siga os passos estritamente na ordem apresentada.

### 1. Clonagem do Repositório

git clone [https://github.com/braian-data/ecommerce-marketing-bi-saas.git](https://github.com/braian-data/ecommerce-marketing-bi-saas.git)
cd ecommerce-marketing-bi-saas 

## Injeção de Variáveis de Ambiente

O repositório não inclui o arquivo .env por questões de segurança. Execute o comando abaixo na raiz do projeto para gerar as configurações de roteamento do banco de dados:

ambiente POSIX
```cat <<EOF > .env
DEBUG=True
DATABASE_URL=postgres://postgres:postgres@db:5432/ecommerce_db
NEXT_PUBLIC_API_URL=http://localhost:8001
EOF

Criação Manual (Recomendado para todos os SOs)
```env
DEBUG=True
DATABASE_URL=postgres://postgres:postgres@db:5432/ecommerce_db
NEXT_PUBLIC_API_URL=http://localhost:8001    

## Orquestração de Contêineres (Build)

Construa as imagens e levante a rede isolada:

    docker compose up -d --build

(Aguarde aproximadamente 30 segundos para o banco de dados inicializar completamente).

## Construção do Esquema Relacional (DDL)

Crie as tabelas no PostgreSQL:

    docker compose exec backend python manage.py migrate

## Injeção de Dependências e Dados (Seed)

A arquitetura SaaS exige a existência de um Plano base para o roteamento de limites. Execute os comandos abaixo para injetar a regra de negócio e popular a base com dados de teste:

    docker compose exec backend python manage.py shell -c "from api.models import Plano; Plano.objects.get_or_create(id=1, defaults={'nome': 'Premium', 'limite_lojas': 10, 'limite_imagens': 100, 'limite_api': 1000, 'espaco_armazenamento': 5000})"

    docker compose exec backend python manage.py seed_dados

## Endpoints de Acesso

    Painel do Lojista (Frontend): http://localhost:3000/login

    API Root (Backend): http://localhost:8001/api/

## Comandos de Manutenção

Zerar o Banco de Dados (Hard Reset):

    docker compose down -v
    docker system prune -f

