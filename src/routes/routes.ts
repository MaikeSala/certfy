import { Router } from 'express';
import * as pingController from '../controllers/pingController';
import * as cpfController from '../controllers/CpfController';

const router = Router();

// Rotas de ping/pong
router.get('/ping', pingController.ping);

// Rotas de CPF
router.post('/consulta-cpf', cpfController.consultarCpfComCaptchaHandler);

export default router;
