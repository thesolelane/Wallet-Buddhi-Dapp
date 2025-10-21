import { storage } from "./storage";
import { shouldAutoPauseBot, shouldDeleteBot } from "./payment-utils";

/**
 * Bot lifecycle manager - handles payment failures and cleanup
 * Runs periodically to:
 * 1. Auto-pause bots with failed payments
 * 2. Delete non-included bots inactive for 30+ days
 */
export class BotLifecycleManager {
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

  /**
   * Start the lifecycle manager
   */
  start() {
    if (this.intervalId) {
      console.log("Bot lifecycle manager already running");
      return;
    }

    console.log("Starting bot lifecycle manager...");
    
    // Run immediately on start
    this.runLifecycleTasks();
    
    // Then run periodically
    this.intervalId = setInterval(() => {
      this.runLifecycleTasks();
    }, this.CHECK_INTERVAL);
  }

  /**
   * Stop the lifecycle manager
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Bot lifecycle manager stopped");
    }
  }

  /**
   * Run lifecycle management tasks
   */
  private async runLifecycleTasks() {
    console.log("[Bot Lifecycle] Running lifecycle checks...");
    
    try {
      const allBots = await storage.getAllArbitrageBots();
      
      for (const bot of allBots) {
        // Task 1: Auto-pause bots with failed payments
        if (shouldAutoPauseBot(bot)) {
          console.log(`[Bot Lifecycle] Auto-pausing bot ${bot.id} (${bot.botName}) due to payment failure`);
          await storage.updateArbitrageBot(bot.id, {
            active: false,
            inactiveSince: new Date(),
          });
        }
        
        // Task 2: Delete non-included bots inactive for 30+ days
        if (shouldDeleteBot(bot)) {
          console.log(`[Bot Lifecycle] Deleting bot ${bot.id} (${bot.botName}) - inactive for 30+ days`);
          await storage.deleteArbitrageBot(bot.id);
        }
      }
      
      console.log("[Bot Lifecycle] Lifecycle checks complete");
    } catch (error) {
      console.error("[Bot Lifecycle] Error running lifecycle tasks:", error);
    }
  }

  /**
   * Manually trigger lifecycle tasks (useful for testing)
   */
  async runNow() {
    await this.runLifecycleTasks();
  }
}

// Export singleton instance
export const botLifecycleManager = new BotLifecycleManager();
