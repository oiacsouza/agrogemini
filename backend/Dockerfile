# Use a versão oficial do Python (leve)
FROM python:3.11-slim

# Define variáveis de ambiente
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV APP_HOME=/app

# Cria e define o diretório de trabalho
WORKDIR $APP_HOME



# Instala os requisitos de Python
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copia todo o código da aplicação
COPY . .

# Expõe a porta que o Uvicorn vai rodar
EXPOSE 8000

# Comando para iniciar a aplicação em produção
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
