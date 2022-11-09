/**
 * THE WATCHTOWER
 * VER 0.2
 * 
 * Author: Kostek001
 */



require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const dayjs = require('dayjs');
const mysql = require('mysql');

const bot = new Client({ checkUpdate: false });
const TOKEN = process.env.TOKEN;
const DB_PASSWORD = process.env.DB_PASSWORD;

//=====================================================

var con = mysql.createPool({
    connectionLimit : 10,
    host: "192.168.88.8",
    user: "watcher",
    password: DB_PASSWORD,
    database: "watcher"
});

//=====================================================

var oldPresences: any;

//=====================================================

bot.login(TOKEN);

bot.once('ready', async () => {
    timeConsole(`Logged in as ${bot.user.tag}!\n`);
    bot.user.setStatus('invisible');

    const guild = bot.guilds.cache.get('868240412677120020');
    const channel = guild.channels.cache.get('967003265906651136');
    for(let index = 0; index <= guild.memberCount; index += 100){
        await guild.members.fetchMemberList(channel, index);
        await delay(500);
    }

    setInterval(async function main() {
        var newPresences: Array<any> = JSON.parse(JSON.stringify(Array.from(guild.presences.cache)));
        
        oldPresences = oldPresences ?? newPresences;
        for(let i = 0; i < newPresences.length; i++){
            var newUser = newPresences[i][1];
            var oldUser = oldPresences[i][1];
            if(newUser.userId == oldUser.userId && (newUser.status != oldUser.status || newUser.activities[0]?.name != oldUser.activities[0]?.name)){
                timeConsole(`${bot.users.cache.find((u: any) => u.id === newUser.userId).tag} - ${oldUser.status} => ${newUser.status} | ${oldUser.activities[0]?.name ?? "Brak"} => ${newUser.activities[0]?.name ?? "Brak"}`); 
                var sql = `INSERT INTO status (USER_ID, USERNAME, STATUS, ACTIVITIES) VALUES ('${parseInt(newUser.userId)}', '${bot.users.cache.find((u: any) => u.id === newUser.userId).tag}', '${newUser.status}', '${newUser.activities[0]?.name ?? null}')`;
                con.query(sql, function (err: any) {
                    if (err) throw err;
                });
            }
        }
        oldPresences = await JSON.parse(JSON.stringify(newPresences));
    }, 20000);
});

function timeConsole(message: string){
    console.info("[" + dayjs().format('HH:mm') + "]", message);
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}