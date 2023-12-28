/*

WATCHTOWER
by Kostek001

*/

require("dotenv").config();
const { Client } = require("discord.js-selfbot-v13");
const dayjs = require("dayjs");
const mysql = require("mysql");

const bot = new Client({ checkUpdate: false });

//=====================================================

var con = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

//=====================================================

var oldPresences: any;

//=====================================================

bot.login(process.env.TOKEN);

bot.once("ready", async () => {
  timeConsole(`Logged in as ${bot.user.tag}!\n`);
  bot.user.setStatus("invisible");

  const guild = bot.guilds.cache.get(process.env.GUILD_ID);
  const channel = guild.channels.cache.get(process.env.CHANNEL_ID);
  for (let index = 0; index <= guild.memberCount; index += 100) {
    await guild.members.fetchMemberList(channel, index);
    await delay(500);
  }

  setInterval(async function main() {
    var newPresences: Array<any> = JSON.parse(
      JSON.stringify(Array.from(guild.presences.cache))
    );

    oldPresences = oldPresences ?? newPresences;
    for (let i = 0; i < newPresences.length; i++) {
      var newUser = newPresences[i][1];
      var oldUser = oldPresences[i][1];

      if (newUser.status == "idle" || newUser.status == "dnd")
        newUser.status = "online";
      if (
        newUser.userId == oldUser.userId &&
        (newUser.status != oldUser.status ||
          newUser.activities[0]?.name != oldUser.activities[0]?.name)
      ) {
        var newUsername = bot.users.cache.find(
          (u: any) => u.id === newUser.userId
        ).tag;
        var newUserId = newUser.userId;

        timeConsole(
          `${newUsername} - ${oldUser.status} => ${newUser.status} | ${
            oldUser.activities[0]?.name ?? "Brak"
          } => ${newUser.activities[0]?.name ?? "Brak"}`
        );
        con.query(
          `INSERT INTO status (USER_ID, STATUS, ACTIVITIES) VALUES ('${parseInt(
            newUserId
          )}', '${newUser.status}', '${newUser.activities[0]?.name ?? null}')`,
          function (err: any) {
            if (err) throw err;
          }
        );

        con.query(
          `SELECT USERNAME FROM names where USER_ID like '${parseInt(
            newUserId
          )}' LIMIT 1`,
          function (err: any, result: any, fields: any) {
            if (err) throw err;
            result = result[0];

            if (result?.USERNAME != newUsername && result) {
              con.query(
                `UPDATE names SET USERNAME = '${newUsername}' WHERE USER_ID = '${parseInt(
                  newUserId
                )}'`,
                function (err: any) {
                  if (err) throw err;
                }
              );
              timeConsole(`UPDATED ${newUserId} => ${newUsername}`);
            } else if (!result) {
              con.query(
                `INSERT INTO names (USER_ID, USERNAME) VALUES ('${parseInt(
                  newUserId
                )}', '${newUsername}')`,
                function (err: any) {
                  if (err) throw err;
                }
              );
              timeConsole(`CREATED ${newUserId} => ${newUsername}`);
            }
          }
        );
      }
    }
    oldPresences = await JSON.parse(JSON.stringify(newPresences));
  }, 20000);
});

function timeConsole(message: string) {
  console.info("[" + dayjs().format("HH:mm") + "]", message);
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
