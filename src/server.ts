import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import routes from './routes/routes';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const porta = process.env.PORT ? Number(process.env.PORT) : 4000

// Middleware para parsing JSON
app.use(express.json());

// Middleware para logging
app.use((req: Request, res: Response, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Usar as rotas
app.use('/', routes);

// Middleware para rotas não encontradas - com saída de erro melhorada
app.use('*', (req: Request, res: Response) => {
  console.error(`❌ Rota não encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Rota não encontrada',
    message: `A rota ${req.method} ${req.originalUrl} não existe`,
    path: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    availableRoutes: {
      ping: 'GET /ping',
      pong: 'GET /pong'
    }
  });
});

// Middleware de tratamento de erros
app.use((err: Error, req: Request, res: Response, next: any) => {
  console.error('💥 Erro interno do servidor:', err.message);
  console.error('Stack trace:', err.stack);
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// Função para inicializar o servidor
const startServer = (): void => {
  app.listen(porta, () => {
    console.log('🚀 Servidor Certfy iniciado com sucesso!');
    console.log(`📡 Servidor rodando na porta ${porta}`);
  });
};

// Tratamento de sinais para encerramento graceful
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

// Tratamento de erros não capturados
process.on('uncaughtException', (err: Error) => {
  console.error('💥 Erro não capturado:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('💥 Promise rejeitada não tratada:', reason);
  process.exit(1);
});

// Inicializar o servidor
startServer();

export default app;
