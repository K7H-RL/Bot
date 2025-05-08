const { Client, GatewayIntentBits, SlashCommandBuilder, Events, REST, Routes } = require('discord.js');

// بياناتك هنا
const TOKEN = 'MTM2Mzg4MTg0NjkwNzIwNzgxMA.G8Thcs.4HGtjy2RtMW-ukTeN010kLaKRDM9__Hq_SeiF8';
const CLIENT_ID = '1363881846907207810';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// نخزن الإعدادات هنا مؤقتًا (بتروح لو طفيت البوت)
let targetChannelId = null;
let customMessage = null;
let isMonitoring = false;  // لتحديد إذا كانت المراقبة فعالة

// تسجيل الأوامر
const commands = [
    new SlashCommandBuilder()
        .setName('setup')
        .setDescription('حدد القناة والرسالة للرد الآلي')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('القناة المراد مراقبتها')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('message')
                .setDescription('الرسالة التي سيرسلها البوت')
                .setRequired(true)),
    new SlashCommandBuilder()
        .setName('off')
        .setDescription('إيقاف المراقبة للبوت')
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(TOKEN);

(async () => {
    try {
        console.log('جارٍ تسجيل الأوامر...');
        await rest.put(
            Routes.applicationCommands(CLIENT_ID),
            { body: commands },
        );
        console.log('تم تسجيل الأوامر بنجاح.');
    } catch (error) {
        console.error(error);
    }
})();

client.once(Events.ClientReady, c => {
    console.log(`Logged in as ${c.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === 'setup') {
        const channel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');

        targetChannelId = channel.id;
        customMessage = message;
        isMonitoring = true;  // تفعيل المراقبة

        await interaction.reply(`تم الإعداد بنجاح!\nالقناة: ${channel}\nالرسالة: "${customMessage}"`);
    } else if (interaction.commandName === 'off') {
        targetChannelId = null;
        customMessage = null;
        isMonitoring = false;  // إيقاف المراقبة

        await interaction.reply('تم إيقاف المراقبة.');
    }
});

client.on(Events.MessageCreate, message => {
    if (message.author.bot) return;

    if (isMonitoring && message.channel.id === targetChannelId) {
        message.channel.send(customMessage);
    }
});

client.login(TOKEN);
