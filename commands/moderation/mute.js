// eslint-disable-next-line no-unused-vars
module.exports.run = async (client, message, args, level) => {
  // Sets the member to the user mentioned
  let member = message.mentions.members.first() || client.guilds.cache.get(client.config.mainGuild).members.cache.get(args[0]);

  if (!member) {
    if (parseInt(args[0], 10)) {
      try {
        member = await client.guilds.cache.get(client.config.mainGuild).members.fetch(args[1]);
      } catch (err) {
        // Don't need to send a message here
      }
    }
  }

  if (!member) {
    const searchedMember = client.searchMember(args[0]);
    if (searchedMember) {
      const decision = await client.reactPrompt(message, `Would you like to mute \`${searchedMember.user.tag}\`?`);
      if (decision) {
        member = searchedMember;
      } else {
        message.delete().catch((err) => console.error(err));
        return client.error(message.channel, 'Member Not Muted!', 'The prompt timed out, or you selected no.');
      }
    }
  }

  // If no user mentioned, display this
  if (!member) {
    return client.error(message.channel, 'Invalid Member!', 'Please mention a valid member of this server!');
  }

  // Kick member if in voice
  if (member.voice.channel) {
    member.voice.kick();
  }

  try {
  // Adds the role to the member and removes the trade and voice roles
    const mutedMember = await member.roles.add(client.config.mutedRole);
    await mutedMember.roles.remove([client.config.tradeRole, client.config.voiceRole]);
  } catch (e) {
    return client.error(message.channel, 'Error!', `Failed to mute member! Error: ${e}`);
  }

  return client.success(message.channel, 'Success!', `${message.author}, I've successfully muted ${member}!`);
};

module.exports.conf = {
  guildOnly: true,
  aliases: ['m'],
  permLevel: 'Redd',
  args: 1,
};

module.exports.help = {
  name: 'mute',
  category: 'moderation',
  description: 'Gives the mentioned user the Muted role',
  usage: 'mute <@user>',
  details: '<@user> => Any valid member of the server',
};
