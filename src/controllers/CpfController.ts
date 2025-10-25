import { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import { Solver } from '@2captcha/captcha-solver';

const solver = new Solver(process.env.TWO_CAPTCHA_KEY || '');

export async function consultarCpfComCaptchaHandler(req: Request, res: Response) {
  const { cpf, dataNascimento } = req.body;

  if (!cpf || !dataNascimento) {
    res.status(400).json({ error: 'cpf e dataNascimento são obrigatórios' });
  }

  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  try {
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140 Safari/537.36'
    );

    await page.goto(
      'https://servicos.receita.fazenda.gov.br/servicos/cpf/consultasituacao/consultapublica.asp',
      { waitUntil: 'networkidle2', timeout: 60000 }
    );

    // Preencher CPF e data de nascimento
    await page.waitForSelector('input[name="txtCPF"]', { timeout: 20000 });
    await page.$eval('input[name="txtCPF"]', el => (el as any).value = '');
    await page.type('input[name="txtCPF"]', String(cpf), { delay: 30 });

    await page.waitForSelector('input[name="txtDataNascimento"]', { timeout: 20000 });
    await page.$eval('input[name="txtDataNascimento"]', el => (el as any).value = '');
    await page.type('input[name="txtDataNascimento"]', String(dataNascimento), { delay: 20 });

    // Pegar sitekey do hCaptcha
    const sitekey = await page.$eval('.h-captcha', el => el.getAttribute('data-sitekey'));
    if (!sitekey) throw new Error('Não foi encontrada a sitekey do hCaptcha');

    // Resolver hCaptcha via 2Captcha
    const solved = await solver.hcaptcha({ sitekey, pageurl: page.url() } as any);
    const token = (solved as any)?.solution;
    if (!token) throw new Error('Falha ao resolver o hCaptcha');

    // Preencher token do hCaptcha no formulário
    await page.evaluate((tokenValue: string) => {
      let textarea = document.querySelector('textarea[name="h-captcha-response"]') as any;
      if (!textarea) {
        textarea = document.createElement('textarea');
        textarea.setAttribute('name', 'h-captcha-response');
        textarea.style.display = 'none';
        document.forms[0]?.appendChild(textarea);
      }
      textarea.value = tokenValue;

      const hid = document.getElementById('idCheckedReCaptcha') as any;
      if (hid) hid.value = 'true';

      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }, token);

    // Submeter o formulário
    await Promise.all([
      page.click('input[type="submit"]'),
      page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 }).catch(() => null),
    ]);

    const html = await page.content();
    res.send(html);

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    await browser.close();
  }
}
