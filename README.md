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
<img width="1136" height="1042" alt="image" src="https://github.com/user-attachments/assets/2d89e99b-7084-436c-9d2d-f07739f20ae2" />
<img width="1136" height="1042" alt="image" src="https://github.com/user-attachments/assets/d7f3a32a-2cca-4e32-9eef-e50748d56a19" />
<img width="1598" height="965" alt="image" src="https://github.com/user-attachments/assets/968b8dbb-c8f2-449a-925a-d71b092998c3" />
<img width="1598" height="965" alt="image" src="https://github.com/user-attachments/assets/aa235aaa-f354-4f28-a598-ba274391510c" />
<img width="1598" height="965" alt="image" src="https://github.com/user-attachments/assets/e28c393a-0272-430b-bce4-3a94a4f139ff" />
<img width="1598" height="965" alt="image" src="https://github.com/user-attachments/assets/b617b9e6-c413-4c9c-b0c6-c39a85f07295" />
<img width="1598" height="965" alt="image" src="https://github.com/user-attachments/assets/67c850b0-4730-4ab1-a1bb-cd3c8b0d02a4" />
<img width="1598" height="965" alt="image" src="https://github.com/user-attachments/assets/748f7830-eaeb-4b29-9c33-e1520b1c4141" />
<img width="1814" height="951" alt="image" src="https://github.com/user-attachments/assets/4031c274-06d9-42f2-be52-b8004303e3bb" />
<img width="1814" height="951" alt="image" src="https://github.com/user-attachments/assets/c6ff5d55-739f-4dbf-ad08-1c69f0a1e083" />
<img width="1814" height="951" alt="image" src="https://github.com/user-attachments/assets/b5991272-c4ba-4c18-991c-1541fd7cabcd" />
<img width="1814" height="951" alt="image" src="https://github.com/user-attachments/assets/a74c778a-9832-4166-869d-14bee820870e" />














