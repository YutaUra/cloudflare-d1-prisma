import { PrismaClient } from "@prisma/client";
import { PrismaD1 } from "@prisma/adapter-d1";
import { Hono } from "hono";
import { renderer } from "./renderer";
import z from "zod";
import { zValidator } from "@hono/zod-validator";
import { nanoid } from "nanoid/non-secure";

interface Env {
  Bindings: {
    DB: D1Database;
    SHORT_URL_ORIGIN: string;
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
    const form = c.req.valid("form");
    const id = nanoid(8);
    const prisma = c.get("prisma");

    await prisma.url.create({
      data: {
        slug: id,
        url: form.url,
      },
    });

    const shortUrl = `${c.env.SHORT_URL_ORIGIN}/${id}`;

    return c.render(
      <div>
        <h1>Hello!</h1>

        <p>URL: {shortUrl}</p>

        <form method="post">
          <input type="url" name="url" required />
          <button type="submit">Submit</button>
        </form>
      </div>
    );
  }
);

app.get("/:slug", async (c) => {
  const slug = c.req.param("slug");
  const prisma = c.get("prisma");

  const url = await prisma.url.findUnique({
    where: {
      slug,
    },
  });

  if (!url) {
    c.status(404);
    return c.render(<div>Not found</div>);
  }

  return c.redirect(url.url);
});

export default app;
