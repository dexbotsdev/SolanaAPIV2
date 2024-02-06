import TelegramFreshPoolsBotService from "./TelegramFreshPoolsBotService";
import DiscordBotNewPoolsService from "./DiscordBotNewPoolsService";
import HelloMoonService from "./HelloMoonService";
 


const newPoolApi = async () => {
 
  try {

    const disbot = new DiscordBotNewPoolsService();
    const tgBot = new TelegramFreshPoolsBotService();
     new HelloMoonService(disbot,tgBot);
  } catch (error) {
    console.log(error)
    newPoolApi();
  }
}



newPoolApi();


