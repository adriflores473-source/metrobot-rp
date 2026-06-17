const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Sistema de Seguridad MetroBot Activo'));
app.listen(process.env.PORT || 3000);

const { 
    Client, 
    GatewayIntentBits, 
    REST, 
    Routes, 
    SlashCommandBuilder, 
    EmbedBuilder, 
    PermissionFlagsBits,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder
} = require('discord.js');

const client = new Client({ 
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers 
    ] 
});

// --- IDs CONFIGURADOS ---
const ROL_BUSQUEDA_ID = '1516949215249563729';
const ROLS_POLICIA = ['1510356154465779936', '1510145980983545898'];
const CANAL_AGREGAR_ID = '1516948442080084031';
const CANAL_RETIRAR_ID = '1516948968414904451';

// 1. REGISTRO DE COMANDOS
const commands = [
    new SlashCommandBuilder().setName('entorno').setDescription('Describe una situación de entorno para el rol.').addStringOption(option => option.setName('descripcion').setDescription('¿Qué está pasando a tu alrededor?').setRequired(true)).addStringOption(option => option.setName('ubicacion').setDescription('¿En qué parte de la ciudad estás?').setRequired(true)),
    new SlashCommandBuilder().setName('registrar-vehiculo').setDescription('Registra un vehículo en la base de datos de la ciudad.').addStringOption(option => option.setName('modelo').setDescription('Marca y modelo').setRequired(true)).addStringOption(option => option.setName('matricula').setDescription('La placa').setRequired(true)).addStringOption(option => option.setName('color').setDescription('Color').setRequired(true)).addStringOption(option => option.setName('propietario').setDescription('Nombre y Apellido').setRequired(true)).addStringOption(option => option.setName('dni').setDescription('Número de DNI').setRequired(true)),
    new SlashCommandBuilder().setName('decir').setDescription('Envía un comunicado oficial.').addStringOption(option => option.setName('mensaje').setDescription('Texto a enviar').setRequired(true)).setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    new SlashCommandBuilder().setName('anonimo').setDescription('Envía un mensaje anónimo con estilo Odyssey Bot.'),
    new SlashCommandBuilder().setName('codigo-servidor').setDescription('Obtén el código oficial del servidor LArpsp'),
    new SlashCommandBuilder().setName('comandos-metro').setDescription('Muestra la lista de comandos disponibles de MetroBot'),
    new SlashCommandBuilder().setName('limpiar-chat').setDescription('Elimina los mensajes masivos del canal actual.'),
    // COMANDOS AGREGADOS EXACTOS
    new SlashCommandBuilder().setName('agregar-busqueda').setDescription('Inicia busqueda').addUserOption(o => o.setName('usuario').setDescription('El usuario').setRequired(true)),
    new SlashCommandBuilder().setName('retirar-busqueda').setDescription('Retira busqueda').addUserOption(o => o.setName('usuario').setDescription('El usuario').setRequired(true))
].map(command => command.toJSON());

// 2. CONEXIÓN DEL BOT
client.once('ready', async () => {
    console.log(`🤖 ¡MetroBot en línea y listo para el rol!`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('🚨 Comandos actualizados con éxito.');
    } catch (error) { console.error('Error registrando comandos:', error); }
});

// 3. RESPUESTAS A INTERACCIONES
client.on('interactionCreate', async interaction => {
    const MI_ID_DE_USUARIO = '1286812839465717772';
    const esPolicia = interaction.member?.roles.cache.some(r => ROLS_POLICIA.includes(r.id));

    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'comandos-metro') {
            const embedComandos = new EmbedBuilder().setTitle('SISTEMA DE COMANDOS — METROBOT').setDescription('Lista de comandos disponibles para la comunidad:').setColor('#2c3e50').addFields({ name: '/entorno', value: 'Notifica situaciones de rol.' }, { name: '/registrar-vehiculo', value: 'Registra un vehículo.' }, { name: '/codigo-servidor', value: 'Código de acceso.' }, { name: '/anonimo', value: 'Mensaje anónimo.' }, { name: '/agregar-busqueda', value: 'Inicia búsqueda (Policía).' }, { name: '/retirar-busqueda', value: 'Retira búsqueda (Policía).' });
            return await interaction.reply({ embeds: [embedComandos] });
        }
        if (interaction.commandName === 'codigo-servidor') return await interaction.reply({ content: '🔑 `LArpsp`' });
        if (interaction.commandName === 'limpiar-chat') {
            if (interaction.user.id !== MI_ID_DE_USUARIO) return await interaction.reply({ content: '❌ Acceso denegado.', ephemeral: true });
            const mensajes = await interaction.channel.messages.fetch({ limit: 100 });
            await interaction.channel.bulkDelete(mensajes, true);
            return await interaction.reply({ content: '✅ Canal limpiado.', ephemeral: true });
        }
        if (interaction.commandName === 'entorno') {
            const embed = new EmbedBuilder().setTitle('REPORTE DE ENTORNO').addFields({ name: 'DESC', value: interaction.options.getString('descripcion') }, { name: 'UBI', value: interaction.options.getString('ubicacion') });
            return await interaction.reply({ content: '@everyone', embeds: [embed] });
        }
        if (interaction.commandName === 'registrar-vehiculo') {
            const embed = new EmbedBuilder().setTitle('REGISTRO').addFields({ name: 'VEHICULO', value: interaction.options.getString('modelo') }, { name: 'PROPIETARIO', value: interaction.options.getString('propietario') });
            return await interaction.reply({ embeds: [embed] });
        }
        if (interaction.commandName === 'decir') {
            if (interaction.user.id !== MI_ID_DE_USUARIO) return await interaction.reply({ content: '❌', ephemeral: true });
            await interaction.channel.send(interaction.options.getString('mensaje'));
            return await interaction.reply({ content: 'Enviado.', ephemeral: true });
        }
        if (interaction.commandName === 'anonimo') {
            const modal = new ModalBuilder().setCustomId('formulario_anonimo').setTitle('Anónimo');
            modal.addComponents(new ActionRowBuilder().addComponents(new TextInputBuilder().setCustomId('contenido_anonimo').setLabel('Mensaje').setStyle(TextInputStyle.Paragraph)));
            await interaction.showModal(modal);
        }

        // LOGICA POLICIAL
        if (interaction.commandName === 'agregar-busqueda') {
            if (interaction.channelId !== CANAL_AGREGAR_ID) return interaction.reply({ content: '❌ Canal incorrecto.', ephemeral: true });
            if (!esPolicia) return interaction.reply({ content: '❌ No eres policía.', ephemeral: true });
            const u = interaction.options.getMember('usuario');
            await u.roles.add(ROL_BUSQUEDA_ID);
            return await interaction.reply(`🚨 **${u.user.username}** en búsqueda.`);
        }
        if (interaction.commandName === 'retirar-busqueda') {
            if (interaction.channelId !== CANAL_RETIRAR_ID) return interaction.reply({ content: '❌ Canal incorrecto.', ephemeral: true });
            if (!esPolicia) return interaction.reply({ content: '❌ No eres policía.', ephemeral: true });
            const u = interaction.options.getMember('usuario');
            await u.roles.remove(ROL_BUSQUEDA_ID);
            return await interaction.reply(`✅ **${u.user.username}** libre.`);
        }
    }
    if (interaction.isModalSubmit() && interaction.customId === 'formulario_anonimo') {
        await interaction.channel.send('🤫 ' + interaction.fields.getTextInputValue('contenido_anonimo'));
        await interaction.reply({ content: 'Enviado.', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
