# Projeto Integrador: SaaS E-Commerce (Multi-Tenant)

Plataforma Web B2B2C desenvolvida para a disciplina de Laboratório de Desenvolvimento de Software. O sistema utiliza uma arquitetura multi-tenant, permitindo que vários lojistas gerenciem seus próprios catálogos e vendas de forma isolada e segura.

> **Status:** Projeto em andamento | Equipa: 15 colaboradores.

---

## Galeria do Projeto
<details>
<summary>Clique para visualizar as telas do sistema</summary>

### Gestão do Lojista
![Dashboard Vendedor](https://github.com/user-attachments/assets/43a22018-3203-4d85-b7cc-6baa3963aeb5)
![Gestão de Loja](https://github.com/user-attachments/assets/89b5525c-f74b-48f4-8616-ca8180d0af9e)

### Fluxo de Compra (Cliente)
![Vitrine](https://github.com/user-attachments/assets/4dc19913-eb64-458e-a699-b5f1bf7f573d)
![Checkout](https://github.com/user-attachments/assets/2d89e99b-7084-436c-9d2d-f07739f20ae2)

*(Adicione aqui as outras imagens de forma organizada)*
</details>

---

## Tecnologias Utilizadas

* **Backend:** Python, Django REST Framework, PostgreSQL
* **Frontend:** React, Next.js, TailwindCSS
* **Autenticação:** JWT (JSON Web Tokens)
* **Infraestrutura:** Docker, Docker Compose
* **Metodologia:** Ágil (Scrum/Kanban)

---

## Como Executar o Projeto

Certifique-se de ter o **Docker** e o **Docker Compose** instalados na sua máquina.

### 1. Clonar e subir o ambiente
```bash
git clone [https://github.com/braian-data/ecommerce-marketing-bi-saas.git](https://github.com/braian-data/ecommerce-marketing-bi-saas.git)

cd ecommerce-marketing-bi-saas
docker compose -p novo_projeto up -d --build
docker compose -p novo_projeto ps
docker compose -p novo_projeto exec backend python manage.py migrate
```
Inicializar o Banco de Dados (Seed)

# Rodar migrações
docker compose exec backend python manage.py migrate

# Popular os planos iniciais (necessário para o registro)
```
docker compose -p novo_projeto exec backend python manage.py shell -c "from api.models import Plano; Plano.objects.get_or_create(id=1, defaults={'nome': 'Premium', 'limite_lojas': 10, 'limite_imagens': 100, 'limite_api': 1000, 'espaco_armazenamento': 5000})"
docker compose -p novo_projeto exec backend python manage.py seed_dados
```

Acessos Locais
Frontend: http://localhost:3000/login
API (Django): http://localhost:8001
ESCREVA PASSO A PASSO DESDE A CRIAÇÃO DAS CONTAS, CRIAÇÃO DE LOJA, COMPRAS, FATURAMENTO E TODA APLICAÇÃO DE FORMA LINEAR PARA EFETUAR OS TESTES

Estrutura do Projeto
ADICIONE A ESTRUTURA AQUI

Colaboradores
Projeto desenvolvido por uma equipe dedicada de 15 estudantes.
ADICIONAR COLABORADORES
PO+DEV: Braian Soares Mesquita (https://github.com/braian-data)
SM+DEV: Caio Camos (https://github.com/raiocamos)
DEVS: , , ,






























