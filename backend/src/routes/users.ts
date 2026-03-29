import { FastifyInstance } from "fastify";
import { usersTable } from "../lib/airtable";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/users", async (request, reply) => {
    const { address, firstname, lastname, email, countryCode, phone } = request.body as any;

    if (!address) {
      return reply.status(400).send({
        success: false,
        error: "Address is required"
      });
    }

    try {
      // Buscar si ya existe un usuario con el mismo address
      const existingUsers = await usersTable
        .select({
          filterByFormula: `{address} = "${address}"`,
          maxRecords: 1,
        })
        .firstPage();

      if (existingUsers.length > 0) {
        return reply.status(409).send({
          success: false,
          error: "User already exists"
        });
      }

      // Crear nuevo usuario
      const created = await usersTable.create([
        {
          fields: {
            address,
            firstname,
            lastname,
            email,
            countryCode,
            phone,
          },
        },
      ]);

      return reply.send({
        success: true,
        data: { id: created[0].id },
        message: "User created"
      });
    } catch (error) {
      console.error("Error creating user:", error);
      return reply.status(500).send({
        success: false,
        error: "Failed to create user"
      });
    }
  });

  app.get("/users/:address", async (request, reply) => {
    const { address } = request.params as { address: string };

    if (!address) {
      return reply.status(400).send({
        success: false,
        error: "Address is required"
      });
    }

    try {
      const users = await usersTable
        .select({
          filterByFormula: `{address} = "${address}"`,
          maxRecords: 1,
        })
        .firstPage();

      const exists = users.length > 0;

      return reply.send({
        success: exists ? true : false,
        message: exists ? "User exists" : "User not found",
        recordId: exists ? users[0].id : null,
        firstname: exists ? users[0].fields.firstname : null,
        lastname: exists ? users[0].fields.lastname : null
      });
    } catch (error) {
      console.error("Error checking user existence:", error);
      return reply.status(500).send({
        success: false,
        error: "Failed to check user"
      });
    }
  });
}
