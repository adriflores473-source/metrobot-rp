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
        ),

    new SlashCommandBuilder()
        .setName('buscar-vehiculo')
        .setDescription('Consulta los datos de una matrícula en el sistema (Solo personal autorizado).')
        .addStringOption(option =>
            option.setName('matricula')
                .setDescription('La matrícula o placa que deseas consultar')
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

    // Respuesta a /buscar-vehiculo (CON MÚLTIPLES ROLES AUTORIZADOS)
    if (interaction.commandName === 'buscar-vehiculo') {
        // Lista con las IDs de tus tres roles autorizados
        const ROLES_AUTORIZADOS = [
            '1510145980983545898',
            '1510146060616470679',
            '1510146659479195669'
        ];

        // Comprobamos si el usuario tiene AL MENOS UNO de los roles de la lista
        const tienePermiso = interaction.member.roles.cache.some(role => ROLES_AUTORIZADOS.includes(role.id));

        if (!tienePermiso) {
            const embedError = new EmbedBuilder()
                .setTitle('SISTEMA DE SEGURIDAD')
                .setDescription('ACCESO DENEGADO — ERROR DE CREDENCIALES')
                .setColor('#e74c3c')
                .addFields({ name: 'RESTRICCION', value: 'NO CUENTAS CON LOS PERMISOS GUBERNAMENTALES REQUERIDOS PARA CONSULTAR LA BASE DE DATOS.' });
            
            return await interaction.reply({ embeds: [embedError], ephemeral: true });
        }

        const matricula = interaction.options.getString('matricula').toUpperCase();

        const embedBusqueda = new EmbedBuilder()
            .setTitle('DEPARTAMENTO DE VEHICULOS MOTORIZADOS')
            .setDescription('CONSULTA DE TITULARIDAD Y REGISTRO AUTOMOTOR')
            .setColor('#607d8b')
            .addFields(
                { name: 'MATRICULA CONSULTADA', value: `[${matricula}]` },
                { name: 'ESTADO DE BUSQUEDA', value: 'CONEXION ESTABLECIDA CON LA CENTRAL' },
                { name: 'RESULTADO', value: 'VEHICULO LOCALIZADO EN EL SISTEMA' },
                { name: 'INFORMACION ADICIONAL', value: 'EL TITULAR DE LA PLACA DEBE DISPONER DE LA DOCUMENTACIÓN FÍSICA EN REGLA.' }
            );

        await interaction.reply({ embeds: [embedBusqueda] });
    }
});

client.login(process.env.DISCORD_TOKEN);
