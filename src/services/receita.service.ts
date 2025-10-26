import axios from "axios";

export async function consultarCNPJ(cnpj: string) {
  try {
    const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpj}`, {
      headers: {
        Accept: "application/json",
      },
    });

    return response.data; // retorna os dados do CNPJ
  } catch (error: any) {
    console.error("Erro na consulta de CNPJ:", error.message);
    throw new Error("Falha ao consultar o CNPJ");
  }
}
