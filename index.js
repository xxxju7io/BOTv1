const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const { SocksProxyAgent } = require('socks-proxy-agent');

// Configurações
const torProxy = 'socks5h://127.0.0.1:9050';
const agent = new SocksProxyAgent(torProxy);
const bot = new Telegraf('7876916554:AAG1cvnHL6rVEM9Uph08RtlWVy1ZGsFwQxU');

// Delay entre comandos (mantido para evitar flooding da API do Telegram)
bot.use((ctx, next) => setTimeout(() => next(), 2000));

// ====== ESTRUTURA DOS MENUS ====== //
const criarMenuPrincipal = () => Markup.inlineKeyboard([
    [Markup.button.callback('📜 COMANDOS', 'comandos')],
    [Markup.button.callback('👤 MINHAS INFOS', 'userinfo')], // Nome do botão alterado
    [Markup.button.callback('🌟 CRÉDITOS', 'creditos')]
]);

const criarMenuVoltar = () => Markup.inlineKeyboard([
    [Markup.button.callback('🔙 VOLTAR AO MENU', 'voltar_menu')] // Nome do botão alterado
]);

// ====== COMANDO /MENU ====== //
bot.command('menu', (ctx) => {
    ctx.replyWithMarkdown(
        '✨ *BEM-VINDO AO PAINEL DE CONSULTAS!* ✨\n\n_Selecione uma opção abaixo para começar:_',
        criarMenuPrincipal()
    );
});

// ====== AÇÕES DOS BOTÕES DE MENU ====== //

bot.action('voltar_menu', async (ctx) => {
    try {
        await ctx.editMessageText(
            '✨ *BEM-VINDO AO PAINEL DE CONSULTAS!* ✨\n\n_Selecione uma opção abaixo para começar:_',
            {
                parse_mode: 'Markdown',
                ...criarMenuPrincipal()
            }
        );
    } catch (error) {
        // Fallback caso a mensagem original não possa ser editada (ex: muito antiga)
        await ctx.replyWithMarkdown(
            '✨ *BEM-VINDO AO PAINEL DE CONSULTAS!* ✨\n\n_Selecione uma opção abaixo para começar:_',
            criarMenuPrincipal()
        );
    }
    await ctx.answerCbQuery(); // Esconde o relógio de carregamento do botão
});

bot.action('comandos', async (ctx) => {
    try {
        await ctx.editMessageText(`
📜 *COMANDOS DISPONÍVEIS* 📜

Aqui você encontra a lista de todas as consultas que posso fazer para você!

🔍 *Consultas:*
├ \`/cpf [número]\` - Consulta CPF (Nome, Gênero, Nascimento, Renda, Nome da Mãe)
├ \`/cep [número]\` - Consulta CEP (Endereço completo)
├ \`/ip [endereço]\` - Geolocalização de IP
├ \`/ddd [número]\` - Consulta de DDD (Cidades e Estado)
└ \`/bin [6 dígitos]\` - Consulta de BIN (Dados do Cartão)

⚙️ *Utilitários:*
├ \`/menu\` - Exibe este painel de navegação
└ \`/tor\` - Comando futuro para rotação de IP via Tor (ainda não implementado)
        `, {
            parse_mode: 'Markdown',
            ...criarMenuVoltar()
        });
    } catch (error) {
        await ctx.replyWithMarkdown(
            '📜 *COMANDOS DISPONÍVEIS* 📜\n(Use /menu para navegar e ver o painel completo)',
            criarMenuVoltar()
        );
    }
    await ctx.answerCbQuery();
});

bot.action('userinfo', async (ctx) => {
    const user = ctx.from;
    const userId = user.id;
    const userName = user.username ? `@${user.username}` : 'N/A';
    const firstName = user.first_name || 'N/A';
    const lastName = user.last_name || 'N/A';
    const isBot = user.is_bot ? 'Sim' : 'Não';
    const languageCode = user.language_code || 'N/A';

    try {
        await ctx.editMessageText(`
👤 *SUAS INFORMAÇÕES DO TELEGRAM* 👤
┌─────────────────────────
│ *ID do Usuário:* \`${userId}\`
│ *Username:* ${userName}
│ *Primeiro Nome:* ${firstName}
│ *Sobrenome:* ${lastName}
│ *É um Bot?* ${isBot}
│ *Idioma:* ${languageCode}
└─────────────────────────
        `, {
            parse_mode: 'Markdown',
            ...criarMenuVoltar()
        });
    } catch (error) {
        await ctx.replyWithMarkdown(`
👤 *SUAS INFORMAÇÕES DO TELEGRAM* 👤
┌─────────────────────────
│ *ID do Usuário:* \`${userId}\`
│ *Username:* ${userName}
│ *Primeiro Nome:* ${firstName}
│ *Sobrenome:* ${lastName}
│ *É um Bot?* ${isBot}
│ *Idioma:* ${languageCode}
└─────────────────────────
(Use /menu para navegar e ver o painel completo)
        `, criarMenuVoltar());
    }
    await ctx.answerCbQuery();
});

