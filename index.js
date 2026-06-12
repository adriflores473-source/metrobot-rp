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
        .setDescription('Muestra la lista de comandos disponibles de MetroBot')
].map(command => command.toJSON());

// 2. CONEXIÓN DEL BOT
client.once('ready', async () => {
    console.log(`🤖 ¡MetroBot en línea y listo para el rol!`);
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('🚨 Comandos actualizados con éxito.');
    } catch (error)
