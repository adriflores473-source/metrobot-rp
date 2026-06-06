const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Sistema de Seguridad MetroBot Activo'));
app.listen(process.env.PORT || 3000);

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

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
        .addStringOption(option =>
            option.setName('modelo')
                .setDescription('Marca y modelo del auto (Ej: Ford Crown Victoria)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('matricula')
                .setDescription('La placa o matrícula del coche')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Color o colores del vehículo')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('propietario')
                .setDescription('Nombre y Apellido del dueño del vehículo')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('dni')
                .setDescription('Número de identificación o DNI del propietario')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('decir')
        .setDescription('Envía un comunicado oficial a través del bot (Solo Personal Autorizado).')
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('Escribe el texto que el bot va a decir')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
].map(command => command.toJSON());

// 2. CUANDO EL BOT SE CONECTA
client.once('ready', async () => {
    console.log(`🤖 ¡MetroBot en línea y listo para el rol!`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('🚨 Comandos actualizados con éxito en Discord.');
    } catch (error) {
        console.error('Error registrando comandos:', error);
    }
});

// 3. RESPUESTAS A LOS COMANDOS
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // Respuesta a /entorno
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

        await interaction.reply({ content: '@everyone', embeds: [embed] });
    }

    // Respuesta a /registrar-vehiculo
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

        await interaction.reply({ embeds: [embed] });
    }

    // Respuesta a /decir (SISTEMA DE RETRANSMISIÓN ACTUALIZADO)
    if (interaction.commandName === 'decir') {
        // Tu nueva ID de rol exclusiva
        const ROL_EXCLUSIVO = '1510139197493739721';

        // Bloqueo de seguridad por rol
        if (!interaction.member.roles.cache.has(ROL_EXCLUSIVO)) {
            const embedError = new EmbedBuilder()
                .setTitle('SISTEMA DE SEGURIDAD')
                .setDescription('ACCESO DENEGADO — CODIGO DE ERROR 403')
                .setColor('#e74c3c')
                .addFields({ name: 'RESTRICCION', value: 'NO TIENES AUTORIZACIÓN PARA TRANSMITIR MENSAJES CON ESTA IDENTIDAD DE RECOLECCIÓN DE DATOS.' });
            
            return await interaction.reply({ embeds: [embedError], ephemeral: true });
        }

        const mensajeTexto = interaction.options.getString('mensaje');

        const embedAnuncio = new EmbedBuilder()
            .setTitle('COMUNICADO OFICIAL')
            .setDescription('SISTEMA DE INFORMACIÓN AUTOMATIZADO')
            .setColor('#2c3e50')
            .addFields({ name: 'MENSAJE DE LA CENTRAL', value: mensajeTexto });

        await interaction.channel.send({ embeds: [embedAnuncio] });

        await interaction.reply({ content: 'Transmisión completada de manera exitosa.', ephemeral: true });
    }
});

client.login(process.env.DISCORD_TOKEN);
