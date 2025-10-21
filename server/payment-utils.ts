import { type ArbitrageBot, type NftPass, PaymentStatus } from "@shared/schema";

/**
 * Monthly fee constants
 */
export const MONTHLY_FEE_SOL = 0.0009; // SOL per additional bot per month
export const TRANSACTION_FEE_PERCENT = 0.005; // 0.5% taker fee

/**
 * Calculate monthly fee for an arbitrage bot
 * @param bot The arbitrage bot
 * @param activePasses Active NFT passes for the wallet
 * @returns Monthly fee in SOL (0 if included bot or waived by pass)
 */
export function calculateBotMonthlyFee(
  bot: ArbitrageBot,
  activePasses: NftPass[]
): number {
  // First 2 bots are included - no monthly fee
  if (bot.isIncludedBot) {
    return 0;
  }

  // Check if fee is waived by any active pass
  const hasFeeWaiverPass = activePasses.some(
    (pass) => pass.benefitType === "fee_waiver" && pass.isActive
  );

  if (hasFeeWaiverPass) {
    return 0;
  }

  // Additional bots (3-5) require monthly fee if active
  return bot.active ? MONTHLY_FEE_SOL : 0;
}

/**
 * Calculate transaction fee (0.5% taker fee)
 * @param amount Transaction amount in SOL
 * @param activePasses Active NFT passes for the wallet
 * @returns Transaction fee in SOL (0 if waived by pass)
 */
export function calculateTransactionFee(
  amount: number,
  activePasses: NftPass[]
): number {
  // Check if fee is waived by any active pass
  const hasFeeWaiverPass = activePasses.some(
    (pass) => pass.benefitType === "fee_waiver" && pass.isActive
  );

  if (hasFeeWaiverPass) {
    return 0;
  }

  return amount * TRANSACTION_FEE_PERCENT;
}

/**
 * Get total number of free bot slots for a wallet
 * @param activePasses Active NFT passes for the wallet
 * @returns Total number of free additional bot slots (beyond the 2 included)
 */
export function getFreeBotSlots(activePasses: NftPass[]): number {
  return activePasses
    .filter((pass) => pass.benefitType === "free_bot_slot")
    .reduce((total, pass) => total + (pass.freeBotSlots || 0), 0);
}

/**
 * Check if a pass is currently valid
 * @param pass The NFT pass
 * @returns True if pass is active and not expired
 */
export function isPassValid(pass: NftPass): boolean {
  if (!pass.isActive) {
    return false;
  }

  if (pass.expiresAt === null) {
    return true; // Permanent pass
  }

  return new Date(pass.expiresAt) > new Date();
}

/**
 * Calculate next payment due date (1st of next month)
 * @param fromDate Starting date (defaults to now)
 * @returns Date of next payment (1st of next month)
 */
export function calculateNextPaymentDue(fromDate: Date = new Date()): Date {
  const nextMonth = new Date(fromDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(1);
  nextMonth.setHours(0, 0, 0, 0);
  return nextMonth;
}

/**
 * Check if a bot should be auto-paused due to payment failure
 * @param bot The arbitrage bot
 * @returns True if bot should be paused
 */
export function shouldAutoPauseBot(bot: ArbitrageBot): boolean {
  return bot.paymentStatus === PaymentStatus.FAILED && bot.active;
}

/**
 * Check if a bot should be deleted (inactive for 30+ days, not an included bot)
 * @param bot The arbitrage bot
 * @returns True if bot should be deleted
 */
export function shouldDeleteBot(bot: ArbitrageBot): boolean {
  if (bot.isIncludedBot) {
    return false; // Included bots can remain inactive indefinitely
  }

  if (!bot.inactiveSince) {
    return false; // Bot has never been inactive
  }

  const daysSinceInactive =
    (new Date().getTime() - new Date(bot.inactiveSince).getTime()) /
    (1000 * 60 * 60 * 24);

  return daysSinceInactive >= 30;
}

/**
 * Calculate total monthly cost for all active bots
 * @param bots Array of arbitrage bots
 * @param activePasses Active NFT passes for the wallet
 * @returns Total monthly cost in SOL
 */
export function calculateTotalMonthlyCost(
  bots: ArbitrageBot[],
  activePasses: NftPass[]
): number {
  return bots.reduce((total, bot) => {
    return total + calculateBotMonthlyFee(bot, activePasses);
  }, 0);
}

/**
 * Get payment status summary for a wallet
 * @param bots Array of arbitrage bots
 * @param activePasses Active NFT passes for the wallet
 * @returns Payment summary
 */
export function getPaymentSummary(bots: ArbitrageBot[], activePasses: NftPass[]) {
  const activeBots = bots.filter((b) => b.active);
  const includedBots = activeBots.filter((b) => b.isIncludedBot);
  const additionalBots = activeBots.filter((b) => !b.isIncludedBot);
  const totalMonthlyCost = calculateTotalMonthlyCost(bots, activePasses);
  const hasFeeWaiver = activePasses.some((p) => p.benefitType === "fee_waiver");

  return {
    totalBots: bots.length,
    activeBots: activeBots.length,
    includedBots: includedBots.length,
    additionalBots: additionalBots.length,
    monthlyCostSOL: totalMonthlyCost,
    hasFeeWaiver,
    nextPaymentDue: calculateNextPaymentDue(),
  };
}
