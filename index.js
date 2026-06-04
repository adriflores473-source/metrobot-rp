const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('Sistema de Seguridad MetroBot Activo'));
app.listen(process.env.PORT || 3000);


const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Registro del comando /entorno
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
        )
].map(command => command.toJSON());

// Cuando el bot se conecta a Discord
client.once('ready', async () => {
    console.log(`🤖 ¡Unidad Policial ${client.user.tag} en línea y patrullando!`);
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );
        console.log('🚨 Comandos de entorno policial registrados con éxito.');
    } catch (error) {
        console.error('Error registrando comandos:', error);
    }
});

// Cuando alguien usa el comando /entorno
client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'entorno') {
        const desc = interaction.options.getString('descripcion');
        const ubi = interaction.options.getString('ubicacion');

        await interaction.reply({
            content: `📢 **[ENTORNO DE ROL]** 📢\n\n📝 **Descripción:** ${desc}\n📍 **Ubicación:** ${ubi}\n\n*Atención a todas las unidades de LSPD en la zona.*`
        });
    }
});

client.login('MTUxMTY5MjQ4OTYzODAyMzMzOA.GjkN1a.Ud8OyXe2lhXXbPaN3u2fVSx0uV7yn4JnGmb_Pc');
