# Projeto Integrador: SaaS E-Commerce (Multi-Tenant)

Este projeto é a entrega final da disciplina de Laboratório de Desenvolvimento de Software. Consiste numa plataforma Web B2B2C com arquitetura em camadas, separação de responsabilidades (Multi-Tenant) e autenticação via JWT.

> **Status:** Projeto em andamento com uma equipa de 15 colaboradores.

<img width="1015" height="566" alt="Demonstração do Projeto" src="https://github.com/user-attachments/assets/43a22018-3203-4d85-b7cc-6baa3963aeb5" />
<img width="1136" height="1042" alt="image" src="https://github.com/user-attachments/assets/89b5525c-f74b-48f4-8616-ca8180d0af9e" />

---

## Tecnologias Utilizadas
* **Backend:** Python, Django REST Framework, PostgreSQL
* **Frontend:** React, Next.js, TailwindCSS
* **Infraestrutura:** Docker, Docker Compose
* **Metodologia:** Ágil (Scrum/Kanban)

## Pré-requisitos
Para executar este projeto localmente, a máquina hospedeira deve possuir:
* [Docker](https://docs.docker.com/get-docker/)
* [Docker Compose](https://docs.docker.com/compose/install/)

---

## Como Executar o Projeto (Build & Run)

**1. Clone o repositório e aceda ao diretório:**
```bash
git clone [https://github.com/braian-data/ecommerce-marketing-bi-saas.git](https://github.com/braian-data/ecommerce-marketing-bi-saas.git)
cd ecommerce-marketing-bi-saas
docker compose up -d --build
docker compose exec backend python manage.py migrate
```
Topologia de Rede e Acessos
Após a execução bem-sucedida dos comandos acima, o ecossistema estará a operar nos seguintes endereços locais:
Painel do Vendedor / Cliente Final (Frontend):``` [http://localhost:3000](http://localhost:3000/login) ```
<img width="1136" height="1042" alt="image" src="https://github.com/user-attachments/assets/4dc19913-eb64-458e-a699-b5f1bf7f573d" />













