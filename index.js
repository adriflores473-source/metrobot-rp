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
        GatewayIntentBits.GuildMessages 
    ] 
});

// 1. REGISTRO DE COMANDOS
const commands = [
    new SlashCommandBuilder()
        .setName('entorno')
        .setDescription('Describe una situación de entorno para el rol.')
        .addStringOption(option =>
            option.setName('descripcion')
                .setDescription('¿Qué está pasando a tu alrededor?')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('ubicacion')
                .setDescription('¿En qué parte de la ciudad estás?')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('registrar-vehiculo')
        .setDescription('Registra un vehículo en la base de datos de la ciudad.')
        .addStringOption(option => option.setName('modelo').setDescription('Marca y modelo').setRequired(true))
        .addStringOption(option => option.setName('matricula').setDescription('La placa').setRequired(true))
        .addStringOption(option => option.setName('color').setDescription('Color').setRequired(true))
        .addStringOption(option => option.setName('propietario').setDescription('Nombre y Apellido').setRequired(true))
        .addStringOption(option => option.setName('dni').setDescription('Número de DNI').setRequired(true)),

    new SlashCommandBuilder()
        .setName('decir')
        .setDescription('Envía un comunicado oficial.')
        .addStringOption(option => option.setName('mensaje').setDescription('Texto a enviar').setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    new SlashCommandBuilder()
        .setName('anonimo')
        .setDescription('Envía un mensaje anónimo con estilo Odyssey Bot.'),

    new SlashCommandBuilder()
        .setName('codigo-servidor')
        .setDescription('Obtén el código oficial del servidor LArpsp'),

    new SlashCommandBuilder()
        .setName('comandos-metro')
        .setDescription('Muestra la lista de comandos disponibles de MetroBot'),

    new SlashCommandBuilder()
        .setName('limpiar-chat')
        .setDescription('Elimina los mensajes masivos del canal actual.')
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

    if (interaction.isChatInputCommand()) {
        
        if (interaction.commandName === 'comandos-metro') {
            const embedComandos = new EmbedBuilder()
                .setTitle('SISTEMA DE COMANDOS — METROBOT')
                .setDescription('Lista de comandos disponibles para la comunidad:')
                .setColor('#2c3e50')
                .addFields(
                    { name: '/entorno', value: 'Notifica situaciones de rol (descripción y ubicación).' },
                    { name: '/registrar-vehiculo', value: 'Da de alta un vehículo en la base de datos oficial.' },
                    { name: '/codigo-servidor', value: 'Muestra el código de acceso oficial (LArpsp).' },
                    { name: '/anonimo', value: 'Despliega un formulario para enviar comunicados reservados.' }
                );
            return await interaction.reply({ embeds: [embedComandos] });
        }

        if (interaction.commandName === 'codigo-servidor') {
            return await interaction.reply({ 
                content: '🌴 **Información de Conexión**\n\nEl código oficial para ingresar a **Los Angeles Roleplay Spanish** es:\n\n🔑 `LArpsp`\n\n¡Úsalo con cuidado en la ciudad! 🏙️'
            });
        }

        if (interaction.commandName === 'limpiar-chat') {
            if (interaction.user.id !== MI_ID_DE_USUARIO) {
                return await interaction.reply({ content: '❌ Acceso denegado.', ephemeral: true });
            }

            await interaction.reply({ content: '🧹 Iniciando limpieza del canal...' });
            
            try {
                const mensajes = await interaction.channel.messages.fetch({ limit: 100 });
                await interaction.channel.bulkDelete(mensajes, true);
                await interaction.followUp({ content: '✅ Canal limpiado correctamente.' });
            } catch (error) {
                console.error('Error al limpiar el chat:', error);
                await interaction.followUp({ content: '❌ Ocurrió un error al intentar limpiar el canal.' });
            }
            return;
        }

        if (interaction.commandName === 'entorno') {
            const desc = interaction.options.getString('descripcion');
            const ubi = interaction.options.getString('ubicacion');
            const embed = new EmbedBuilder()
                .setTitle('REPORTE DE ENTORNO')
                .setDescription('DEPARTAMENTO DE SEGURIDAD')
                .setColor('#7289da')
                .addFields(
                    { name: 'DESCRIPCION', value: desc },
                    { name: 'UBICACION', value: ubi }
                );
            return await interaction.reply({ content: '@everyone', embeds: [embed] });
        }

        if (interaction.commandName === 'registrar-vehiculo') {
            const modelo = interaction.options.getString('modelo').toUpperCase();
            const matricula = interaction.options.getString('matricula').toUpperCase().trim();
            const color = interaction.options.getString('color').toUpperCase();
            const propietario = interaction.options.getString('propietario').toUpperCase();
            const dni = interaction.options.getString('dni');
            const embed = new EmbedBuilder()
                .setTitle('DEPARTAMENTO DE VEHICULOS MOTORIZADOS')
                .setDescription('REGISTRO OFICIAL DE VEHICULOS')
                .setColor('#34495e')
                .addFields(
                    { name: 'MODELO DEL VEHICULO', value: modelo },
                    { name: 'COLOR', value: color },
                    { name: 'MATRICULA / PLACA', value: `[${matricula}]` },
                    { name: 'NOMBRE DEL PROPIETARIO', value: propietario },
                    { name: 'NUMERO DE IDENTIFICACION (DNI)', value: `[${dni}]` },
                    { name: 'ESTADO DEL REGISTRO', value: 'VALIDO / REGISTRADO' }
                );
            return await interaction.reply({ embeds: [embed] });
        }

        if (interaction.commandName === 'decir') {
            if (interaction.user.id !== MI_ID_DE_USUARIO) {
                return await interaction.reply({ content: '❌ Acceso denegado.', ephemeral: true });
            }
            const mensajeTexto = interaction.options.getString('mensaje');
            const embedAnuncio = new EmbedBuilder()
                .setTitle('ANUNCIO DE LA ADMINISTRACION')
                .setDescription(mensajeTexto)
                .setColor('#2c3e50');
            await interaction.channel.send({ embeds: [embedAnuncio] });
            return await interaction.reply({ content: 'Enviado.', ephemeral: true });
        }

        if (interaction.commandName === 'anonimo') {
            const modal = new ModalBuilder().setCustomId('formulario_anonimo').setTitle('Usuario de la web');
            const mensajeInput = new TextInputBuilder()
                .setCustomId('contenido_anonimo')
                .setLabel('Escribe tu mensaje secreto aquí')
                .setStyle(TextInputStyle.Paragraph)
                .setRequired(true);
            modal.addComponents(new ActionRowBuilder().addComponents(mensajeInput));
            await interaction.showModal(modal);
        }
    }

    if (interaction.isModalSubmit() && interaction.customId === 'formulario_anonimo') {
        const textoMensaje = interaction.fields.getTextInputValue('contenido_anonimo');
        const embedOdyssey = new EmbedBuilder()
            .setAuthor({ name: 'Usuario de la web' })
            .setTitle('Mensaje anónimo')
            .setDescription(textoMensaje)
            .setColor('#111111')
            .setTimestamp();
        await interaction.channel.send({ embeds: [embedOdyssey] });
        await interaction.reply({ content: '🤫 Tu mensaje ha sido enviado.', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
