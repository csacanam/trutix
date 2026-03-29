import { FastifyInstance } from "fastify";
import { tradesTable } from "../src/lib/airtable";
import { ethers } from "ethers";
import TradeEscrowAbi from "../src/abis/TradeEscrow.json";

export async function registerAutomationScript(app: FastifyInstance) {
  app.get("/run-expiration-check", async (_, reply) => {
    try {
      const provider = new ethers.JsonRpcProvider(process.env.BASE_RPC_URL);
      const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

      const escrowAddress = process.env.TRADE_ESCROW_ADDRESS!;
      const escrow = new ethers.Contract(escrowAddress, TradeEscrowAbi.abi, wallet);

      const now = Date.now();
      const twelveHours = 12 * 60 * 60 * 1000;

      const airtableRecords = await tradesTable
        .select({
          filterByFormula: `OR({status} = "Paid", {status} = "Sent")`,
        })
        .all();

        const tradeIdsToCheck = airtableRecords
        .filter((record) => {
            const isPaid = record.fields.status === "Paid";
            const rawTimestamp = isPaid ? record.fields.paidAt : record.fields.sentAt;
        
            if (!rawTimestamp) return false; // Skip if no timestamp
        
            const timestamp = Date.parse(rawTimestamp as string);
            return now - timestamp >= twelveHours;
        })
        .map((record) => Number(record.fields.tradeId));
      

      const results = [];

      for (const tradeId of tradeIdsToCheck) {
        try {
          const tx = await escrow.expireTrade(tradeId);
          await tx.wait();

          // Update Airtable record to mark it as expired
          const matchingRecord = airtableRecords.find(
            (r) => Number(r.fields.tradeId) === tradeId
          );

          if (matchingRecord) {
            await tradesTable.update(matchingRecord.id, {
              status: "Expired",
              lastUpdateBy: wallet.address,
            });
          }

          results.push({ tradeId, success: true });
        } catch (err) {
          console.error(`Failed to expire trade ${tradeId}:`, err);
          results.push({ tradeId, success: false });
        }
      }

      return reply.send({ processed: results.length, results });
    } catch (error) {
      console.error("Script error:", error);
      return reply.status(500).send({ error: "Script execution failed" });
    }
  });
}
