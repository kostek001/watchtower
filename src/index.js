"use strict";
/**
 * THE WATCHTOWER
 * VER 0.2
 *
 * Author: Kostek001
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const dayjs = require('dayjs');
const mysql = require('mysql');
const bot = new Client({ checkUpdate: false });
const TOKEN = process.env.TOKEN;
const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
//=====================================================
var con = mysql.createPool({
    connectionLimit: 10,
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME
});
//=====================================================
var oldPresences;
//=====================================================
bot.login(TOKEN);
bot.once('ready', () => __awaiter(void 0, void 0, void 0, function* () {
    timeConsole(`Logged in as ${bot.user.tag}!\n`);
    bot.user.setStatus('invisible');
    const guild = bot.guilds.cache.get('868240412677120020');
    const channel = guild.channels.cache.get('967003265906651136');
    for (let index = 0; index <= guild.memberCount; index += 100) {
        yield guild.members.fetchMemberList(channel, index);
        yield delay(500);
    }
    setInterval(function main() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function* () {
            var newPresences = JSON.parse(JSON.stringify(Array.from(guild.presences.cache)));
            oldPresences = oldPresences !== null && oldPresences !== void 0 ? oldPresences : newPresences;
            for (let i = 0; i < newPresences.length; i++) {
                var newUser = newPresences[i][1];
                var oldUser = oldPresences[i][1];
                if (newUser.status == "idle" || newUser.status == "dnd")
                    newUser.status = "online";
                if (newUser.userId == oldUser.userId && (newUser.status != oldUser.status || ((_a = newUser.activities[0]) === null || _a === void 0 ? void 0 : _a.name) != ((_b = oldUser.activities[0]) === null || _b === void 0 ? void 0 : _b.name))) {
                    var newUsername = bot.users.cache.find((u) => u.id === newUser.userId).tag;
                    var newUserId = newUser.userId;
                    timeConsole(`${newUsername} - ${oldUser.status} => ${newUser.status} | ${(_d = (_c = oldUser.activities[0]) === null || _c === void 0 ? void 0 : _c.name) !== null && _d !== void 0 ? _d : "Brak"} => ${(_f = (_e = newUser.activities[0]) === null || _e === void 0 ? void 0 : _e.name) !== null && _f !== void 0 ? _f : "Brak"}`);
                    con.query(`INSERT INTO status (USER_ID, STATUS, ACTIVITIES) VALUES ('${parseInt(newUserId)}', '${newUser.status}', '${(_h = (_g = newUser.activities[0]) === null || _g === void 0 ? void 0 : _g.name) !== null && _h !== void 0 ? _h : null}')`, function (err) {
                        if (err)
                            throw err;
                    });
                    con.query(`SELECT USERNAME FROM names where USER_ID like '${parseInt(newUserId)}' LIMIT 1`, function (err, result, fields) {
                        if (err)
                            throw err;
                        result = result[0];
                        if ((result === null || result === void 0 ? void 0 : result.USERNAME) != newUsername && result) {
                            con.query(`UPDATE names SET USERNAME = '${newUsername}' WHERE USER_ID = '${parseInt(newUserId)}'`, function (err) {
                                if (err)
                                    throw err;
                            });
                            timeConsole(`UPDATED ${newUserId} => ${newUsername}`);
                        }
                        else if (!result) {
                            con.query(`INSERT INTO names (USER_ID, USERNAME) VALUES ('${parseInt(newUserId)}', '${newUsername}')`, function (err) {
                                if (err)
                                    throw err;
                            });
                            timeConsole(`CREATED ${newUserId} => ${newUsername}`);
                        }
                    });
                }
            }
            oldPresences = yield JSON.parse(JSON.stringify(newPresences));
        });
    }, 20000);
}));
function timeConsole(message) {
    console.info("[" + dayjs().format('HH:mm') + "]", message);
}
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
