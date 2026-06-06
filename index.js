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
        GatewayIntentBits.Guilds
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
        .setDescription('Envía un comunicado oficial a través del bot (Solo Fundador Principal).')
        .addStringOption(option =>
            option.setName('mensaje')
                .setDescription('Escribe el texto que el bot va a decir')
                .setRequired(true)
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

    new SlashCommandBuilder()
        .setName('anonimo')
        .setDescription('Envía un mensaje anónimo con estilo Odyssey Bot.')
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

// 3. RESPUESTAS A INTERACCIONES (COMANDOS Y FORMULARIOS)
client.on('interactionCreate', async interaction => {
    const MI_ID_DE_USUARIO = '1286812839465717772';

    // A. SI ES UN COMANDO DE BARRA
    if (interaction.isChatInputCommand()) {
        
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

        if (interaction.commandName === 'decir') {
            if (interaction.user.id !== MI_ID_DE_USUARIO) {
                const embedError = new EmbedBuilder()
                    .setTitle('SISTEMA DE SEGURIDAD')
                    .setDescription('ACCESO DENEGADO — CODIGO DE ERROR 403')
                    .setColor('#e74c3c')
                    .addFields({ name: 'RESTRICCION', value: 'ESTE COMANDO ES EXCLUSIVO DEL FUNDADOR PRINCIPAL.' });
                
                return await interaction.reply({ embeds: [embedError], ephemeral: true });
            }

            const mensajeTexto = interaction.options.getString('mensaje');

            const embedAnuncio = new EmbedBuilder()
                .setTitle('ANUNCIO DE LA ADMINISTRACION')
                .setDescription('COMUNIDAD DE LOS ANGELES')
                .setColor('#2c3e50')
                .addFields({ name: 'CONTENIDO', value: mensajeTexto });

            await interaction.channel.send({ embeds: [embedAnuncio] });
            await interaction.reply({ content: 'Transmisión completada de manera exitosa.', ephemeral: true });
        }

        if (interaction.commandName === 'anonimo') {
            try {
                const modal = new ModalBuilder()
                    .setCustomId('formulario_anonimo')
                    .setTitle('Usuario de la web');

                const mensajeInput = new TextInputBuilder()
                    .setCustomId('contenido_anonimo')
                    .setLabel('Escribe tu mensaje secreto aquí')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setPlaceholder('Escribe el texto que procesará el sistema...');

                const filaAccion = new ActionRowBuilder().addComponents(mensajeInput);
                modal.addComponents(filaAccion);

                await interaction.showModal(modal);
            } catch (err) {
                console.error('Error mostrando el modal:', err);
            }
        }
    }

    // B. SI ENVIARON UN FORMULARIO (MODAL)
    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'formulario_anonimo') {
            try {
                const textoMensaje = interaction.fields.getTextInputValue('contenido_anonimo');

                const embedOdysseyStyle = new EmbedBuilder()
                    .setAuthor({ name: 'Usuario de la web' })
                    .setTitle('Mensaje con autor anónimo')
                    .setDescription(textoMensaje)
                    .setColor('#111111') 
                    .setThumbnail('https://i.imgur.com/vK28Q8D.png') 
                    .setFooter({ text: 'MetroBot For Roleplay' })
                    .setTimestamp(); // Esto pone la hora actual exacta automáticamente estilo Odyssey

                await interaction.channel.send({ embeds: [embedOdysseyStyle] });

                // Respondemos de inmediato para que Discord no piense que el bot se colgó
                await interaction.reply({ content: '🤫 Tu mensaje ha sido enviado de forma anónima.', ephemeral: true });
            } catch (err) {
                console.error('Error procesando el modal:', err);
            }
        }
    }
});

client.login(process.env.DISCORD_TOKEN);
