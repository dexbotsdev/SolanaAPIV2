import TelegramFreshPoolsBotService from "./TelegramFreshPoolsBotService";
import DiscordBotNewPoolsService from "./DiscordBotNewPoolsService";
import HelloMoonService from "./HelloMoonService";
import BRPCService2 from "./BRPCService2";
 


const newPoolApi = async () => {
 
  try {

    const disbot = new DiscordBotNewPoolsService();
    const tgBot = new TelegramFreshPoolsBotService();
     new HelloMoonService(disbot,tgBot);

     new BRPCService2(disbot,tgBot);
  } catch (error) {
    console.log(error)
    newPoolApi();
  }
}



newPoolApi();


