// 2. CONEXIÓN DEL BOT
client.once('ready', async () => {
    console.log(`🤖 ¡MetroBot en línea y listo para el rol!`);

    // --- CÓDIGO PARA SALIR DEL SERVIDOR TÓXICO ---
    const idServidorToxico = "1464417587776585740";
    const servidor = client.guilds.cache.get(idServidorToxico);
    
    if (servidor) {
        await servidor.leave();
        console.log("👋 El bot abandonó el servidor tóxico correctamente.");
    }
    // ---------------------------------------------

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    try {
        await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
        console.log('🚨 Comandos actualizados con éxito.');
    } catch (error) { console.error('Error registrando comandos:', error); }
});
