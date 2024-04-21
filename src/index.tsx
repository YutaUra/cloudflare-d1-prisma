import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { Hono } from "hono";
import { renderer } from "./renderer";
import z from "zod";
import { zValidator } from "@hono/zod-validator";

interface Env {
  Bindings: {
    DB: D1Database;
  };
  Variables: {
    prisma: PrismaClient;
  };
}

const app = new Hono<Env>();

app.use(async (c, next) => {
  const adapter = new PrismaD1(c.env.DB);
  const prisma = new PrismaClient({ adapter });
  c.set("prisma", prisma);

  return next();
});

app.use(renderer);

app.get("/", async (c) => {
  return c.render(
    <div>
      <h1>Hello!</h1>

      <form method="post">
        <input type="url" name="url" required />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
});

app.post(
  "/",
  zValidator(
    "form",
    z.object({
      url: z.string().url(),
    })
  ),
  async (c) => {
    const { url } = c.req.valid("form");

    console.log({ url });

    return c.render(
      <div>
        <h1>Hello!</h1>

        <p>URL: {url}</p>

        <form method="post">
          <input type="url" name="url" required />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
);

export default app;
