const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Sistema de Seguridad MetroBot Activo'));
app.listen(process.env.PORT || 3000);

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
                .setDescription('¿A qué departamento entras? (Ej: LSPD, Sheriff)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('rango')
                .setDescription('Tu rango actual (Ej: Oficial I, Sargento)')
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
                .setDescription('¿De qué departamento te retiras? (Ej: LSPD, Sheriff)')
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

// 3. RESPUESTAS A LOS COMANDOS (FORMATO EMBED CLEAN EN ESPAÑOL)
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

    // Respuesta a /iniciar-patrullaje
    if (interaction.commandName === 'iniciar-patrullaje') {
        const depto = interaction.options.getString('departamento').toUpperCase();
        const rango = interaction.options.getString('rango').toUpperCase();
        const placa = interaction.options.getString('placa');
        const agente = interaction.user.username.toUpperCase(); 

        const embed = new EmbedBuilder()
            .setTitle(`DEPARTAMENTO DE ${depto}`)
            .setDescription('INGRESO A SERVICIO / EN PATRULLA')
            .setColor('#2ecc71')
            .addFields(
                { name: 'OFICIAL / AGENTE', value: agente },
                { name: 'RANGO', value: rango },
                { name: 'NUMERO DE PLACA', value: `[${placa}]` },
                { name: 'ESTADO', value: 'ACTIVO / DISPONIBLE' }
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
            .setTitle(`DEPARTAMENTO DE ${depto}`)
            .setDescription('RETIRO DE SERVICIO / FUERA DE PATRULLA')
            .setColor('#e74c3c')
            .addFields(
                { name: 'OFICIAL / AGENTE', value: agente },
                { name: 'RANGO', value: rango },
                { name: 'NUMERO DE PLACA', value: `[${placa}]` },
                { name: 'ESTADO', value: '10-7 / FUERA DE SERVICIO' }
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
});

client.login(process.env.DISCORD_TOKEN);
