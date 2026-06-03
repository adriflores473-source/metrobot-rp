const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');

// 1. Crear el bot
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// 2. Registramos el comando /entorno (Ahora con descripción y ubicación)
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
                .setDescription('¿Dónde está ocurriendo? (Ej: Idlewood, Garaje Central)')
                .setRequired(true)
        )
].map(command => command.toJSON());

// 3. Al encender, activa los comandos en Discord
client.once('ready', async () => {
    console.log(`🤖 ¡${client.user.tag} encendido con comandos /!`);

    const rest = new REST({ version: '10' }).setToken(client.token);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('¡Comando /entorno listo para usar en tu Discord!');
    } catch (error) {
        console.error(error);
    }
});

// 4. Qué hace el bot cuando se usa /entorno en el servidor principal
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'entorno') {
        // Obtenemos lo que escribió el usuario en ambos cuadros
        const descripcion = interaction.options.getString('descripcion');
        const ubicacion = interaction.options.getString('ubicacion');
        
        // --- AQUÍ ESTÁN TUS 5 ROLES DEL SERVIDOR PRINCIPAL ---
        const rol1 = '1510145980983545898';
        const rol2 = '1510146060616470679';
        const rol3 = '1510146244683497482';
        const rol4 = '1510146346219475056';
        const rol5 = '1510146659479195669';
        // ----------------------------------------------------

        // Respuesta formateada con la descripción, ubicación y pings
        await interaction.reply({
            content: `📢 **[ENTORNO]**\n📝 **Descripción:** ${descripcion}\n📍 **Ubicación:** ${ubicacion}\n\n⚠️ <@&${rol1}> <@&${rol2}> <@&${rol3}> <@&${rol4}> <@&${rol5}> *¡Atención unidades en servicio!*`
        });
    }
});

// 5. TU TOKEN (Ponlo aquí dentro de las comillas)
client.login('MTUxMTY5MjQ4OTYzODAyMzMzOA.GE6ObL.uZXp95zTZMOyKmN-7l6UCLzQ8oq8vZ6cDjOMKk');