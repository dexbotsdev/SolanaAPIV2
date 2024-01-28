import { EventEmitter } from 'emitter'
import WebSocket from 'ws';

import { findUser } from "./db/db";
import main from "./NewPoolFinder";
import mainBurn from "./NewBurnFinder";
import mainRugpull from './RugPullFinder';
import TelegramBotService from './TelegramBotService';
import LpBurnTrackerService from './LpBurnTrackerService';
import DiscordBotService from './DiscordBotService';


const MAX_CONNECTIONS_PER_USER = 1111112;
const userConnections = new Map();
const AUTH_HEADER_KEY = 'authorization';
const newPoolSubscriptions = new Map();
const newBurnSubscriptions = new Map();
const rugPullSubscriptions = new Map();
const bot = new TelegramBotService();
const dbot = new DiscordBotService();

const solanaApi = async () => {
  const eventEmitter = new EventEmitter();

  eventEmitter.setMaxListeners(999);


  eventEmitter.on('newListener', (event: string, listener: any) => {
    console.log(`Added  ${event.toUpperCase()} listener.`);
  });


  eventEmitter.on('NewPool', async (ammPool: string) => {
    console.log('Recieved NewPool ' + new Date().toString());
    // console.log(ammPool); 
  });


  eventEmitter.on('NewBurn', async (ammPool: string) => {
    console.log('Recieved NewBurn');
    console.log(ammPool);

    //await bot.sendBurnMessageToChannel(ammPool);


  });
  eventEmitter.on('RugPull', async (ammPool: string) => {
    console.log('Recieved RugPull');
    // console.log(ammPool);

  });




  eventEmitter.on('Disconnected', (message: string) => {
    console.log('Disconnected -- need to restart ' + message.toUpperCase());
    solanaApi();
  });


  main(eventEmitter);
  mainBurn(eventEmitter,bot,dbot);
  mainRugpull(eventEmitter);
  await LpBurnTrackerService();
}



solanaApi();


