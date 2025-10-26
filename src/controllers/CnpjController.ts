import { Request, Response } from "express";
import { consultarCNPJ } from '../services/receita.service'

export const consultaCnpj =  async (req: Request, res: Response) => {
    const { cnpj } = req.body;

    if (!cnpj) return res.status(400).json({ error: "CNPJ é obrigatório" });

    try {
        const data = await consultarCNPJ(cnpj);
    return res.json(data);
    }   catch (error: any) {
        return res.status(500).json({ error: error.message });
    }
}