bot.action('creditos', async (ctx) => {
    try {
        await ctx.editMessageText(`
🌟 *CRÉDITOS* 🌟

Este bot foi criado e desenvolvido com carinho por:

🤖 *J074*

Agradeço o uso e espero que seja muito útil! 😊

_Sugestões, melhorias ou dúvidas? Entre em contato!_
        `, {
            parse_mode: 'Markdown',
            ...criarMenuVoltar()
        });
    } catch (error) {
        await ctx.replyWithMarkdown(`
🌟 *CRÉDITOS* 🌟
Criado por: *J074*
(Use /menu para navegar e ver o painel completo)
        `, criarMenuVoltar());
    }
    await ctx.answerCbQuery();
});


// ====== CONSULTA DE IP ====== //
bot.command('ip', async (ctx) => {
    const ip = ctx.message.text.split(' ')[1] || '';

    try {
        const { data } = await axios.get(`http://ip-api.com/json/${ip}?fields=66846719`, {
            httpsAgent: agent
        });

        if (data.status === 'fail') throw new Error(data.message);

        await ctx.replyWithMarkdown(`
🌐 *CONSULTA IP* 🌐
┌─────────────────
│ *IP:* \`${data.query}\`
│ *País:* ${data.country} (${data.countryCode})
│ *Cidade:* ${data.city}, ${data.regionName}
│ *Provedor:* ${data.isp}
└─────────────────
        `, criarMenuVoltar());
    } catch (err) {
        await ctx.reply('❌ IP inválido ou serviço indisponível. Verifique o IP e tente novamente.', criarMenuVoltar());
    }
});

// ====== CONSULTA DE CPF ====== //
bot.command('cpf', async (ctx) => {
    const cpf = ctx.message.text.split(' ')[1];

    if (!cpf || !/^\d{11}$/.test(cpf)) {
        return ctx.reply('⚠️ Por favor, forneça um CPF válido (apenas números, 11 dígitos).', criarMenuVoltar());
    }

    const API_TOKEN = '1090'; // Use seu token de API real aqui
    const apiUrl = `https://searchapi.dnnl.live/consulta?token_api=${API_TOKEN}&cpf=${cpf}`;

    try {
        const { data } = await axios.get(apiUrl, {
            httpsAgent: agent // Forçando o agente SOCKS para a requisição
        });

        // A API retornou status 200 no cURL, mas vamos verificar se o campo 'status' existe e é 200
        if (data.status !== 200) { // Agora espera o número 200
            // Se a API retornar um erro no campo 'message', exiba-o
            return ctx.reply(`❌ Erro na consulta de CPF: ${data.message || 'Status de erro da API: ' + data.status}`, criarMenuVoltar());
        }

        // Verifica se 'dados' existe e tem pelo menos um elemento
        if (!data.dados || data.dados.length === 0) {
            return ctx.reply('❌ Dados de CPF não encontrados para este número na base da API.', criarMenuVoltar());
        }

        const cpfData = data.dados[0]; // Acessa o primeiro (e único) objeto dentro do array 'dados'

        // Extraindo dados dos campos do objeto cpfData. ATENÇÃO AOS NOMES DOS CAMPOS (MAIÚSCULOS)
        const nome = cpfData.NOME || 'Não disponível';
        const genero = cpfData.SEXO || 'Não disponível'; // A API retorna SEXO
        const nascimento = cpfData.NASC || 'Não disponível'; // A API retorna NASC
        const renda = cpfData.RENDA || 'Não disponível';
        const nomeMae = cpfData.NOME_MAE || 'Não disponível'; // A API retorna NOME_MAE

        await ctx.replyWithMarkdown(`
👤 *CONSULTA CPF* 👤
┌─────────────────
│ *CPF:* \`${cpfData.CPF || 'Não disponível'}\`
│ *Nome:* ${nome}
│ *Gênero:* ${genero}
│ *Nascimento:* ${nascimento}
│ *Renda:* ${renda}
│ *Nome da Mãe:* ${nomeMae}
└─────────────────
        `, criarMenuVoltar());

    } catch (err) {
        console.error('Erro na consulta de CPF:', err);
        // Mais mensagens de erro específicas para depuração
        if (axios.isAxiosError(err) && err.response) {
            if (err.response.status === 401) {
                await ctx.reply('❌ Erro de autenticação na API de CPF. Verifique seu token.', criarMenuVoltar());
            } else if (err.response.status === 404) {
                await ctx.reply('❌ CPF não encontrado nesta base de dados ou URL incorreta.', criarMenuVoltar());
            } else if (err.response.status === 429) {
                await ctx.reply('❌ Limite de requisições excedido na API de CPF. Tente novamente mais tarde.', criarMenuVoltar());
            } else {
                await ctx.reply(`❌ Erro HTTP ${err.response.status} ao consultar CPF. Detalhes: ${err.response.data ? JSON.stringify(err.response.data) : 'N/A'}`, criarMenuVoltar());
            }
        } else if (axios.isAxiosError(err) && err.code) {
            if (err.code === 'ECONNABORTED' || err.code === 'ETIMEDOUT') {
                await ctx.reply('❌ A requisição para a API de CPF demorou muito e foi cancelada. Pode ser problema de rede ou da API.', criarMenuVoltar());
            } else if (err.code === 'ECONNREFUSED') {
                await ctx.reply('❌ Conexão recusada ao proxy Tor. Verifique se o Tor está rodando.', criarMenuVoltar());
            }
            else {
                await ctx.reply('❌ Erro de conexão com a API de CPF. Verifique sua rede e o Tor.', criarMenuVoltar());
            }
        } else {
            await ctx.reply('❌ Erro inesperado ao consultar CPF. Verifique o console para mais detalhes.', criarMenuVoltar());
        }
    }
});


