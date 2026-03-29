import { FastifyInstance } from "fastify";
import { tradesTable, usersTable } from "../lib/airtable";

export async function tradesRoutes(app: FastifyInstance) {

    // Helper function to validate record ID
    const isValidRecordId = (value: any): value is string => {
        return typeof value === "string";
    };

    app.post("/trades", async (request, reply) => {
        try {
            const body = request.body as any;
        
            const fields = {
            tradeId: body.tradeId,
            eventName: body.eventName,
            eventCity: body.eventCity,
            eventCountry: body.eventCountry,
            eventDate: body.eventDate,
            eventSection: body.eventSection,
            numberOfTickets: body.numberOfTickets,
            pricePerTicket: body.pricePerTicket,
            ticketPlatform: body.ticketPlatform,
            lastUpdatedBy: [body.lastUpdatedBy], 
            seller: [body.seller], 
            isTransferable: body.isTransferable
            };
        
            const created = await tradesTable.create([{ fields }]);
        
            return reply.send({ tradeId: body.tradeId, status: body.status });
        } catch (error) {
            console.error("Error creating trade:", error);
            return reply.status(500).send({ success: false, error: "Failed to create trade" });
        }
        });
    

    app.patch("/trades/:tradeId", async (request, reply) => {
        const { tradeId } = request.params as { tradeId: string };
        const updates = request.body as Record<string, any>;
        
        const ADMIN_WALLETS = [process.env.ADMIN_WALLET?.toLowerCase()];
        
        // Protect dispute resolution from unauthorized updates
        if (
            updates.disputeStatus === "Resolved" &&
            (!updates.lastUpdatedBy || !ADMIN_WALLETS.includes(updates.lastUpdatedBy.toLowerCase()))
        ) {
            return reply.status(403).send({ error: "Unauthorized admin wallet" });
        }
        
        // Allow only specific fields to be updated
        const allowedFields = new Set([
            "status",
            "paidAt",
            "sentAt",
            "confirmedAt",
            "refundedAt",
            "disputedAt",
            "disputeStatus",
            "lastUpdatedBy",
            "notes",
            "buyer",
            "paymentClaimed",
            "paymentClaimedAt",
        ]);
        
        // Build filtered update payload
        const filteredUpdates: Record<string, any> = {};
        for (const key in updates) {
            if (allowedFields.has(key)) {
            filteredUpdates[key] = ["lastUpdatedBy", "buyer"].includes(key)
                ? [updates[key]] // Airtable expects arrays for linked record fields
                : updates[key];
            }
        }
        
        try {
            const records = await tradesTable
            .select({
                filterByFormula: `{tradeId} = "${tradeId}"`,
                maxRecords: 1,
            })
            .firstPage();
        
            if (records.length === 0) {
            return reply.status(404).send({ error: "Trade not found" });
            }
        
            const record = records[0];
            const recordId = record.id;
        
            // If buyer is being set, validate it's not already assigned
            if (filteredUpdates.buyer) {
            const existingBuyer = record.get("buyer");
            if (Array.isArray(existingBuyer) && existingBuyer.length > 0) {
                return reply.status(400).send({ error: "Trade already has a buyer" });
            }
        
            // Ensure buyer is the same as the connected wallet
            if (!updates.lastUpdatedBy || updates.buyer !== updates.lastUpdatedBy) {
                return reply.status(403).send({ error: "Unauthorized buyer assignment" });
            }
            }
        
            await tradesTable.update(recordId, filteredUpdates);
        
            return reply.send({ tradeId, updatedFields: filteredUpdates });
        } catch (error) {
            console.error("Error updating trade:", error);
            return reply.status(500).send({ error: "Failed to update trade" });
        }
    });
          
        
  
    // Updated endpoint
    app.get("/trades/:tradeId", async (request, reply) => {
        const { tradeId } = request.params as { tradeId: string };
    
        try {
        const records = await tradesTable
            .select({
            filterByFormula: `{tradeId} = "${tradeId}"`,
            maxRecords: 1,
            })
            .firstPage();
    
        if (records.length === 0) {
            return reply.status(404).send({ error: "Trade not found" });
        }
    
        const trade = records[0].fields;
    
        const getUserInfo = async (userRef: any) => {
            const recordId = Array.isArray(userRef) ? userRef[0] : userRef;
          
            if (typeof recordId !== "string") return null;
          
            try {
              const user = await usersTable.find(recordId);
              const { address, firstname, lastname, email, countryCode, phone } = user.fields;
              const phoneNumber = countryCode + "" + phone;
              return { address, firstname, lastname, email, phoneNumber };
            } catch (e) {
              console.error("Error finding user by ID:", recordId, e);
              return null;
            }
        };

        console.log("trade.buyer:", trade.buyer);
        console.log("trade.seller:", trade.seller);

    
        const buyerInfo = await getUserInfo(trade.buyer);
        const sellerInfo = await getUserInfo(trade.seller);
    
        return reply.send({
            tradeId,
            ...trade,
            buyerInfo,
            sellerInfo,
        });
        } catch (error) {
        console.error("Error fetching trade:", error);
        return reply.status(500).send({ error: "Failed to fetch trade" });
        }
    });
  
    app.get("/wallet/:walletAddress/trades", async (request, reply) => {
        const { walletAddress } = request.params as { walletAddress: string };
      
        try {
          // 1. Look up the user record by wallet address
          const users = await usersTable
            .select({
              filterByFormula: `{address} = "${walletAddress}"`,
              maxRecords: 1,
            })
            .firstPage();
      
          if (users.length === 0) {
            return reply.send([]); // Usuario nuevo sin trades
          }
      
          const userRecordId = users[0].id;
      
          // 2. Fetch trades where user is either buyer or seller
          const tradeRecords = await tradesTable
            .select({
              filterByFormula: `OR({buyer} = '${walletAddress}', {seller} = '${walletAddress}')`,
              sort: [{ field: "createdAt", direction: "desc" }],
            })
            .all();
      
          // 3. Collect all unique buyer and seller record IDs
          const userIds = new Set<string>();
          tradeRecords.forEach((trade) => {
            const buyer = trade.get("buyer") as string[] | undefined;
            const seller = trade.get("seller") as string[] | undefined;
            if (buyer && buyer[0]) userIds.add(buyer[0]);
            if (seller && seller[0]) userIds.add(seller[0]);
          });
      
          // 4. Fetch user details for all those IDs
          const userInfos = await usersTable
            .select({
              filterByFormula: `OR(${[...userIds].map(id => `RECORD_ID() = '${id}'`).join(",")})`,
            })
            .all();
      
          // 5. Create a map from record ID to user info
          const userMap = new Map<string, any>();
          userInfos.forEach((user) => {
            userMap.set(user.id, {
              address: user.get("address"),
              firstname: user.get("firstname"),
              lastname: user.get("lastname"),
            });
          });
      
          // 6. Attach buyerInfo and sellerInfo to each trade
          const trades = tradeRecords.map((record) => {
            const buyerId = (record.get("buyer") as string[] | undefined)?.[0];
            const sellerId = (record.get("seller") as string[] | undefined)?.[0];
      
            return {
              id: record.id,
              tradeId: record.get("tradeId"),
              status: record.get("status"),
              ...record.fields,
              buyerInfo: buyerId ? userMap.get(buyerId) : null,
              sellerInfo: sellerId ? userMap.get(sellerId) : null,
            };
          });
      
          return reply.send(trades);
        } catch (error) {
          console.error("Error fetching wallet trades:", error);
          return reply.status(500).send({ error: "Failed to fetch wallet trades" });
        }
    });
      
      
    app.get("/trades", async (request, reply) => {
        const { status, wallet, page = 1, limit = 20 } = request.query as {
          status?: string;
          wallet?: string;
          page?: number;
          limit?: number;
        };
      
        try {
          let filterFormulaParts: string[] = [];
      
          // Buscar ID del usuario si se pasa wallet
          let userRecordId: string | undefined = undefined;
      
          if (wallet) {
            const users = await usersTable
              .select({
                filterByFormula: `{address} = "${wallet}"`,
                maxRecords: 1,
              })
              .firstPage();
      
            if (users.length > 0) {
              userRecordId = users[0].id;
              filterFormulaParts.push(`OR(FIND("${userRecordId}", ARRAYJOIN({buyer}, ",")), FIND("${userRecordId}", ARRAYJOIN({seller}, ",")))`);
            }
          }
      
          if (status) {
            filterFormulaParts.push(`{status} = "${status}"`);
          }
      
          const formula =
            filterFormulaParts.length === 1
              ? filterFormulaParts[0]
              : filterFormulaParts.length > 1
              ? `AND(${filterFormulaParts.join(",")})`
              : undefined;
      
          const records = await tradesTable
            .select({
              filterByFormula: formula,
              pageSize: limit,
            })
            .all();
      
          const paginated = records.slice((page - 1) * limit, page * limit);
      
          return reply.send(paginated.map((record) => ({ id: record.id, ...record.fields })));
        } catch (error) {
          console.error("Error fetching trades:", error);
          return reply.status(500).send({ error: "Failed to fetch trades" });
        }
    });
      

    app.get("/ping", async (_, reply) => {
    reply.send({ status: "ok", timestamp: Date.now() });
    });

}
