import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { Hono } from "hono";
import { renderer } from "./renderer";

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

  console.log(prisma.url.findMany());

  return next();
});

app.use(renderer);

app.get("/", async (c) => {
  return c.render(<h1>Hello!</h1>);
});

export default app;
