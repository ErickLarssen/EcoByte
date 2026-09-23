# 08 — MONGO QUERIES

## 1. Objetivo

Este documento reúne consultas e operações MongoDB relevantes para o EcoByte.

O objetivo é servir como referência para:

- desenvolvimento do backend;
- testes;
- demonstração acadêmica;
- relatórios;
- consultas administrativas;
- validação do modelo documental;
- consultas geoespaciais;
- operações de manutenção e desenvolvimento.

As consultas devem permanecer alinhadas com:

```text
docs/02_DOMAIN_MODEL.md
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/06_API.md
docs/07_DATABASE_MONGODB.md
```

Os exemplos abaixo utilizam sintaxe compatível com:

```text
mongosh
```

e podem ser adaptados aos models do Mongoose quando necessário.

---

# 2. Banco de dados

Exemplo de seleção do banco:

```javascript
use ecobyte
```

Verificar banco atual:

```javascript
db.getName()
```

Listar bancos:

```javascript
show dbs
```

Listar coleções:

```javascript
show collections
```

---

# 3. Consultas básicas

## 3.1 Listar documentos

```javascript
db.users.find()
```

---

## 3.2 Listar documentos formatados

```javascript
db.users.find().pretty()
```

---

## 3.3 Buscar um documento

```javascript
db.users.findOne()
```

---

## 3.4 Buscar por campo

```javascript
db.users.find({
  role: "CLIENTE"
})
```

---

## 3.5 Buscar um usuário específico

```javascript
db.users.findOne({
  email: "usuario@email.com"
})
```

---

# 4. Projeção

## 4.1 Retornar somente alguns campos

```javascript
db.users.find(
  {
    role: "CLIENTE"
  },
  {
    nome: 1,
    email: 1,
    role: 1
  }
)
```

---

## 4.2 Excluir campos específicos

```javascript
db.users.find(
  {},
  {
    senha_hash: 0
  }
)
```

Nunca retornar `senha_hash` para o frontend.

---

# 5. Consultas em `users`

## 5.1 Buscar clientes

```javascript
db.users.find({
  role: "CLIENTE"
})
```

---

## 5.2 Buscar coletores

```javascript
db.users.find({
  role: "COLETOR"
})
```

---

## 5.3 Buscar administradores

```javascript
db.users.find({
  role: "ADMIN"
})
```

---

## 5.4 Buscar usuários ativos

```javascript
db.users.find({
  status: "ATIVO"
})
```

---

## 5.5 Buscar usuários inativos

```javascript
db.users.find({
  status: "INATIVO"
})
```

---

## 5.6 Buscar clientes PF

```javascript
db.users.find({
  role: "CLIENTE",
  tipo_cadastro: "PF"
})
```

---

## 5.7 Buscar clientes PJ

```javascript
db.users.find({
  role: "CLIENTE",
  tipo_cadastro: "PJ"
})
```

---

## 5.8 Buscar e-mail específico

```javascript
db.users.findOne({
  email: "usuario@email.com"
})
```

---

## 5.9 Verificar existência de e-mail

```javascript
db.users.countDocuments({
  email: "usuario@email.com"
})
```

Resultado esperado:

```text
0 → não encontrado
1 → encontrado
```

Como o e-mail deve possuir índice único, não devem existir múltiplos documentos válidos com o mesmo e-mail.

---

# 6. Consultas com operadores

## 6.1 `$in`

Buscar clientes PF ou PJ:

```javascript
db.users.find({
  tipo_cadastro: {
    $in: ["PF", "PJ"]
  }
})
```

---

## 6.2 `$nin`

Buscar usuários que não sejam administradores:

```javascript
db.users.find({
  role: {
    $nin: ["ADMIN"]
  }
})
```

---

## 6.3 `$ne`

Buscar usuários que não estão inativos:

```javascript
db.users.find({
  status: {
    $ne: "INATIVO"
  }
})
```

---

## 6.4 `$exists`

Buscar documentos que possuem dados empresariais:

```javascript
db.users.find({
  dados_empresa: {
    $exists: true
  }
})
```

---

## 6.5 `$regex`

Buscar usuários cujo nome contenha determinado texto:

```javascript
db.users.find({
  nome: {
    $regex: "silva",
    $options: "i"
  }
})
```

Usar regex com cuidado em bases grandes, principalmente sem índices adequados.

---

# 7. Atualização de usuários

## 7.1 Atualizar telefone

```javascript
db.users.updateOne(
  {
    email: "usuario@email.com"
  },
  {
    $set: {
      telefone: "11999999999",
      updatedAt: new Date()
    }
  }
)
```

---

## 7.2 Inativar usuário

```javascript
db.users.updateOne(
  {
    _id: ObjectId("USER_ID")
  },
  {
    $set: {
      status: "INATIVO",
      updatedAt: new Date()
    }
  }
)
```

---

## 7.3 Reativar usuário

```javascript
db.users.updateOne(
  {
    _id: ObjectId("USER_ID")
  },
  {
    $set: {
      status: "ATIVO",
      updatedAt: new Date()
    }
  }
)
```

---

## 7.4 Atualização em vários documentos

Exemplo de manutenção:

```javascript
db.users.updateMany(
  {
    role: "CLIENTE",
    status: {
      $exists: false
    }
  },
  {
    $set: {
      status: "ATIVO"
    }
  }
)
```

