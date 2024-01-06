const { Telegraf } = require('telegraf');
const bot = new Telegraf('SEU_TOKEN_BOT_TELEGRAM');

// Função para criar botões em coluna
function criarBotoesColuna(textos, callbacks) {
    const botoes = [];

    for (let i = 0; i < textos.length; i++) {
        const botao = [{ text: textos[i], callback_data: callbacks[i] }];
        botoes.push(botao);
    }

    return botoes;
}

// Função para enviar a mensagem de boas-vindas
function enviarMensagemBoasVindas(ctx, tipo) {
    const nome = tipo === 'enviar' ? ctx.message.from.first_name : ctx.callbackQuery.from.first_name;
    const tipoCtx = tipo === 'enviar' ? ctx.replyWithHTML.bind(ctx) : ctx.editMessageText.bind(ctx);

    const textosBotoes = ['FUNCIONALIDADES', 'SUAS INFORMAÇÕES', 'DESENVOLVEDOR'];
    const callbacksBotoes = ['funcoes', 'perfil', 'desenvolvedor'];

    tipoCtx(`🌟 Olá, *${nome}*! \nBem-vindo! Explore todas as minhas funcionalidades clicando nas opções abaixo. 👇`,
        {
            reply_markup: {
                inline_keyboard: criarBotoesColuna(textosBotoes, callbacksBotoes)
            },
            parse_mode: 'Markdown'
        }
    );
}

const axios = require('axios');

function limpar(texto, tipo) {
    const limparRegex = /\d/g;

    if (tipo === 'cep' || tipo === 'cpf' || tipo === 'cnpj' || tipo === 'placa' || tipo === 'bin') {
        return texto.split(`/${tipo} `).join('').match(limparRegex).join('');
    } else if (tipo === 'ip') {
        return texto.split(`/${tipo} `).join('');
    }
}

function formatarData(data) {
    const dataObj = new Date(data);
    const options = { year: 'numeric', month: 'numeric', day: 'numeric' };
    return dataObj.toLocaleDateString('pt-BR', options);
}

function consultaCep(cep, ctx) {
    const cepLimpo = limpar(cep, 'cep');

    axios.get(`https://viacep.com.br/ws/${cepLimpo}/json`).then((res) => {
        const info = res.data;
        const mensagem = `🔎 *Consulta de CEP*\n\n*• CEP:* \`${info.cep}\`\n*• Logradouro:* \`${info.logradouro}\`\n*• Complemento:* \`${info.complemento}\`\n*• Bairro:* \`${info.bairro}\`\n*• Cidade:* \`${info.localidade}\`\n*• Estado:* \`${info.uf}\``;

        ctx.replyWithMarkdown(mensagem, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🗑 Apagar mensagem', callback_data: 'apagar' }]
                ]
            }
        });
    }).catch(() => {
        ctx.replyWithMarkdown('🚫 CEP inválido ou inexistente!');
    });
}

function consultaCnpj(cnpj, ctx) {
    const cnpjLimpo = limpar(cnpj, 'cnpj');

    axios.get(`https://www.receitaws.com.br/v1/cnpj/${cnpjLimpo}`).then((res) => {
        const cpj = res.data;
        const mensagem = `🔎 *Consulta de CNPJ*\n\n*• Nome:* \`${cpj.nome}\`\n*• Nome fantasia:* \`${cpj.fantasia}\`\n*• Estado:* \`${cpj.uf}\`\n*• Telefone:* \`${cpj.telefone}\`\n*• Email:* \`${cpj.email}\`\n*• Data de abertura:* \`${formatarData(cpj.abertura)}\`\n*• Capital:* \`${cpj.capital_social}\`\n*• Situação:* \`${cpj.situacao}\`\n*• Município:* \`${cpj.municipio}\`\n*• Bairro:* \`${cpj.bairro}\`\n*• Rua:* \`${cpj.logradouro}\`\n*• Cep:* \`${cpj.cep}\`\n*• Porte:* \`${cpj.porte}\`\n*• Atividade principal:* \`${cpj.atividade_principal[0].text}\``;

        ctx.replyWithMarkdown(mensagem, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🗑 Apagar mensagem', callback_data: 'apagar' }]
                ]
            }
        });
    }).catch(() => {
        ctx.replyWithMarkdown('🚫 CNPJ inválido ou inexistente!');
    });
}

