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
docker compose up -d --build
