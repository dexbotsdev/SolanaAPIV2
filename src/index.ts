import mainBurn from "./NewBurnFinder";
import mainRugpull from './RugPullFinder';
import TelegramBurnedPoolBotService from './TelegramBurnedPoolBotService';
import DiscordBotNewBurnsService from './DiscordBotNewBurnsService';
import BRPCService from './BRPCService';
 


const solanaApi = async () => {
 
  try {
    const bot = new TelegramBurnedPoolBotService();
    const dbot = new DiscordBotNewBurnsService();
    new BRPCService();
    mainBurn(bot, dbot);
    mainRugpull();
  } catch (error) {
    console.log(error)
    solanaApi();
  }
}



solanaApi();


