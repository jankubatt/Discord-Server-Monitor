import { Client, GatewayIntentBits } from 'discord.js';
import mysql from 'mysql';

const con = mysql.createConnection({
    host: "",
    user: "",
    password: "",
    database: ""
  });

  con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildPresences] });

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);

  logUserPresences()
  // Log user presences every minute
  setInterval(logUserPresences, 60000);
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;
  
    if (interaction.commandName === 'records') {
        await con.query("SELECT COUNT(*) as count FROM presences", async function (err, result) {
            if (err) throw err;
            await interaction.reply(`There is ${result[0].count} records in the database.`);
        });
      
    }
  });

client.login("");

// Function to log user presences
function logUserPresences() {
    const guild = client.guilds.cache.get(''); // Replace 'YOUR_GUILD_ID' with your actual guild ID

    if (guild) {
        let sql = `SELECT * FROM presences GROUP BY username;`    
		con.query(sql, (err, result) => {
			if (result.length === 0) {	
				guild.members.cache.map(member => {			
					if (member.user.bot) return;

					sql = `INSERT INTO presences (username, status, avatar) VALUES ('${encodeURIComponent(member.user.tag)}', '${member.presence?.status || 'offline'}', '${member.displayAvatarURL()}')`;
					con.query(sql, function (err, result) { if (err) throw err; });		
				});		
			}
			else {
				result.map((item) => {
					guild.members.cache.map(member => {		
						if (member.user.bot) return;
						
						sql = `SELECT * FROM presences WHERE username='${encodeURIComponent(member.user.tag)}' ORDER BY timestamp DESC LIMIT 1;`;
						con.query(sql, (err, result) => {
							if (encodeURIComponent(member.user.tag) == item.username && (member.presence?.status || "offline") != result[0].status) {	
								sql = `INSERT INTO presences (username, status, avatar) VALUES ('${encodeURIComponent(member.user.tag)}', '${member.presence?.status || 'offline'}', '${member.displayAvatarURL()}')`;
								con.query(sql, function (err, result) {if (err) throw err;});
							}
						})
					});
				})
			}
        })
  	}
}