import { describe, expect, it } from "vitest";
import { SEED_USERS } from "../../src/database/seed/data.js";
import { assertSeedAllowed, runSeed } from "../../src/database/seed/seed.js";
import { Collection, Ecopoint, Notification, User } from "../../src/models/index.js";
import { verifyPassword } from "../../src/utils/password.js";
import { useTestDatabase } from "../helpers/test-database.js";

useTestDatabase();

const now = new Date("2026-09-25T12:00:00.000Z");

describe("seed mínimo (20_SEED_DATA, 17_TESTING §118)", () => {
  it("é bloqueado em produção (DEC-034)", async () => {
    expect(() => assertSeedAllowed("production")).toThrow(/produção/);
    await expect(runSeed({ nodeEnv: "production", now })).rejects.toThrow(/produção/);
    expect(await User.countDocuments()).toBe(0);
  });

  it("cria os perfis, o ecoponto, uma coleta por status e notificações", async () => {
    const summary = await runSeed({ nodeEnv: "test", now });

    expect(summary).toEqual({
      users: { ADMIN: 1, CLIENTE_PF: 1, CLIENTE_PJ: 1, COLETOR: 1 },
      ecopoints: 1,
      collections: {
        PENDENTE: 1,
        ACEITA: 1,
        A_CAMINHO: 1,
        RECOLHIDA: 1,
        ENTREGUE_ECOPONTO: 1,
        CONCLUIDA: 1,
      },
      notifications: 8,
    });
  });

  it("gera senhas Argon2id que conferem com as credenciais de desenvolvimento (20_SEED_DATA §34)", async () => {
    await runSeed({ nodeEnv: "test", now });

    for (const seedUser of SEED_USERS) {
      const user = await User.findOne({ email: seedUser.email }).select("+senhaHash").lean();

      expect(user?.senhaHash.startsWith("$argon2id$")).toBe(true);
      await expect(verifyPassword(user!.senhaHash, seedUser.senha)).resolves.toBe(true);
    }
  });

  it("gera históricos coerentes: coletor, ecoponto e timestamps anteriores à execução", async () => {
    await runSeed({ nodeEnv: "test", now });

    const coletor = await User.findOne({ role: "COLETOR" });
    const ecopoint = await Ecopoint.findOne();
    const pendente = await Collection.findOne({ status: "PENDENTE" });
    const concluida = await Collection.findOne({ status: "CONCLUIDA" });

    expect(pendente?.coletorId).toBeNull();
    expect(pendente?.acceptedAt).toBeNull();
    expect(concluida?.coletorId?.equals(coletor!._id)).toBe(true);
    expect(concluida?.ecopontoId?.equals(ecopoint!._id)).toBe(true);
    expect(concluida!.completedAt!.getTime()).toBeLessThanOrEqual(now.getTime());
    expect(concluida!.createdAt.getTime()).toBeLessThan(concluida!.acceptedAt!.getTime());
  });

  it("mantém coleta PENDENTE disponível para o teste de concorrência (20_SEED_DATA §23)", async () => {
    await runSeed({ nodeEnv: "test", now });

    expect(await Collection.countDocuments({ status: "PENDENTE", coletorId: null })).toBeGreaterThanOrEqual(1);
  });

  it("cria notificações lidas e não lidas referenciando coletas existentes", async () => {
    await runSeed({ nodeEnv: "test", now });

    const notifications = await Notification.find();
    const collectionIds = new Set((await Collection.find()).map((item) => String(item._id)));

    expect(notifications.some((item) => item.lida)).toBe(true);
    expect(notifications.some((item) => !item.lida)).toBe(true);
    for (const notification of notifications) {
      expect(collectionIds.has(String(notification.referencia?.id))).toBe(true);
    }
  });

  it("é reproduzível: executar novamente recria o mesmo conjunto sem duplicar", async () => {
    await runSeed({ nodeEnv: "test", now });
    const summary = await runSeed({ nodeEnv: "test", now });

    expect(await User.countDocuments()).toBe(4);
    expect(await Collection.countDocuments()).toBe(6);
    expect(summary.notifications).toBe(8);
  });
});
