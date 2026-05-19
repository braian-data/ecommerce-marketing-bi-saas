# Otimização para produção: uso da versão slim
FROM python:3.11-slim

# Variáveis de ambiente para otimização do Python em contêineres
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Definição do diretório de trabalho
WORKDIR /app

# Instalação de dependências do sistema operacional necessárias para o driver do PostgreSQL
RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev gcc \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Cópia do arquivo de requisitos e instalação
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Cópia do código-fonte para dentro do ambiente de execução
COPY . /app/