Operações desse tipo devem ser executadas somente quando houver necessidade documentada.

---

# 8. Contagem de usuários

## 8.1 Total de usuários

```javascript
db.users.countDocuments()
```

---

## 8.2 Total de clientes

```javascript
db.users.countDocuments({
  role: "CLIENTE"
})
```

---

## 8.3 Total de coletores

```javascript
db.users.countDocuments({
  role: "COLETOR"
})
```

---

## 8.4 Total de usuários ativos

```javascript
db.users.countDocuments({
  status: "ATIVO"
})
```

---

# 9. Consultas em `collections`

## 9.1 Listar todas as coletas

```javascript
db.collections.find()
```

---

## 9.2 Buscar uma coleta

```javascript
db.collections.findOne({
  _id: ObjectId("COLLECTION_ID")
})
```

---

## 9.3 Buscar coletas pendentes

```javascript
db.collections.find({
  status: "PENDENTE"
})
```

---

## 9.4 Buscar coletas aceitas

```javascript
db.collections.find({
  status: "ACEITA"
})
```

---

## 9.5 Buscar coletas em andamento

```javascript
db.collections.find({
  status: "A_CAMINHO"
})
```

---

## 9.6 Buscar coletas recolhidas

```javascript
db.collections.find({
  status: "RECOLHIDA"
})
```

---

## 9.7 Buscar coletas entregues

```javascript
db.collections.find({
  status: "ENTREGUE_ECOPONTO"
})
```

---

## 9.8 Buscar coletas concluídas

```javascript
db.collections.find({
  status: "CONCLUIDA"
})
```

---

# 10. Buscar coletas por cliente

```javascript
db.collections.find({
  usuarioId: ObjectId("USER_ID")
})
```

---

# 11. Buscar coletas por coletor

```javascript
db.collections.find({
  coletorId: ObjectId("COLLECTOR_ID")
})
```

---

# 12. Buscar coletas por cliente e status

```javascript
db.collections.find({
  usuarioId: ObjectId("USER_ID"),
  status: "CONCLUIDA"
})
```

---

# 13. Buscar coletas por coletor e status

```javascript
db.collections.find({
  coletorId: ObjectId("COLLECTOR_ID"),
  status: {
    $in: [
      "ACEITA",
      "A_CAMINHO",
      "RECOLHIDA"
    ]
  }
})
```

---

# 14. Ordenação

## 14.1 Mais recentes primeiro

```javascript
db.collections.find().sort({
  createdAt: -1
})
```

---

## 14.2 Mais antigas primeiro

```javascript
db.collections.find().sort({
  createdAt: 1
})
```

---

# 15. Paginação

Exemplo:

```javascript
const page = 1
const limit = 20
const skip = (page - 1) * limit

db.collections
  .find()
  .sort({ createdAt: -1 })
  .skip(skip)
  .limit(limit)
```

---

# 16. Consultas por data

## 16.1 Coletas depois de uma data

```javascript
db.collections.find({
  createdAt: {
    $gte: ISODate("2026-10-01T00:00:00.000Z")
  }
})
```

---

## 16.2 Coletas entre duas datas

```javascript
db.collections.find({
  createdAt: {
    $gte: ISODate("2026-10-01T00:00:00.000Z"),
    $lt: ISODate("2026-11-01T00:00:00.000Z")
  }
})
```

---

## 16.3 Coletas concluídas em determinado período

```javascript
db.collections.find({
  status: "CONCLUIDA",
  completedAt: {
    $gte: ISODate("2026-10-01T00:00:00.000Z"),
    $lt: ISODate("2026-11-01T00:00:00.000Z")
  }
})
```

---

# 17. Consultas de agendamento

Buscar coletas agendadas para determinado período:

```javascript
db.collections.find({
  dataAgendada: {
    $gte: ISODate("2026-10-01T00:00:00.000Z"),
    $lt: ISODate("2026-10-02T00:00:00.000Z")
  }
})
```

---

# 18. Consultar quantidade de itens

Como `itensDescarte` é um array, é possível filtrar documentos que possuam itens:

```javascript
db.collections.find({
  "itensDescarte.0": {
    $exists: true
  }
})
```

Isso pode ser utilizado como uma validação complementar, embora a aplicação deva impedir a criação de coletas sem itens.

---

# 19. Consultas por categoria de descarte

## 19.1 Buscar coletas que possuem determinada categoria

```javascript
db.collections.find({
  "itensDescarte.categoria": "NOTEBOOK"
})
```

---

## 19.2 Buscar coletas que possuem celular

```javascript
db.collections.find({
  "itensDescarte.categoria": "CELULAR"
})
```

As categorias acima são exemplos.

As categorias oficiais devem seguir as definições do projeto.

---

# 20. Consultas por condição

Exemplo:

```javascript
db.collections.find({
  "itensDescarte.condicao": "DANIFICADO"
})
```

A condição deve utilizar somente valores definidos pelo domínio implementado.

---

# 21. Quantidade de itens

Buscar itens com quantidade superior a 5:

```javascript
db.collections.find({
  "itensDescarte.quantidade": {
    $gt: 5
  }
})
```

Buscar itens com quantidade entre 2 e 10:

