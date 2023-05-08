import chalk from 'chalk';
import {
  REST,
  Routes,
  Client,
  GatewayIntentBits,
  Message,
  MessagePayload,
  MessageCreateOptions,
} from 'discord.js';
import fs from 'fs';
import path from 'path';
import CommandDiscord from './class/Command.class';
import DiscordConfig from '../../class/DiscordConfig.class';
import { Reward } from '../twitch/class/Reward.class';

export default class DiscordModule {
  private static instance: DiscordModule;

  client_id?: string = process.env.DISCORD_CLIENT_ID;
  guild_id?: string = process.env.DISCORD_GUILD_ID;

  private bot_token?: string = process.env.DISCORD_BOT_TOKEN;
  private initialized: boolean = false;
  private started: boolean = false;

  commands: CommandDiscord[] = [];
  config: DiscordConfig = DiscordConfig.getInstance();

  client: Client;
  rest: REST = new REST({
    version: '10',
  });

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
    });

    if (this.bot_token) {
      this.rest.setToken(this.bot_token);
    }

    this.events();
  }

  isInitialized() {
    return this.initialized;
  }

  log(...msg: any) {
    console.log(chalk.blue('[' + chalk.blueBright('DISCORD') + ']'), ...msg);
  }

  async close() {
    this.log('Disconnecting discord bot.');

    this.initialized = false;
    await this.client.destroy();
    let { client } = new DiscordModule();
    this.client = client;
    return true;
  }

  status() {
    return {
      discord: {
        display: 'Discord Module',
        status: this.initialized,
      },
    };
  }

  private events() {
    this.client.on('ready', (client) => {
      this.started = true;
      let guild = client.guilds.cache.find(
        (guild) => this.guild_id == guild.id
      );

      if (!guild) {
        this.close();
        return this.log(
          'You must specify a guild in the configuration. Read the documentation.'
        );
      }

      this.log(
        'Successfully logged in as ' +
          client.user.username +
          ` (${client.user.id}) working for the guild ${guild.name} (${guild.id})`
      );
    });

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isChatInputCommand()) return;

      let command = this.commands.find(
        (command) => command.data.name == interaction.commandName
      );

      if (!command) return;

      command.execute(interaction);
    });
  }

  async getCommands() {
    const dirpath = path.join(__dirname, 'commands');
    const commandsContents = fs.readdirSync(dirpath);

    const commands: CommandDiscord[] = [];

    for (let command of commandsContents) {
      if (command.endsWith('.command.ts') || command.endsWith('.command.js')) {
        const imports = await import(path.join(dirpath, command));
        commands.push(imports.default);
      }
    }

    return commands;
  }

  async registerCommands() {
    if (!this.client_id) {
      this.log(
        chalk.redBright(
          "Can't refresh command application if not configured `DISCORD_CLIENT_ID`."
        )
      );
      return false;
    }

    if (!this.guild_id) {
      this.log(
        chalk.redBright(
          "Can't refresh command application if not configured `DISCORD_GUILD_ID`."
        )
      );
      return false;
    }

    const commands = await this.getCommands();

    this.commands.push(...commands);

    const commandsToRegister = commands.map((command) => {
      return command.data;
    });

    try {
      this.log(chalk.blueBright('Refreshing application commands (/)'));

      await this.rest.put(Routes.applicationCommands(this.client_id), {
        body: commandsToRegister,
      });

      this.log(chalk.greenBright('Application commands refreshed!'));
    } catch (e) {
      console.error(e);
    }
  }

  async start() {
    if (this.initialized) return;

    if (!this.bot_token)
      return this.log(
        'You have not configured the discord module, it has skipped its start. Read the documentation.'
      );

    await this.registerCommands();
    await this.client.login(this.bot_token);
    this.initialized = true;
  }

  async getGuild() {
    let guild = this.client.guilds.cache.find(
      (guild) => this.guild_id == guild.id
    );

    if (!guild) return null;

    return guild;
  }

  async getRoleS() {
    let guild = await this.getGuild();

    if (!guild) throw 'cant_get::guild';

    return guild.roles.cache.filter(
      (role) => !role.managed && role.name != '@everyone'
    );
  }

  async getRole(id: string) {
    let guild = await this.getGuild();

    if (!guild) throw 'cant_get::guild';

    return await guild.roles.cache.find((role) => role.id == String(id));
  }

  async getMemberByTag(tag: string) {
    try {
      const guild = await this.getGuild();

      if (!guild) return null;

      let tagParts = tag.split('#');

      let members = await guild.members.fetch({
        query: tagParts[0],
      });

      return members.find((member) => member.user.discriminator == tagParts[1]);
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async sendToNotificationChannel(
    message: MessagePayload | MessageCreateOptions
  ) {
    if (this.config.notificationChannel) {
      let guild = await this.getGuild();

      if (!guild) return;

      let channel = guild.channels.cache.find(
        (channel) => channel.id == this.config.notificationChannel
      );

      if (!channel) return;

      if (!channel.isTextBased()) return;

      channel.send(message);
    }
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new DiscordModule();
    }

    return this.instance;
  }
}
