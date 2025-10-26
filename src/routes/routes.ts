import { Router } from 'express';
import * as pingController from '../controllers/pingController';
import * as cpfController from '../controllers/CpfController';
import * as cnpjController from '../controllers/CnpjController';

const router = Router();

// Rotas de ping/pong
router.get('/ping', pingController.ping);

// Rotas de CPF
router.post('/consulta-cpf', cpfController.consultarCpfComCaptchaHandler);
router.get('/consulta-cnpj', cnpjController.consultaCnpj);

export default router;