```javascript
db.collections.find({
  "itensDescarte.quantidade": {
    $gte: 2,
    $lte: 10
  }
})
```

---

# 22. Consultas por localização

Os campos geográficos seguem GeoJSON:

```json
{
  "type": "Point",
  "coordinates": [
    -46.62,
    -23.68
  ]
}
```

A ordem é:

```text
[longitude, latitude]
```

---

# 23. `$near`

Buscar coletas próximas a uma coordenada:

```javascript
db.collections.find({
  "enderecoColeta.localizacao": {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [
          -46.62,
          -23.68
        ]
      },
      $maxDistance: 5000
    }
  }
})
```

O valor:

```text
5000
```

representa aproximadamente:

```text
5 km
```

quando utilizado com coordenadas geográficas em metros.

O campo deve possuir índice `2dsphere`.

---

# 24. `$geoNear`

Para consultas geoespaciais em aggregation:

```javascript
db.collections.aggregate([
  {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [
          -46.62,
          -23.68
        ]
      },
      key: "enderecoColeta.localizacao",
      distanceField: "distanciaMetros",
      spherical: true,
      maxDistance: 5000
    }
  }
])
```

---

# 25. Índices

## 25.1 Índice único de e-mail

```javascript
db.users.createIndex(
  {
    email: 1
  },
  {
    unique: true
  }
)
```

---

## 25.2 Índice de status de coleta

```javascript
db.collections.createIndex({
  status: 1
})
```

---

## 25.3 Índice por usuário

```javascript
db.collections.createIndex({
  usuarioId: 1
})
```

---

## 25.4 Índice por coletor

```javascript
db.collections.createIndex({
  coletorId: 1
})
```

---

## 25.5 Índice por data

```javascript
db.collections.createIndex({
  createdAt: -1
})
```

---

## 25.6 Índice geoespacial das coletas

```javascript
db.collections.createIndex({
  "enderecoColeta.localizacao": "2dsphere"
})
```

---

## 25.7 Índice geoespacial do ecoponto

```javascript
db.ecopoints.createIndex({
  localizacao: "2dsphere"
})
```

---

## 25.8 Índices de notificações

```javascript
db.notifications.createIndex({
  usuarioId: 1,
  createdAt: -1
})
```

---

# 26. Verificar índices

```javascript
db.users.getIndexes()
```

```javascript
db.collections.getIndexes()
```

```javascript
db.ecopoints.getIndexes()
```

```javascript
db.notifications.getIndexes()
```

---

# 27. Atualizações de coleta

## 27.1 Atualizar observação

```javascript
db.collections.updateOne(
  {
    _id: ObjectId("COLLECTION_ID")
  },
  {
    $set: {
      observacoes: "Nova observação.",
      updatedAt: new Date()
    }
  }
)
```

---

# 28. Aceitação atômica de coleta

A aceitação da coleta deve verificar o estado atual antes de alterar o documento.

Consulta conceitual:

```javascript
db.collections.findOneAndUpdate(
  {
    _id: ObjectId("COLLECTION_ID"),
    status: "PENDENTE"
  },
  {
    $set: {
      status: "ACEITA",
      coletorId: ObjectId("COLLECTOR_ID"),
      acceptedAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    returnDocument: "after"
  }
)
```

Esse padrão é importante para evitar que dois coletores assumam a mesma coleta simultaneamente.

Se nenhuma coleta for encontrada com:

```text
status = PENDENTE
```

a operação deve ser tratada pelo backend como conflito ou recurso indisponível, conforme o fluxo da API.

---

# 29. Iniciar coleta

Atualização conceitual:

```javascript
db.collections.findOneAndUpdate(
  {
    _id: ObjectId("COLLECTION_ID"),
    coletorId: ObjectId("COLLECTOR_ID"),
    status: "ACEITA"
  },
  {
    $set: {
      status: "A_CAMINHO",
      startedAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    returnDocument: "after"
  }
)
```

---

# 30. Confirmar recolhimento

```javascript
db.collections.findOneAndUpdate(
  {
    _id: ObjectId("COLLECTION_ID"),
    coletorId: ObjectId("COLLECTOR_ID"),
    status: "A_CAMINHO"
  },
  {
    $set: {
      status: "RECOLHIDA",
      collectedAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    returnDocument: "after"
  }
)
```

---

# 31. Confirmar entrega

```javascript
db.collections.findOneAndUpdate(
  {
    _id: ObjectId("COLLECTION_ID"),
    coletorId: ObjectId("COLLECTOR_ID"),
    status: "RECOLHIDA"
  },
  {
    $set: {
      status: "ENTREGUE_ECOPONTO",
      deliveredAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    returnDocument: "after"
  }
)
```

---

# 32. Concluir coleta

```javascript
db.collections.findOneAndUpdate(
  {
    _id: ObjectId("COLLECTION_ID"),
    coletorId: ObjectId("COLLECTOR_ID"),
    status: "ENTREGUE_ECOPONTO"
  },
  {
    $set: {
      status: "CONCLUIDA",
      completedAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    returnDocument: "after"
  }
)
```

---

# 33. Atualização genérica de status

Se a aplicação utilizar uma rota genérica para alteração de status, o backend deve validar a transição antes da atualização.

Exemplo conceitual:

