import mainBurn from "./NewBurnFinder";
import mainRugpull from './RugPullFinder';
import TelegramBotService from './TelegramBotService';
import DiscordBotService from './DiscordBotService';
import BRPCService from './BRPCService';
 


const solanaApi = async () => {
 
  try {
    const bot = new TelegramBotService();
    const dbot = new DiscordBotService();
    new BRPCService();
    mainBurn(bot, dbot);
    mainRugpull();
  } catch (error) {
    console.log(error)
    solanaApi();
  }
}



solanaApi();


