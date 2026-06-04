const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Sistema de Seguridad MetroBot Activo'));
app.listen(process.env.PORT || 3000);

const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 1. REGISTRO DE COMANDOS
const commands = [
    // Comando /entorno
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

    // Comando /iniciar-patrullaje
    new SlashCommandBuilder()
        .setName('iniciar-patrullaje')
        .setDescription('Anuncia que entras en servicio en un departamento.')
        .addStringOption(option =>
            option.setName('departamento')
                .setDescription('¿A qué departamento entras? (Ej: LSPD, SAMD)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('rango')
                .setDescription('Tu rango actual (Ej: Oficial I, Capitán)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('placa')
                .setDescription('Tu número de placa o identificación')
                .setRequired(true)
        ),

    // Comando /finalizar-patrullaje
    new SlashCommandBuilder()
        .setName('finalizar-patrullaje')
        .setDescription('Anuncia que terminas tu servicio y sales de patrullaje.')
        .addStringOption(option =>
            option.setName('departamento')
                .setDescription('¿De qué departamento te retiras? (Ej: LSPD, SAMD)')
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

    // Comando /registrar-vehiculo (ACTUALIZADO)
    new SlashCommandBuilder()
        .setName('registrar-vehiculo')
        .setDescription('Registra un vehículo en la base de datos de la ciudad.')
        .addStringOption(option =>
            option.setName('modelo')
                .setDescription('Marca y modelo del auto (Ej: Benefactor Schafter)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('matricula')
                .setDescription('La placa o matrícula del coche (Ej: LS-9921)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('color')
                .setDescription('Color o colores del vehículo (Ej: Negro Mate, Rojo)')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('propietario')
                .setDescription('Nombre y Apellido del dueño del vehículo')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('dni')
                .setDescription('Número de DNI o identificación del propietario')
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

// 3. RESPUESTAS A LOS COMANDOS
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    // Respuesta a /entorno
    if (interaction.commandName === 'entorno') {
        const desc = interaction.options.getString('descripcion');
        const ubi = interaction.options.getString('ubicacion');
        await interaction.reply({
            content: `📢 **[ENTORNO DE ROL]** 📢\n\n📝 **Descripción:** ${desc}\n📍 **Ubicación:** ${ubi}\n\n⚠️ @everyone *• ¡Atención a la situación de entorno!*`
        });
    }

    // Respuesta a /iniciar-patrullaje
    if (interaction.commandName === 'iniciar-patrullaje') {
        const depto = interaction.options.getString('departamento').toUpperCase();
        const rango = interaction.options.getString('rango');
        const placa = interaction.options.getString('placa');
        const agente = interaction.user; 
        await interaction.reply({
            content: `🔵 **[${depto} - INICIO DE SERVICIO]** 🔵\n\n🪪 **Funcionario:** ${agente}\n⭐ **Rango:** ${rango}\n🔢 **Número de Placa:** [${placa}]\n\n*El miembro se encuentra disponible y en patrullaje. ¡Buen servicio!*`
        });
    }

    // Respuesta a /finalizar-patrullaje
    if (interaction.commandName === 'finalizar-patrullaje') {
        const depto = interaction.options.getString('departamento').toUpperCase();
        const rango = interaction.options.getString('rango');
        const placa = interaction.options.getString('placa');
        const agente = interaction.user; 
        await interaction.reply({
            content: `🔴 **[${depto} - FIN DE SERVICIO]** 🔴\n\n🪪 **Funcionario:** ${agente}\n⭐ **Rango:** ${rango}\n🔢 **Número de Placa:** [${placa}]\n\n*El miembro pasa a estar fuera de servicio (QTH). ¡Gracias por su labor!*`
        });
    }

    // Respuesta a /registrar-vehiculo (ACTUALIZADA)
    if (interaction.commandName === 'registrar-vehiculo') {
        const modelo = interaction.options.getString('modelo');
        const matricula = interaction.options.getString('matricula').toUpperCase();
        const color = interaction.options.getString('color');
        const propietario = interaction.options.getString('propietario');
        const dni = interaction.options.getString('dni');

        await interaction.reply({
            content: `🚘 **[REGISTRO VEHICULAR DGT]** 🚘\n\n📋 **Modelo:** ${modelo}\n🎨 **Color:** ${color}\n🔢 **Matrícula / Placa:** [${matricula}]\n\n👤 **Propietario:** ${propietario}\n🪪 **DNI:** ${dni}\n\n*Vehículo registrado exitosamente en la base de datos nacional.*`
        });
    }
});

client.login(process.env.DISCORD_TOKEN);
