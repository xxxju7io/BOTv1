const { Telegraf } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf('7876916554:AAG1cvnHL6rVEM9Uph08RtlWVy1ZGsFwQxU'); // Substitua pelo seu token do Bot

// Função para criar botões em coluna
function criarBotoesColuna(textos, callbacks) {
    const botoes = [];
    for (let i = 0; i < textos.length; i++) {
        const botao = [{ text: textos[i], callback_data: callbacks[i] }];
        botoes.push(botao);
    }
    return botoes;
}

function isPrivado(ctx) {
    return ctx.chat.type === 'private';
}

function enviarMensagemBoasVindas(ctx, tipo) {
    const nome = tipo === 'enviar' ? ctx.message.from.first_name : ctx.callbackQuery.from.first_name;
    const tipoCtx = tipo === 'enviar' ? ctx.replyWithMarkdown.bind(ctx) : ctx.editMessageText.bind(ctx);

    const textosBotoes = ['FUNCIONALIDADES', 'SUAS INFORMAÇÕES', 'DESENVOLVEDOR'];
    const callbacksBotoes = ['funcoes', 'perfil', 'desenvolvedor'];

    tipoCtx(`🌟 Olá, *${nome}*! \nBem-vindo! Explore todas as minhas funcionalidades clicando nas opções abaixo. 👇`, {
        reply_markup: {
            inline_keyboard: criarBotoesColuna(textosBotoes, callbacksBotoes)
        }
    });
}

function limpar(texto, tipo) {
    const limparRegex = /\d/g;
    const entrada = texto.split(`/${tipo} `).join('');
    const numeros = entrada.match(limparRegex);

    if (!numeros) return null;

    return numeros.join('');
}

function formatarData(data) {
    const dataObj = new Date(data);
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return dataObj.toLocaleDateString('pt-BR', options);
}

function consultaCep(cep, ctx) {
    const cepLimpo = limpar(cep, 'botcep');
    if (!cepLimpo) return ctx.replyWithMarkdown('🚫 CEP inválido!');

    axios.get(`https://viacep.com.br/ws/${cepLimpo}/json`).then((res) => {
        const info = res.data;
        const mensagem = `🔎 *Consulta de CEP*\n\n*• CEP:* \`${info.cep}\`\n*• Logradouro:* \`${info.logradouro}\`\n*• Complemento:* \`${info.complemento}\`\n*• Bairro:* \`${info.bairro}\`\n*• Cidade:* \`${info.localidade}\`\n*• Estado:* \`${info.uf}\``;
        ctx.replyWithMarkdown(mensagem, {
            reply_markup: {
                inline_keyboard: [[{ text: '🗑 Apagar mensagem', callback_data: 'apagar' }]]
            }
        });
    }).catch(() => ctx.replyWithMarkdown('🚫 CEP inválido ou inexistente!'));
}

function consultaCnpj(cnpj, ctx) {
    const cnpjLimpo = limpar(cnpj, 'botcnpj');
    if (!cnpjLimpo) return ctx.replyWithMarkdown('🚫 CNPJ inválido!');

    axios.get(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`).then((res) => {
        const c = res.data;
        const mensagem = `🔎 *Consulta de CNPJ*\n\n*• Nome:* \`${c.nome}\`\n*• Fantasia:* \`${c.fantasia}\`\n*• Estado:* \`${c.uf}\`\n*• Telefone:* \`${c.telefone}\`\n*• Email:* \`${c.email}\`\n*• Abertura:* \`${formatarData(c.abertura)}\`\n*• Capital:* \`${c.capital_social}\`\n*• Situação:* \`${c.situacao}\`\n*• Cidade:* \`${c.municipio}\`\n*• Bairro:* \`${c.bairro}\`\n*• Rua:* \`${c.logradouro}\`\n*• CEP:* \`${c.cep}\`\n*• Porte:* \`${c.porte}\`\n*• Atividade:* \`${c.atividade_principal[0].text}\``;
        ctx.replyWithMarkdown(mensagem, {
            reply_markup: {
                inline_keyboard: [[{ text: '🗑 Apagar mensagem', callback_data: 'apagar' }]]
            }
        });
    }).catch(() => ctx.replyWithMarkdown('🚫 CNPJ inválido ou inexistente!'));
}

function consultaIp(ip, ctx) {
    const ipLimpo = limpar(ip, 'botip');
    if (!ipLimpo) return ctx.replyWithMarkdown('🚫 IP inválido!');

    axios.get(`http://ip-api.com/json/${ipLimpo}?lang=pt-BR`).then((res) => {
        const p = res.data;
        const mensagem = `🔎 *Consulta de IP*\n\n*• País:* \`${p.country}\`\n*• Estado:* \`${p.regionName}\`\n*• Cidade:* \`${p.city}\`\n*• Latitude:* \`${p.lat}\`\n*• Longitude:* \`${p.lon}\``;
        ctx.replyWithMarkdown(mensagem, {
            reply_markup: {
                inline_keyboard: [[{ text: '🗑 Apagar mensagem', callback_data: 'apagar' }]]
            }
        });
    }).catch(() => ctx.replyWithMarkdown('🚫 IP inválido ou inexistente!'));
}