// ====== CONSULTA DE CEP ====== //
bot.command('cep', async (ctx) => {
    const cep = ctx.message.text.split(' ')[1];

    if (!cep || !/^\d{8}$/.test(cep)) {
        return ctx.reply('⚠️ Por favor, forneça um CEP válido (apenas números, 8 dígitos).', criarMenuVoltar());
    }

    try {
        const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, {
            httpsAgent: agent // Forçando o agente SOCKS para a requisição
        });

        if (data.erro) {
            return ctx.reply('❌ CEP não encontrado ou inválido. Verifique o número e tente novamente.', criarMenuVoltar());
        }

        await ctx.replyWithMarkdown(`
🏠 *CONSULTA CEP* 🏠
┌─────────────────
│ *CEP:* \`${data.cep}\`
│ *Logradouro:* ${data.logradouro}
│ *Bairro:* ${data.bairro}
│ *Cidade:* ${data.localidade}
│ *Estado:* ${data.uf}
│ *DDD:* ${data.ddd}
└─────────────────
        `, criarMenuVoltar());

    } catch (err) {
        console.error('Erro na consulta de CEP:', err);
        await ctx.reply('❌ Erro ao consultar CEP. Tente novamente mais tarde.', criarMenuVoltar());
    }
});

// ====== CONSULTA DE DDD ====== //
bot.command('ddd', async (ctx) => {
    const ddd = ctx.message.text.split(' ')[1];

    if (!ddd || !/^\d{2}$/.test(ddd)) {
        return ctx.reply('⚠️ Por favor, forneça um DDD válido (apenas números, 2 dígitos).', criarMenuVoltar());
    }

    try {
        const { data } = await axios.get(`https://brasilapi.com.br/api/ddd/v1/${ddd}`, {
            httpsAgent: agent
        });

        if (!data || data.cities.length === 0) {
            return ctx.reply('❌ DDD não encontrado ou inválido. Verifique o número e tente novamente.', criarMenuVoltar());
        }

        const cities = data.cities.slice(0, 10).join(', ') + (data.cities.length > 10 ? '...' : '');

        await ctx.replyWithMarkdown(`
☎️ *CONSULTA DDD* ☎️
┌─────────────────
│ *DDD:* \`${ddd}\`
│ *Estado(s):* ${data.state}
│ *Cidades (Exemplos):* ${cities}
└─────────────────
        `, criarMenuVoltar());

    } catch (err) {
        console.error('Erro na consulta de DDD:', err);
        await ctx.reply('❌ Erro ao consultar DDD. Tente novamente mais tarde.', criarMenuVoltar());
    }
});

// ====== CONSULTA DE BIN ====== //
bot.command('bin', async (ctx) => {
    const bin = ctx.message.text.split(' ')[1];

    if (!bin || !/^\d{6}$/.test(bin)) {
        return ctx.reply('⚠️ Por favor, forneça um BIN válido (os primeiros 6 dígitos do cartão).', criarMenuVoltar());
    }

    try {
        const { data } = await axios.get(`https://lookup.binlist.net/${bin}`, {
            httpsAgent: agent // Forçando o agente SOCKS para a requisição
        });

        if (!data || !data.scheme) {
            return ctx.reply('❌ BIN não encontrado ou inválido. Verifique o número e tente novamente.', criarMenuVoltar());
        }

        await ctx.replyWithMarkdown(`
💳 *CONSULTA BIN* 💳
┌─────────────────
│ *BIN:* \`${bin}\`
│ *Bandeira:* ${data.scheme || 'N/A'}
│ *Tipo:* ${data.type || 'N/A'}
│ *Marca:* ${data.brand || 'N/A'}
│ *País:* ${data.country ? `${data.country.name} (${data.country.alpha2})` : 'N/A'}
│ *Banco:* ${data.bank ? `${data.bank.name} (${data.bank.url})` : 'N/A'}
└─────────────────
        `, criarMenuVoltar());

    } catch (err) {
        console.error('Erro na consulta de BIN:', err);
        await ctx.reply('❌ Erro ao consultar BIN. Tente novamente mais tarde.', criarMenuVoltar());
    }
});

// ====== INICIALIZAÇÃO ====== //
bot.launch()
    .then(() => console.log('🤖 Bot online com menu funcional!'))
    .catch(err => console.error('💥 Erro:', err));

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));