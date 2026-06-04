const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Sistema de Seguridad MetroBot Activo'));
app.listen(process.env.PORT || 3000);

// Importamos EmbedBuilder para crear los recuadros profesionales
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
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
        .setName('iniciar-patrullaje')
        .setDescription('Anuncia que entras en servicio en un departamento.')
        .addStringOption(option =>
            option.setName('departamento')
                .setDescription('¿A qué departamento entras? (Ej: LSPD, SAHP)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('rango')
                .setDescription('Tu rango actual (Ej: Officer I, Sergeant)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('placa')
                .setDescription('Tu número de placa o identificación')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('finalizar-patrullaje')
        .setDescription('Anuncia que terminas tu servicio y sales de patrullaje.')
        .addStringOption(option =>
            option.setName('departamento')
                .setDescription('¿De qué departamento te retiras? (Ej: LSPD, SAHP)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('rango')
                .setDescription('Tu rango actual')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('placa')
                .setDescription('Tu número de placa o identificación')
                .setRequired(true)
        ),

    new SlashCommandBuilder()
        .setName('registrar-vehiculo')
        .setDescription('Registra un vehículo en la base de datos de la ciudad.')
        .addStringOption(option =>
            option.setName('modelo')
                .setDescription('Marca y modelo del auto (Ej: Vapid Stanier)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('matricula')
                .setDescription('La placa o matrícula del coche (Ej: 88ABC12)')
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
                .setDescription('Número de ID/SSN del propietario')
                .setRequired(true)
        )
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

// 3. RESPUESTAS A LOS COMANDOS (FORMATO EMBED CLEAN)
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // Respuesta a /entorno
    if (interaction.commandName === 'entorno') {
        const desc = interaction.options.getString('descripcion');
        const ubi = interaction.options.getString('ubicacion');

        const embed = new EmbedBuilder()
            .setTitle('ENVIRONMENT REPORT')
            .setDescription('STATE OF SAN ANDREAS')
            .setColor('#7289da') // Color azul clásico de Discord, puedes cambiarlo
            .addFields(
                { name: 'DESCRIPTION', value: desc },
                { name: 'LOCATION', value: ubi }
            );

        // Enviamos el embed y además la mención fuera para que notifique a todos
        await interaction.reply({ content: '@everyone', embeds: [embed] });
    }

    // Respuesta a /iniciar-patrullaje
    if (interaction.commandName === 'iniciar-patrullaje') {
        const depto = interaction.options.getString('departamento').toUpperCase();
        const rango = interaction.options.getString('rango').toUpperCase();
        const placa = interaction.options.getString('placa');
        const agente = interaction.user.username.toUpperCase(); 

        const embed = new EmbedBuilder()
            .setTitle(`DEPARTMENT OF ${depto}`)
            .setDescription('UNIT SIGN-ON / ON DUTY')
            .setColor('#2ecc71') // Color Verde (Indica inicio/activo)
            .addFields(
                { name: 'OFFICER / AGENT', value: agente },
                { name: 'RANK', value: rango },
                { name: 'BADGE NUMBER', value: `[${placa}]` },
                { name: 'STATUS', value: 'ACTIVE / AVAILABLE' }
            );

        await interaction.reply({ embeds: [embed] });
    }

    // Respuesta a /finalizar-patrullaje
    if (interaction.commandName === 'finalizar-patrullaje') {
        const depto = interaction.options.getString('departamento').toUpperCase();
        const rango = interaction.options.getString('rango').toUpperCase();
        const placa = interaction.options.getString('placa');
        const agente = interaction.user.username.toUpperCase(); 

        const embed = new EmbedBuilder()
            .setTitle(`DEPARTMENT OF ${depto}`)
            .setDescription('UNIT SIGN-OFF / OFF DUTY')
            .setColor('#e74c3c') // Color Rojo (Indica fin/inactivo)
            .addFields(
                { name: 'OFFICER / AGENT', value: agente },
                { name: 'RANK', value: rango },
                { name: 'BADGE NUMBER', value: `[${placa}]` },
                { name: 'STATUS', value: '10-7 / OUT OF SERVICE' }
            );

        await interaction.reply({ embeds: [embed] });
    }

    // Respuesta a /registrar-vehiculo
    if (interaction.commandName === 'registrar-vehiculo') {
        const modelo = interaction.options.getString('modelo').toUpperCase();
        const matricula = interaction.options.getString('matricula').toUpperCase();
        const color = interaction.options.getString('color').toUpperCase();
        const propietario = interaction.options.getString('propietario').toUpperCase();
        const dni = interaction.options.getString('dni');

        const embed = new EmbedBuilder()
            .setTitle('DEPARTMENT OF MOTOR VEHICLES')
            .setDescription('STATE OF SAN ANDREAS — VEHICLE REGISTRATION')
            .setColor('#34495e') // Color gris oscuro institucional
            .addFields(
                { name: 'VEHICLE MODEL', value: modelo },
                { name: 'COLOR', value: color },
                { name: 'LICENSE PLATE', value: `[${matricula}]` },
                { name: 'OWNER NAME', value: propietario },
                { name: 'IDENTIFICATION NUMBER (ID/SSN)', value: `[${dni}]` },
                { name: 'RECORD STATUS', value: 'VALID / REGISTERED' }
            );

        await interaction.reply({ embeds: [embed] });
    }
});

client.login(process.env.DISCORD_TOKEN);
