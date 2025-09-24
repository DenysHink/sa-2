# Sistema de Gerenciamento de Rotas de Ônibus

Sistema backend completo para gerenciamento de rotas de ônibus com autenticação JWT, desenvolvido com Node.js, Express e Sequelize. Projetado para integração com sistemas de câmeras com IA para contagem de passageiros.

## 📋 Índice

- [Funcionalidades](#-funcionalidades)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação e Setup](#-instalação-e-setup)
- [Execução](#-execução)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Documentação da API](#-documentação-da-api)
- [Exemplos de Requisições](#-exemplos-de-requisições)
- [Integração com Câmeras IA](#-integração-com-câmeras-ia)
- [Segurança](#-segurança)
- [Testes](#-testes)
- [Deploy](#-deploy)

## 🚀 Funcionalidades

### Autenticação e Autorização
- **Sistema JWT** com tokens seguros
- **Dois tipos de usuário**: Administrador e Motorista
- **Chave especial** para promoção a administrador
- **Middleware de autorização** baseado em roles

### Gerenciamento de Usuários
- Registro e login de usuários
- Perfis diferenciados (admin/motorista)
- Validação robusta de dados

### Gerenciamento de Rotas
- **Criação de rotas** (apenas administradores)
- **Atribuição de motoristas** às rotas
- **Status em tempo real**: número de passageiros, ativo/inativo
- **Controle de pontos**: rastreamento de pontos já passados
- **API pública** para consulta por número do ônibus

### Gerenciamento de Pontos
- Criação e edição de pontos de parada
- Associação de pontos às rotas com ordem específica
- Coordenadas GPS e endereços

### Segurança e Qualidade
- Rate limiting (100 req/15min por IP)
- Headers de segurança com Helmet
- Validação de entrada robusta
- CORS configurado
- Logs de auditoria

## 🛠️ Tecnologias

- **Node.js** 14+
- **Express.js** - Framework web
- **Sequelize** - ORM para banco de dados
- **MySQL** - Banco de dados principal
- **JWT** - Autenticação
- **bcryptjs** - Hash de senhas
- **Helmet** - Segurança HTTP
- **CORS** - Cross-origin requests
- **dotenv** - Variáveis de ambiente

## 📋 Pré-requisitos

- Node.js 14.x ou superior
- npm ou yarn
- MySQL 5.7+ ou MariaDB 10.3+
- Git

## 🔧 Instalação e Setup

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd bus-system-backend
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Configure as variáveis de ambiente
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Configurações do Servidor
PORT=3000
NODE_ENV=development

# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=3306
DB_NAME=bus_system
DB_USER=root
DB_PASSWORD=sua_senha

# Configurações JWT
JWT_SECRET=sua_chave_secreta_super_segura_aqui_123456789
JWT_EXPIRES_IN=24h

# Chave especial para criar administradores
ADMIN_KEY=chave_especial_admin_123456
```

### 4. Configure o banco de dados

#### MySQL/MariaDB
```sql
CREATE DATABASE bus_system CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### SQLite (para testes locais)
Para usar SQLite em vez de MySQL, altere o `.env`:
```env
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

## 🚀 Execução

### Execução Local

#### Desenvolvimento (com hot reload)
```bash
npm run dev
```

#### Produção
```bash
npm start
```

### Execução com Docker

#### Opção 1: Docker Compose (Recomendado)
```bash
# Criar docker-compose.yml (exemplo)
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
      - DB_NAME=bus_system
      - DB_USER=root
      - DB_PASSWORD=password
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: bus_system
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

```bash
docker-compose up -d
```

#### Opção 2: Docker Manual
```bash
# Build da imagem
docker build -t bus-system-backend .

# Executar container
docker run -p 3000:3000 --env-file .env bus-system-backend
```

### Verificação da Instalação
Acesse: `http://localhost:3000/api/public/health`

Resposta esperada:
```json
{
  "success": true,
  "message": "API do Sistema de Ônibus funcionando corretamente",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

## 📁 Estrutura do Projeto

```
bus-system-backend/
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do Sequelize
│   ├── controllers/
│   │   ├── authController.js    # Autenticação e usuários
│   │   ├── routeController.js   # Gerenciamento de rotas
│   │   └── pointController.js   # Gerenciamento de pontos
│   ├── middleware/
│   │   ├── auth.js             # Middlewares de autenticação
│   │   └── validation.js       # Validação de dados
│   ├── models/
│   │   ├── User.js             # Modelo de usuário
│   │   ├── Route.js            # Modelo de rota
│   │   ├── Point.js            # Modelo de ponto
│   │   ├── RoutePoint.js       # Relacionamento rota-ponto
│   │   └── index.js            # Configuração dos modelos
│   ├── routes/
│   │   ├── auth.js             # Rotas de autenticação
│   │   ├── routes.js           # Rotas de gerenciamento
│   │   ├── points.js           # Rotas de pontos
│   │   ├── public.js           # API pública
│   │   └── index.js            # Configuração das rotas
│   ├── utils/
│   │   └── jwt.js              # Utilitários JWT
│   └── server.js               # Servidor principal
├── .env.example                # Exemplo de variáveis de ambiente
├── .gitignore                  # Arquivos ignorados pelo Git
├── package.json                # Dependências e scripts
└── README.md                   # Este arquivo
```

## 📚 Documentação da API

### Base URL
```
http://localhost:3000/api
```

### Endpoints Disponíveis

#### Autenticação (`/auth`)
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login
- `POST /auth/promote` - Promover a administrador
- `GET /auth/profile` - Perfil do usuário

#### Rotas (`/routes`)
- `POST /routes` - Criar rota (Admin)
- `GET /routes` - Listar rotas
- `GET /routes/:id` - Obter rota específica
- `PUT /routes/:id/status` - Atualizar status (Motorista/Admin)
- `PUT /routes/:id/driver` - Atribuir motorista (Admin)

#### Pontos (`/points`)
- `POST /points` - Criar ponto (Admin)
- `GET /points` - Listar pontos
- `GET /points/:id` - Obter ponto específico
- `PUT /points/:id` - Atualizar ponto (Admin)
- `POST /points/route` - Adicionar ponto à rota (Admin)
- `DELETE /points/route/:routeId/:pointId` - Remover ponto da rota (Admin)

#### API Pública (`/public`)
- `GET /public/bus/:busNumber` - Status público do ônibus
- `GET /public/health` - Health check

## 🔍 Exemplos de Requisições

### 1. Registrar Usuário Administrador

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin Sistema",
    "email": "admin@sistema.com",
    "password": "123456",
    "adminKey": "chave_especial_admin_123456"
  }'
```

**Resposta:**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "user": {
      "id": 1,
      "name": "Admin Sistema",
      "email": "admin@sistema.com",
      "role": "admin",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@sistema.com",
    "password": "123456"
  }'
```

### 3. Criar Rota (Admin)

```bash
curl -X POST http://localhost:3000/api/routes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Rota Centro-Bairro",
    "busNumber": "001",
    "description": "Rota principal da cidade",
    "maxCapacity": 50
  }'
```

### 4. Atualizar Status da Rota (Motorista)

```bash
curl -X PUT http://localhost:3000/api/routes/1/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN_DO_MOTORISTA" \
  -d '{
    "currentPassengers": 25,
    "isActive": true,
    "currentPointIndex": 2
  }'
```

### 5. Consultar Status Público do Ônibus

```bash
curl -X GET http://localhost:3000/api/public/bus/001
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "busNumber": "001",
    "routeName": "Rota Centro-Bairro",
    "isActive": true,
    "currentPassengers": 25,
    "maxCapacity": 50,
    "occupancyPercentage": 50,
    "currentPoint": {
      "id": 2,
      "name": "Praça Central",
      "address": "Centro da cidade"
    },
    "nextPoint": {
      "id": 3,
      "name": "Shopping",
      "address": "Av. Principal, 123"
    }
  }
}
```

## 🤖 Integração com Câmeras IA

### Fluxo de Integração

1. **Sistema de câmeras** detecta número de passageiros
2. **IA processa** a imagem e conta passageiros
3. **Sistema envia** dados para a API via PUT `/routes/:id/status`
4. **API atualiza** status em tempo real
5. **Aplicativo consulta** status via GET `/public/bus/:busNumber`

### Exemplo de Integração (JavaScript)

```javascript
// Sistema de câmeras com IA
class BusPassengerCounter {
  constructor(routeId, driverToken) {
    this.routeId = routeId;
    this.token = driverToken;
    this.apiUrl = 'http://localhost:3000/api';
  }

  async updatePassengerCount(passengerCount) {
    try {
      const response = await fetch(`${this.apiUrl}/routes/${this.routeId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({
          currentPassengers: passengerCount
        })
      });

      const data = await response.json();
      
      if (data.success) {
        console.log(`Status atualizado: ${passengerCount} passageiros`);
      } else {
        console.error('Erro ao atualizar:', data.message);
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
    }
  }

  // Simular detecção de passageiros
  startMonitoring() {
    setInterval(() => {
      // Aqui seria a integração com a IA de visão computacional
      const detectedPassengers = this.detectPassengers();
      this.updatePassengerCount(detectedPassengers);
    }, 30000); // Atualizar a cada 30 segundos
  }

  detectPassengers() {
    // Placeholder para integração com IA
    // Retorna número detectado pela câmera
    return Math.floor(Math.random() * 50);
  }
}

// Uso
const counter = new BusPassengerCounter(1, 'token_do_motorista');
counter.startMonitoring();
```

### Exemplo com Python (OpenCV + IA)

```python
import requests
import cv2
import time

class BusAICounter:
    def __init__(self, route_id, driver_token, api_url="http://localhost:3000/api"):
        self.route_id = route_id
        self.token = driver_token
        self.api_url = api_url
        self.headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {driver_token}'
        }

    def count_passengers(self, frame):
        # Aqui seria implementada a IA de contagem
        # Usando YOLO, OpenPose ou similar
        # Retorna número de pessoas detectadas
        pass

    def update_api(self, passenger_count):
        url = f"{self.api_url}/routes/{self.route_id}/status"
        data = {"currentPassengers": passenger_count}
        
        try:
            response = requests.put(url, json=data, headers=self.headers)
            if response.status_code == 200:
                print(f"Atualizado: {passenger_count} passageiros")
            else:
                print(f"Erro: {response.json()}")
        except Exception as e:
            print(f"Erro na requisição: {e}")

    def start_monitoring(self):
        cap = cv2.VideoCapture(0)  # Câmera
        
        while True:
            ret, frame = cap.read()
            if ret:
                passenger_count = self.count_passengers(frame)
                self.update_api(passenger_count)
                time.sleep(30)  # Atualizar a cada 30 segundos
```

## 🔒 Segurança

### Medidas Implementadas

- **JWT Tokens** com expiração configurável
- **Senhas hasheadas** com bcrypt (salt rounds: 10)
- **Rate limiting** (100 requisições por 15 minutos por IP)
- **Headers de segurança** com Helmet.js
- **Validação rigorosa** de entrada de dados
- **CORS configurado** para origens específicas
- **Variáveis de ambiente** para segredos
- **Logs de auditoria** para ações críticas

### Boas Práticas de Segurança

1. **Nunca commitar** arquivos `.env` com dados reais
2. **Usar HTTPS** em produção
3. **Rotacionar tokens** regularmente
4. **Monitorar logs** de segurança
5. **Atualizar dependências** regularmente

## 🧪 Testes

### Executar Testes (quando implementados)
```bash
npm test
```

### Testes Manuais com cURL

#### Health Check
```bash
curl http://localhost:3000/api/public/health
```

#### Teste de Rate Limiting
```bash
# Executar múltiplas vezes rapidamente
for i in {1..110}; do curl http://localhost:3000/api/public/health; done
```

## 🚀 Deploy

### Deploy em Produção

#### 1. Preparar Ambiente
```bash
# Configurar variáveis de produção
export NODE_ENV=production
export JWT_SECRET=chave_super_segura_producao
export DB_HOST=servidor_mysql_producao
```

#### 2. Build e Deploy
```bash
# Instalar dependências de produção
npm ci --only=production

# Iniciar aplicação
npm start
```

#### 3. Usando PM2 (Recomendado)
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start src/server.js --name "bus-system-api"

# Configurar auto-restart
pm2 startup
pm2 save
```

### Deploy com Docker

#### Dockerfile
```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/

EXPOSE 3000

USER node

CMD ["npm", "start"]
```

### Variáveis de Ambiente para Produção

```env
NODE_ENV=production
PORT=3000
DB_HOST=mysql.servidor.com
DB_PORT=3306
DB_NAME=bus_system_prod
DB_USER=app_user
DB_PASSWORD=senha_super_segura
JWT_SECRET=chave_jwt_super_segura_256_bits
JWT_EXPIRES_IN=1h
ADMIN_KEY=chave_admin_super_segura
```

## 📊 Monitoramento

### Logs
O sistema gera logs para:
- Todas as requisições HTTP
- Erros de autenticação
- Erros de validação
- Erros de banco de dados
- Ações administrativas

### Métricas Importantes
- Número de usuários ativos
- Rotas em operação
- Requisições por minuto
- Tempo de resposta médio
- Taxa de erro

## 🤝 Contribuição

### Como Contribuir

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Padrões de Código

- Use ESLint para linting
- Siga o padrão de nomenclatura camelCase
- Documente funções complexas
- Escreva testes para novas funcionalidades

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte:
- Abra uma issue no GitHub
- Consulte a documentação da API em `/api`
- Verifique os logs da aplicação

## 🔄 Changelog

### v1.0.0 (2024-01-01)
- ✅ Sistema de autenticação JWT
- ✅ Gerenciamento de usuários (admin/motorista)
- ✅ CRUD completo de rotas e pontos
- ✅ API pública para consulta de status
- ✅ Middleware de segurança
- ✅ Validação robusta de dados
- ✅ Documentação completa

---

**Desenvolvido para integração com sistemas de IA de contagem de passageiros em ônibus urbanos.**