function consultaIp(ip, ctx) {
    const ipLimpo = limpar(ip, 'ip');

    axios.get(`http://ip-api.com/json/${ipLimpo}?lang=pt-BR`).then((res) => {
        const pegar = res.data;
        const mensagem = `🔎 *Consulta de IP*\n\n*• País:* \`${pegar.country}\`\n*• Cod país:* \`${pegar.countryCode}\`\n*• Estado:* \`${pegar.regionName}\`\n*• Cidade:* \`${pegar.city}\`\n*• Latitude:* \`${pegar.lat}\`\n*• Longitude:* \`${pegar.lon}\``;

        ctx.replyWithMarkdown(mensagem, {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🗑 Apagar mensagem', callback_data: 'apagar' }]
                ]
            }
        });
    }).catch(() => {
        ctx.replyWithMarkdown('🚫 IP inválido ou inexistente!');
    });
}

// Comando de início
bot.start(ctx => {
    enviarMensagemBoasVindas(ctx, 'enviar');
});

// Ação do menu
bot.action('menu', ctx => {
    enviarMensagemBoasVindas(ctx, 'editar');
});

// Ação do menu
bot.hears('/menu', ctx => {
    enviarMensagemBoasVindas(ctx, 'enviar');
});

bot.action('apagar', (ctx) => {
    ctx.deleteMessage()
})

// Ação de funções
bot.action('funcoes', ctx => {

    const textosBotoes = ['RETORNAR'];
    const callbacksBotoes = ['menu'];

    ctx.editMessageText(`🔍 *OLÁ! MENU DE FUNÇÕES:* 🌟\n━━━━━━━━━━━━━━━━━━━━━\n*CONSULTA DE CEP:*\n /cep [CEP desejado] (Exemplo: /cep 60025-130)\n\n*CONSULTA DE CNPJ:*\n /cnpj [CNPJ desejado] (Exemplo: /cnpj 06.990.590/0001-23)\n\n*CONSULTA DE IP:*\n /ip [Endereço IP desejado] (Exemplo: /ip 8.8.8.8)\n━━━━━━━━━━━━━━━━━━━━━\n*Agora é só utilizar!* 🚀`,
        {
            reply_markup: { inline_keyboard: criarBotoesColuna(textosBotoes, callbacksBotoes) },
            parse_mode: 'Markdown'
        }
    );
});

bot.action('perfil', ctx => {

    const id = ctx.callbackQuery.from.id
    const nome = ctx.callbackQuery.from.first_name
    const usuario = ctx.callbackQuery.from.username
    var nomeUsuario

    if (usuario == undefined) {
        nomeUsuario = 'Não definido'
    } else {
        nomeUsuario = `@${usuario}`
    }

    console.log(usuario)

    const textosBotoes = ['RETORNAR'];
    const callbacksBotoes = ['menu'];

    ctx.editMessageText(`*Suas informações do Telegram*\n━━━━━━━━━━━━━━━━━━━━━\n*ID do Telegram:*  ${id}\n*Seu nome:* ${nome}\n*Nome de usuário:* ${nomeUsuario}\n━━━━━━━━━━━━━━━━━━━━━\nClique na opção abaixo para retornar ao menu.`,
        {
            reply_markup: { inline_keyboard: criarBotoesColuna(textosBotoes, callbacksBotoes) },
            parse_mode: 'Markdown'
        });
})
bot.action('desenvolvedor', ctx => {
    const textosBotoes = ['RETORNAR'];
    const callbacksBotoes = ['menu'];

    ctx.editMessageText(`*Informações do Devenvolvedor*\n━━━━━━━━━━━━━━━━━━━━━\nNome: David Leite\nTelegram: @davidsdy\nSite: [Acessar site](https://craftcodeweb.com)\nInstagram: [Acessar Instagram](https://www.instagram.com/craftcodeweb/)\nBot criado em: 05 de Janeiro de 2024\n━━━━━━━━━━━━━━━━━━━━━\nClique na opção abaixo para retornar ao menu.`,
        {
            reply_markup: { inline_keyboard: criarBotoesColuna(textosBotoes, callbacksBotoes) },
            parse_mode: 'Markdown'
        }
    );
})

bot.on('message', async (ctx) => {

    const msg = ctx.message.text

    if (msg.includes('/cep') == true) {
        consultaCep(msg, ctx)
    }
    else if (msg.includes('/ip') == true) {
        consultaIp(msg, ctx)
    }
    else if (msg.includes('/cnpj') == true) {
        consultaCnpj(msg, ctx)
    }
})

bot.startPolling();