```javascript
db.collections.findOneAndUpdate(
  {
    _id: ObjectId("COLLECTION_ID"),
    status: "ACEITA",
    coletorId: ObjectId("COLLECTOR_ID")
  },
  {
    $set: {
      status: "A_CAMINHO",
      startedAt: new Date(),
      updatedAt: new Date()
    }
  },
  {
    returnDocument: "after"
  }
)
```

Não utilizar uma atualização genérica sem verificar o estado de origem.

---

# 34. Contagem de coletas por status

Aggregation:

```javascript
db.collections.aggregate([
  {
    $group: {
      _id: "$status",
      total: {
        $sum: 1
      }
    }
  },
  {
    $sort: {
      total: -1
    }
  }
])
```

Resultado conceitual:

```text
PENDENTE            12
ACEITA               5
A_CAMINHO            3
RECOLHIDA            4
ENTREGUE_ECOPONTO    2
CONCLUIDA            20
```

Os números acima são apenas ilustrativos.

---

# 35. Coletas por mês

Aggregation:

```javascript
db.collections.aggregate([
  {
    $group: {
      _id: {
        ano: {
          $year: "$createdAt"
        },
        mes: {
          $month: "$createdAt"
        }
      },
      total: {
        $sum: 1
      }
    }
  },
  {
    $sort: {
      "_id.ano": 1,
      "_id.mes": 1
    }
  }
])
```

---

# 36. Coletas concluídas por mês

```javascript
db.collections.aggregate([
  {
    $match: {
      status: "CONCLUIDA"
    }
  },
  {
    $group: {
      _id: {
        ano: {
          $year: "$completedAt"
        },
        mes: {
          $month: "$completedAt"
        }
      },
      total: {
        $sum: 1
      }
    }
  },
  {
    $sort: {
      "_id.ano": 1,
      "_id.mes": 1
    }
  }
])
```

---

# 37. Quantidade total por categoria

Como os itens estão dentro de arrays, utilizar:

```javascript
$unwind
```

Exemplo:

```javascript
db.collections.aggregate([
  {
    $unwind: "$itensDescarte"
  },
  {
    $group: {
      _id: "$itensDescarte.categoria",
      quantidadeTotal: {
        $sum: "$itensDescarte.quantidade"
      }
    }
  },
  {
    $sort: {
      quantidadeTotal: -1
    }
  }
])
```

---

# 38. Quantidade total por condição

```javascript
db.collections.aggregate([
  {
    $unwind: "$itensDescarte"
  },
  {
    $group: {
      _id: "$itensDescarte.condicao",
      quantidadeTotal: {
        $sum: "$itensDescarte.quantidade"
      }
    }
  },
  {
    $sort: {
      quantidadeTotal: -1
    }
  }
])
```

---

# 39. Número de coletas por cliente

```javascript
db.collections.aggregate([
  {
    $group: {
      _id: "$usuarioId",
      totalColetas: {
        $sum: 1
      }
    }
  },
  {
    $sort: {
      totalColetas: -1
    }
  }
])
```

---

# 40. Número de coletas por coletor

```javascript
db.collections.aggregate([
  {
    $match: {
      coletorId: {
        $ne: null
      }
    }
  },
  {
    $group: {
      _id: "$coletorId",
      totalColetas: {
        $sum: 1
      }
    }
  },
  {
    $sort: {
      totalColetas: -1
    }
  }
])
```

---

# 41. `$lookup` com usuários

Buscar coletas junto com dados do cliente:

```javascript
db.collections.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "usuarioId",
      foreignField: "_id",
      as: "cliente"
    }
  }
])
```

---

# 42. `$lookup` com coletor

```javascript
db.collections.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "coletorId",
      foreignField: "_id",
      as: "coletor"
    }
  }
])
```

---

# 43. `$lookup` completo

Exemplo para consulta administrativa:

```javascript
db.collections.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "usuarioId",
      foreignField: "_id",
      as: "cliente"
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "coletorId",
      foreignField: "_id",
      as: "coletor"
    }
  }
])
```

---

# 44. `$unwind` após `$lookup`

Exemplo:

```javascript
db.collections.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "usuarioId",
      foreignField: "_id",
      as: "cliente"
    }
  },
  {
    $unwind: "$cliente"
  }
])
```

---

# 45. Projeção em relatórios

Evitar retornar dados desnecessários.

Exemplo:

```javascript
db.collections.aggregate([
  {
    $project: {
      _id: 1,
      status: 1,
      usuarioId: 1,
      coletorId: 1,
      dataAgendada: 1,
      createdAt: 1
    }
  }
])
```

---

# 46. Relatório de coletas por status e categoria

Exemplo de aggregation mais completa:

```javascript
db.collections.aggregate([
  {
    $unwind: "$itensDescarte"
  },
  {
    $group: {
      _id: {
        status: "$status",
        categoria: "$itensDescarte.categoria"
      },
      quantidadeTotal: {
        $sum: "$itensDescarte.quantidade"
      }
    }
  },
  {
    $sort: {
      "_id.status": 1,
      quantidadeTotal: -1
    }
  }
])
```

---

# 47. Relatório mensal por categoria