function consultaBin(bin, ctx) {
    const binLimpo = limpar(bin, 'botbin');
    if (!binLimpo) return ctx.replyWithMarkdown('🚫 BIN inválido!');

    axios.get(`https://lookup.binlist.net/${binLimpo}`).then((res) => {
        const d = res.data;
        const mensagem = `💳 *Consulta BIN*\n\n*• Número:* \`${binLimpo}\`\n*• Esquema:* \`${d.scheme}\`\n*• Tipo:* \`${d.type}\`\n*• Marca:* \`${d.brand}\`\n*• Banco:* \`${d.bank?.name || 'N/A'}\`\n*• País:* \`${d.country?.name || 'N/A'}\``;
        ctx.replyWithMarkdown(mensagem, {
            reply_markup: {
                inline_keyboard: [[{ text: '🗑 Apagar mensagem', callback_data: 'apagar' }]]
            }
        });
    }).catch(() => ctx.replyWithMarkdown('🚫 BIN inválido ou inexistente!'));
}

// Consulta de telefone via API numverify (exemplo)
async function consultaTelefone(telefone, ctx) {
    const telefoneLimpo = limpar(telefone, 'bottelefone');
    if (!telefoneLimpo) return ctx.replyWithMarkdown('🚫 Número de telefone inválido!');

    const apiKey = '7fbd4f7214fc124cabd57c9730e5f131'; // Cadastre-se em numverify.com para obter uma grátis
    const url = `http://apilayer.net/api/validate?access_key=${apiKey}&number=${telefoneLimpo}&country_code=BR&format=1`;

    try {
        const res = await axios.get(url);
        const data = res.data;
        if (!data.valid) return ctx.replyWithMarkdown('🚫 Número inválido ou não encontrado!');

        const mensagem = `📞 *Consulta de Telefone*\n\n*• Número:* \`${telefoneLimpo}\`\n*• País:* \`${data.country_name}\`\n*• Localização:* \`${data.location}\`\n*• Linha:* \`${data.line_type}\``;

        ctx.replyWithMarkdown(mensagem, {
            reply_markup: {
                inline_keyboard: [[{ text: '🗑 Apagar mensagem', callback_data: 'apagar' }]]
            }
        });
    } catch (error) {
        ctx.replyWithMarkdown('🚫 Erro ao consultar telefone, tente novamente mais tarde.');
    }
}

bot.start(ctx => {
    if (isPrivado(ctx)) {
        enviarMensagemBoasVindas(ctx, 'enviar');
    } else {
        ctx.reply('🤖 Bot ativado neste grupo! Use comandos iniciados com /bot para evitar conflitos.');
    }
});

bot.hears('/botmenu', ctx => enviarMensagemBoasVindas(ctx, 'enviar'));
bot.action('menu', ctx => enviarMensagemBoasVindas(ctx, 'editar'));
bot.action('apagar', ctx => ctx.deleteMessage());

bot.action('funcoes', ctx => {
    const textosBotoes = ['RETORNAR'];
    const callbacksBotoes = ['menu'];
    ctx.editMessageText(`🔍 *MENU DE FUNÇÕES:*\n━━━━━━━━━━━━━━━━━━━━━\n*• /botcep [cep]*\n*• /botcnpj [cnpj]*\n*• /botip [ip]*\n*• /botbin [bin]*\n*• /bottelefone [número]*\n━━━━━━━━━━━━━━━━━━━━━\nUse os comandos acima conforme necessário.`, {
        reply_markup: { inline_keyboard: criarBotoesColuna(textosBotoes, callbacksBotoes) }
    });
});

bot.action('perfil', ctx => {
    const { id, first_name, username } = ctx.callbackQuery.from;
    const nomeUsuario = username ? `@${username}` : 'Não definido';
    ctx.editMessageText(`*Suas informações do Telegram*\n━━━━━━━━━━━━━━━━━━━━━\n*ID:* ${id}\n*Nome:* ${first_name}\n*Usuário:* ${nomeUsuario}\n━━━━━━━━━━━━━━━━━━━━━`, {
        reply_markup: { inline_keyboard: criarBotoesColuna(['RETORNAR'], ['menu']) }
    });
});

bot.action('desenvolvedor', ctx => {
    ctx.editMessageText(`*Desenvolvedor*\n━━━━━━━━━━━━━━━━━━━━━\nJ074Gostoso\nTelegram: @jo74\nInstagram: [@craftcodeweb](https://instagram.com/julin_chp)\n━━━━━━━━━━━━━━━━━━━━━`, {
        reply_markup: { inline_keyboard: criarBotoesColuna(['RETORNAR'], ['menu']) },
        parse_mode: 'Markdown'
    });
});

// Comandos prefixados para evitar conflitos com outros bots
bot.hears(/^\/botcep (.+)/, ctx => consultaCep(ctx.message.text, ctx));
bot.hears(/^\/botcnpj (.+)/, ctx => consultaCnpj(ctx.message.text, ctx));
bot.hears(/^\/botip (.+)/, ctx => consultaIp(ctx.message.text, ctx));
bot.hears(/^\/botbin (.+)/, ctx => consultaBin(ctx.message.text, ctx));
bot.hears(/^\/bottelefone (.+)/, ctx => consultaTelefone(ctx.message.text, ctx));

bot.launch();
console.log('✅ Bot iniciado com sucesso!');