```javascript
db.collections.aggregate([
  {
    $unwind: "$itensDescarte"
  },
  {
    $group: {
      _id: {
        ano: {
          $year: "$createdAt"
        },
        mes: {
          $month: "$createdAt"
        },
        categoria: "$itensDescarte.categoria"
      },
      quantidadeTotal: {
        $sum: "$itensDescarte.quantidade"
      }
    }
  },
  {
    $sort: {
      "_id.ano": 1,
      "_id.mes": 1,
      quantidadeTotal: -1
    }
  }
])
```

---

# 48. `$facet`

Para produzir múltiplas métricas em uma única aggregation:

```javascript
db.collections.aggregate([
  {
    $facet: {
      totalColetas: [
        {
          $count: "total"
        }
      ],
      porStatus: [
        {
          $group: {
            _id: "$status",
            total: {
              $sum: 1
            }
          }
        }
      ],
      porCategoria: [
        {
          $unwind: "$itensDescarte"
        },
        {
          $group: {
            _id: "$itensDescarte.categoria",
            quantidade: {
              $sum: "$itensDescarte.quantidade"
            }
          }
        }
      ]
    }
  }
])
```

---

# 49. Média de tempo entre etapas

Para análises operacionais, datas podem ser comparadas por diferença.

Exemplo conceitual:

```javascript
db.collections.aggregate([
  {
    $match: {
      status: "CONCLUIDA",
      acceptedAt: {
        $ne: null
      },
      completedAt: {
        $ne: null
      }
    }
  },
  {
    $project: {
      tempoTotalMs: {
        $subtract: [
          "$completedAt",
          "$acceptedAt"
        ]
      }
    }
  },
  {
    $group: {
      _id: null,
      tempoMedioMs: {
        $avg: "$tempoTotalMs"
      }
    }
  }
])
```

O resultado pode posteriormente ser convertido para horas ou dias na aplicação.

---

# 50. Consulta de notificações

## 50.1 Notificações de um usuário

```javascript
db.notifications.find({
  usuarioId: ObjectId("USER_ID")
})
```

---

## 50.2 Notificações não lidas

```javascript
db.notifications.find({
  usuarioId: ObjectId("USER_ID"),
  lida: false
})
```

---

## 50.3 Notificações mais recentes

```javascript
db.notifications.find({
  usuarioId: ObjectId("USER_ID")
}).sort({
  createdAt: -1
})
```

---

# 51. Marcar notificação como lida

```javascript
db.notifications.updateOne(
  {
    _id: ObjectId("NOTIFICATION_ID"),
    usuarioId: ObjectId("USER_ID")
  },
  {
    $set: {
      lida: true,
      updatedAt: new Date()
    }
  }
)
```

A condição `usuarioId` é importante para impedir que um usuário altere a notificação de outra pessoa.

---

# 52. Consultas em `ecopoints`

## 52.1 Buscar ecoponto

```javascript
db.ecopoints.findOne()
```

---

## 52.2 Buscar ecoponto ativo

```javascript
db.ecopoints.findOne({
  status: "ATIVO"
})
```

---

## 52.3 Buscar todos os ecopontos ativos

```javascript
db.ecopoints.find({
  status: "ATIVO"
})
```

No MVP, espera-se um único ecoponto central.

---

# 53. Atualização do ecoponto

```javascript
db.ecopoints.updateOne(
  {
    _id: ObjectId("ECOPOINT_ID")
  },
  {
    $set: {
      nome: "EcoByte",
      descricao: "Ecoponto central da EcoByte.",
      updatedAt: new Date()
    }
  }
)
```

---

# 54. Busca geográfica do ecoponto

Exemplo de busca por proximidade:

```javascript
db.ecopoints.find({
  localizacao: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [
          -46.62,
          -23.68
        ]
      },
      $maxDistance: 10000
    }
  }
})
```

---

# 55. Distância do ecoponto

Utilizando aggregation:

```javascript
db.ecopoints.aggregate([
  {
    $geoNear: {
      near: {
        type: "Point",
        coordinates: [
          -46.62,
          -23.68
        ]
      },
      distanceField: "distanciaMetros",
      spherical: true
    }
  }
])
```

---

# 56. Consultar plano de execução

Antes de otimizar uma consulta:

```javascript
db.collections.find({
  status: "PENDENTE"
}).explain("executionStats")
```

O plano pode ajudar a identificar:

- uso de índice;
- documentos examinados;
- tempo de execução;
- eficiência da consulta.

---

# 57. Consultar plano de aggregation

```javascript
db.collections.explain("executionStats").aggregate([
  {
    $match: {
      status: "CONCLUIDA"
    }
  },
  {
    $group: {
      _id: "$status",
      total: {
        $sum: 1
      }
    }
  }
])
```

---

# 58. Consultas combinando filtros

Exemplo:

```javascript
db.collections.find({
  status: "CONCLUIDA",
  createdAt: {
    $gte: ISODate("2026-10-01T00:00:00.000Z"),
    $lt: ISODate("2026-11-01T00:00:00.000Z")
  }
}).sort({
  createdAt: -1
})
```

---

# 59. Consultas com `$or`

Buscar coletas pendentes ou aceitas:

```javascript
db.collections.find({
  $or: [
    {
      status: "PENDENTE"
    },
    {
      status: "ACEITA"
    }
  ]
})
```

---

# 60. Consultas com `$and`

O `$and` explícito normalmente não é necessário para condições simples, mas pode ser utilizado:

```javascript
db.collections.find({
  $and: [
    {
      status: "CONCLUIDA"
    },
    {
      completedAt: {
        $ne: null
      }
    }
  ]
})
```

---

# 61. Consultar documentos sem coletor

```javascript
db.collections.find({
  coletorId: null
})
```

Essa consulta é compatível com o estado:

```text
PENDENTE
```

Quando essa for a convenção adotada para `coletorId`.

---

# 62. Verificar consistência de coletas

Encontrar coletas `PENDENTE` que possuem coletor:

```javascript
db.collections.find({
  status: "PENDENTE",
  coletorId: {
    $ne: null
  }
})
```

Essa consulta pode ser utilizada para identificar possíveis inconsistências.

---

# 63. Verificar coletas concluídas sem timestamp

```javascript
db.collections.find({
  status: "CONCLUIDA",
  completedAt: null
})
```

---

# 64. Verificar coletas aceitas sem coletor

```javascript
db.collections.find({
  status: "ACEITA",
  coletorId: null
})
```

---

# 65. Verificar sequência de timestamps

Exemplo de documentos em que uma coleta foi iniciada antes do aceite:

```javascript
db.collections.find({
  $expr: {
    $and: [
      {
        $ne: [
          "$acceptedAt",
          null
        ]
      },
      {
        $ne: [
          "$startedAt",
          null
        ]
      },
      {
        $lt: [
          "$startedAt",
          "$acceptedAt"
        ]
      }
    ]
  }
})
```

Esse tipo de consulta é útil para auditoria de integridade.

---

# 66. Inserção de documento de desenvolvimento

Exemplo de usuário fictício:

```javascript
db.users.insertOne({
  nome: "Cliente Demo",
  email: "cliente.demo@example.com",
  senha_hash: "HASH_DE_DESENVOLVIMENTO",
  telefone: "11900000000",
  documento: "00000000000",
  role: "CLIENTE",
  tipo_cadastro: "PF",
  dados_empresa: null,
  status: "ATIVO",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

O hash acima é apenas ilustrativo.

Nunca utilizar senha real diretamente no MongoDB.

---

# 67. Inserção de coleta fictícia

```javascript
db.collections.insertOne({
  usuarioId: ObjectId("USER_ID"),
  coletorId: null,
  enderecoColeta: {
    logradouro: "Rua Exemplo",
    numero: "100",
    complemento: "",
    bairro: "Centro",
    cidade: "Diadema",
    estado: "SP",
    cep: "09900000",
    localizacao: {
      type: "Point",
      coordinates: [
        -46.62,
        -23.68
      ]
    }
  },
  itensDescarte: [
    {
      categoria: "NOTEBOOK",
      quantidade: 1,
      condicao: "DANIFICADO"
    }
  ],
  dataAgendada: new Date("2026-10-10T10:00:00.000Z"),
  status: "PENDENTE",
  observacoes: "Coleta de desenvolvimento.",
  createdAt: new Date(),
  updatedAt: new Date(),
  acceptedAt: null,
  startedAt: null,
  collectedAt: null,
  deliveredAt: null,
  completedAt: null
})
```

---

# 68. Inserção de ecoponto fictício

```javascript
db.ecopoints.insertOne({
  nome: "EcoByte",
  descricao: "Ecoponto central de desenvolvimento.",
  endereco: {
    logradouro: "Rua Exemplo",
    numero: "200",
    bairro: "Centro",
    cidade: "Diadema",
    estado: "SP",
    cep: "09900000"
  },
  localizacao: {
    type: "Point",
    coordinates: [
      -46.62,
      -23.68
    ]
  },
  horarios: [],
  status: "ATIVO",
  createdAt: new Date(),
  updatedAt: new Date()
})
```

Os dados são fictícios e devem ser substituídos pelos dados oficialmente definidos pelo projeto quando necessário.

---

# 69. Remoção de documentos em desenvolvimento

A remoção física deve ser utilizada somente em desenvolvimento quando necessário.

Exemplo:

```javascript
db.notifications.deleteOne({
  _id: ObjectId("NOTIFICATION_ID")
})
```

Para dados com importância histórica em produção, preferir desativação lógica.

---

# 70. Remoção em massa

Evitar executar:

```javascript
db.users.deleteMany({})
```

ou operações equivalentes em ambientes que contenham dados importantes.

Operações destrutivas devem possuir confirmação explícita e ser restritas ao ambiente apropriado.

---

# 71. Verificação de quantidade por coleção

```javascript
db.users.countDocuments()
```

```javascript
db.collections.countDocuments()
```

```javascript
db.ecopoints.countDocuments()
```

```javascript
db.notifications.countDocuments()
```

---

# 72. Estatísticas das coleções

```javascript
db.users.stats()
```

```javascript
db.collections.stats()
```

```javascript
db.ecopoints.stats()
```

```javascript
db.notifications.stats()
```

Essas informações são úteis para análise de armazenamento e performance.

---

# 73. Consulta de coleta com cliente e coletor

Exemplo administrativo:

```javascript
db.collections.aggregate([
  {
    $lookup: {
      from: "users",
      localField: "usuarioId",
      foreignField: "_id",
      as: "cliente"
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "coletorId",
      foreignField: "_id",
      as: "coletor"
    }
  },
  {
    $unwind: {
      path: "$cliente",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $unwind: {
      path: "$coletor",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $project: {
      _id: 1,
      status: 1,
      dataAgendada: 1,
      "cliente.nome": 1,
      "cliente.email": 1,
      "coletor.nome": 1,
      "coletor.email": 1
    }
  }
])
```

---

# 74. Relatório de desempenho dos coletores

Exemplo:

```javascript
db.collections.aggregate([
  {
    $match: {
      coletorId: {
        $ne: null
      }
    }
  },
  {
    $group: {
      _id: "$coletorId",
      total: {
        $sum: 1
      },
      concluidas: {
        $sum: {
          $cond: [
            {
              $eq: [
                "$status",
                "CONCLUIDA"
              ]
            },
            1,
            0
          ]
        }
      }
    }
  },
  {
    $sort: {
      concluidas: -1
    }
  }
])
```

O resultado é uma consulta descritiva de dados, não uma avaliação de desempenho individual.

---

# 75. Relatório de descarte por categoria

```javascript
db.collections.aggregate([
  {
    $unwind: "$itensDescarte"
  },
  {
    $group: {
      _id: "$itensDescarte.categoria",
      totalItens: {
        $sum: "$itensDescarte.quantidade"
      },
      totalRegistros: {
        $sum: 1
      }
    }
  },
  {
    $sort: {
      totalItens: -1
    }
  }
])
```

---

# 76. Relatório de descarte por período

```javascript
db.collections.aggregate([
  {
    $match: {
      createdAt: {
        $gte: ISODate("2026-10-01T00:00:00.000Z"),
        $lt: ISODate("2026-11-01T00:00:00.000Z")
      }
    }
  },
  {
    $unwind: "$itensDescarte"
  },
  {
    $group: {
      _id: "$itensDescarte.categoria",
      total: {
        $sum: "$itensDescarte.quantidade"
      }
    }
  },
  {
    $sort: {
      total: -1
    }
  }
])
```

---

# 77. Consultas para dashboard

O dashboard administrativo pode utilizar agregações para obter métricas como:

```text
total de usuários
total de clientes
total de coletores
total de coletas
coletas pendentes
coletas em andamento
coletas concluídas
quantidade de itens descartados
categorias mais registradas
```

Exemplo de total de coletas:

```javascript
db.collections.countDocuments()
```

Exemplo de pendentes:

```javascript
db.collections.countDocuments({
  status: "PENDENTE"
})
```

Exemplo de concluídas:

```javascript
db.collections.countDocuments({
  status: "CONCLUIDA"
})
```

---

# 78. Consultas com `$facet` para dashboard

Exemplo:

```javascript
db.collections.aggregate([
  {
    $facet: {
      total: [
        {
          $count: "value"
        }
      ],
      pendentes: [
        {
          $match: {
            status: "PENDENTE"
          }
        },
        {
          $count: "value"
        }
      ],
      concluidas: [
        {
          $match: {
            status: "CONCLUIDA"
          }
        },
        {
          $count: "value"
        }
      ],
      porStatus: [
        {
          $group: {
            _id: "$status",
            total: {
              $sum: 1
            }
          }
        }
      ]
    }
  }
])
```

---

# 79. Consultas que devem ser evitadas

Evitar consultas indiscriminadas sem filtro em grandes coleções:

```javascript
db.collections.find()
```

quando somente uma pequena quantidade de dados é necessária.

Preferir:

```javascript
find(
  filtro,
  projeção
)
```

e utilizar:

```text
sort
limit
skip
```

quando apropriado.

---

# 80. Evitar excesso de `$lookup`

`$lookup` deve ser utilizado quando a consulta realmente precisar combinar documentos de coleções diferentes.

Não transformar todas as consultas em equivalentes relacionais.

O modelo documental deve continuar sendo aproveitado.

---

# 81. Evitar índices desnecessários

Não criar um índice para cada campo.

Cada índice deve possuir justificativa baseada em consultas reais.

Antes de criar:

```text
identificar query
    ↓
avaliar frequência
    ↓
verificar explain
    ↓
criar índice
    ↓
medir novamente
```

---

# 82. Consultas para auditoria

As consultas abaixo podem ajudar a detectar inconsistências.

## PENDENTE com coletor

```javascript
db.collections.find({
  status: "PENDENTE",
  coletorId: {
    $ne: null
  }
})
```

---

## ACEITA sem coletor

```javascript
db.collections.find({
  status: "ACEITA",
  coletorId: null
})
```

---

## CONCLUIDA sem `completedAt`

```javascript
db.collections.find({
  status: "CONCLUIDA",
  completedAt: null
})
```

---

## RECOLHIDA sem `collectedAt`

```javascript
db.collections.find({
  status: "RECOLHIDA",
  collectedAt: null
})
```

---

## ENTREGUE sem `deliveredAt`

```javascript
db.collections.find({
  status: "ENTREGUE_ECOPONTO",
  deliveredAt: null
})
```

---

## A_CAMINHO sem `startedAt`

```javascript
db.collections.find({
  status: "A_CAMINHO",
  startedAt: null
})
```

---

# 83. Consultas para testes automatizados

Os testes podem utilizar consultas para verificar resultados após operações.

Exemplo:

```javascript
db.collections.findOne({
  _id: ObjectId("COLLECTION_ID")
})
```

Após aceitar:

```javascript
status === "ACEITA"
```

e:

```javascript
coletorId !== null
```

Após iniciar:

```javascript
status === "A_CAMINHO"
```

Após recolher:

```javascript
status === "RECOLHIDA"
```

Após entregar:

```javascript
status === "ENTREGUE_ECOPONTO"
```

Após concluir:

```javascript
status === "CONCLUIDA"
```

---

# 84. Teste de concorrência

Para testar a regra de aceite:

```text
Estado inicial:
PENDENTE
```

Executar simultaneamente duas operações equivalentes a:

```javascript
findOneAndUpdate(
  {
    _id: ObjectId("COLLECTION_ID"),
    status: "PENDENTE"
  },
  {
    $set: {
      status: "ACEITA",
      coletorId: ObjectId("COLLECTOR_ID"),
      acceptedAt: new Date()
    }
  }
)
```

Somente uma deve conseguir modificar o documento de:

```text
PENDENTE
```

para:

```text
ACEITA
```

---

# 85. MongoDB + Mongoose

Quando a aplicação utilizar Mongoose, as consultas de baixo nível não precisam necessariamente aparecer diretamente nos controllers.

Preferir:

```text
Controller
    ↓
Service
    ↓
Model / Repository
    ↓
Mongoose
    ↓
MongoDB
```

Exemplo conceitual:

```javascript
const collection = await Collection.findOne({
  _id: collectionId,
  status: "PENDENTE"
})
```

Para alterações:

```javascript
const updatedCollection =
  await Collection.findOneAndUpdate(
    {
      _id: collectionId,
      status: "PENDENTE"
    },
    {
      $set: {
        status: "ACEITA",
        coletorId: collectorId,
        acceptedAt: new Date(),
        updatedAt: new Date()
      }
    },
    {
      new: true
    }
  )
```

---

# 86. Regra de separação

Consultas MongoDB não devem ser colocadas indiscriminadamente em:

```text
routes
controllers
components React
```

A lógica de acesso a dados deve permanecer na camada apropriada do backend.

---

# 87. Dados de entrada

Nunca montar consultas MongoDB diretamente utilizando entrada não validada do usuário.

Especialmente:

```text
filtros
sort
regex
IDs
query parameters
```

A API deve validar e normalizar os parâmetros antes de utilizá-los.

---

# 88. ObjectId

Quando um identificador estiver armazenado como `ObjectId`, a aplicação deve convertê-lo corretamente.

Exemplo:

```javascript
ObjectId("65f123...")
```

Não tratar indiscriminadamente qualquer string como ObjectId válido.

---

# 89. Datas

Utilizar objetos `Date` no MongoDB.

Exemplo:

```javascript
new Date()
```

ou:

```javascript
ISODate("2026-10-01T00:00:00.000Z")
```

Evitar armazenar datas de negócio como strings arbitrárias.

---

# 90. Performance

Sempre que uma consulta for utilizada frequentemente:

```text
analisar índice
analisar projeção
analisar paginação
analisar explain
```

Evitar retornar documentos gigantescos quando somente alguns campos são necessários.

---

# 91. Segurança

Não executar consultas diretamente com dados não confiáveis.

Evitar:

```javascript
db.users.find(req.query)
```

sem validação e sanitização.

Preferir construir explicitamente o filtro permitido pela API.

---

# 92. Princípio de menor retorno

Uma consulta deve retornar somente os dados necessários para sua finalidade.

Exemplo:

```javascript
db.users.find(
  {
    role: "CLIENTE"
  },
  {
    nome: 1,
    email: 1
  }
)
```

---

# 93. Fonte dos dados

Os dados obtidos por consultas devem continuar refletindo:

```text
Modelo de domínio
    ↓
Regras de negócio
    ↓
Persistência MongoDB
```

As queries não devem criar uma regra de negócio diferente daquela definida em `03_BUSINESS_RULES.md`.

---

# 94. Requisitos acadêmicos atendidos

Este documento deve demonstrar o uso de:

```text
find
findOne
findOneAndUpdate
updateOne
updateMany
countDocuments
sort
skip
limit
$match
$group
$sort
$project
$unwind
$lookup
$facet
$geoNear
$near
```

A utilização final deve permanecer coerente com as necessidades reais do EcoByte.

Não implementar uma consulta apenas para cumprir uma lista de operadores quando ela não possuir finalidade no sistema.

---

# 95. Fonte de verdade

As consultas devem permanecer alinhadas principalmente com:

```text
docs/02_DOMAIN_MODEL.md
docs/03_BUSINESS_RULES.md
docs/04_REQUIREMENTS.md
docs/06_API.md
docs/07_DATABASE_MONGODB.md
```

Quando a estrutura de dados ou uma regra de negócio mudar, revisar as consultas dependentes.

---

# 96. Regra final

As consultas MongoDB devem ser utilizadas para:

```text
persistir
consultar
atualizar
agregar
auditar
relatar
```

os dados reais do EcoByte.

A prioridade é:

```text
consulta correta
    ↓
dados corretos
    ↓
regra de negócio preservada
    ↓
performance adequada
    ↓
documentação atualizada
```

Não criar queries arbitrárias ou desnecessariamente complexas.

Sempre que uma query representar uma regra ou operação importante do sistema, documentar sua finalidade e mantê-la sincronizada com a implementação.